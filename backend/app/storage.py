"""MinIO object storage client and helpers."""
import uuid
import tempfile
from pathlib import Path
from fastapi import UploadFile
from minio import Minio
from minio.error import S3Error
from app.config import settings

_client: Minio | None = None


def get_client() -> Minio:
    global _client
    if _client is None:
        _client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        _ensure_bucket()
    return _client


def _ensure_bucket() -> None:
    client = Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=settings.MINIO_SECURE,
    )
    try:
        if not client.bucket_exists(settings.MINIO_BUCKET):
            client.make_bucket(settings.MINIO_BUCKET)
    except S3Error:
        pass


async def upload_file(upload_file: UploadFile, user_id: int) -> str:
    """Upload a FastAPI UploadFile to MinIO, return the object key."""
    ext = Path(upload_file.filename).suffix or ".pdf"
    object_key = f"user-{user_id}/{uuid.uuid4().hex}{ext}"

    content = await upload_file.read()
    await upload_file.close()

    import io
    client = get_client()
    client.put_object(
        settings.MINIO_BUCKET,
        object_key,
        io.BytesIO(content),
        length=len(content),
        content_type=upload_file.content_type or "application/pdf",
    )
    return object_key


def download_to_tmp(object_key: str) -> Path:
    """Download an object from MinIO to a temp file; caller must delete it."""
    client = get_client()
    suffix = Path(object_key).suffix or ".pdf"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.close()
    tmp_path = Path(tmp.name)
    client.fget_object(settings.MINIO_BUCKET, object_key, str(tmp_path))
    return tmp_path


def get_presigned_url(object_key: str, expires_seconds: int = 3600) -> str:
    """Return a presigned GET URL valid for the given duration."""
    from datetime import timedelta
    client = get_client()
    return client.presigned_get_object(
        settings.MINIO_BUCKET,
        object_key,
        expires=timedelta(seconds=expires_seconds),
    )
