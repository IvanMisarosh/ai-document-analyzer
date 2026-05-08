import asyncio
from celery import shared_task
from app.enums import DocumentStatus
from app.db.db import get_db
from app.analyzer.document_repository import DocumentRepository
from app import utils
from app.storage import download_to_tmp


@shared_task(bind=True, name="analyze_document")
def analyze_document(self, document_id: int):
    session = next(get_db())
    document_repo = DocumentRepository(session)
    tmp_path = None
    try:
        doc = document_repo.get_by_id(document_id)
        if not doc:
            return

        document_repo.update_status(doc, DocumentStatus.PROCESSING)

        # Download from MinIO to a local tmp file for PDF parsing
        tmp_path = download_to_tmp(doc.object_key)

        service = utils.create_analyzer_service()

        results = asyncio.run(
            service.analyze(
                pdf_path=str(tmp_path),
                user_context=doc.user_context or ""))

        document_repo.save_clauses(doc, results)
        document_repo.update_status(doc, DocumentStatus.ANALYZED)
    except Exception as e:
        document_repo.update_status(doc, DocumentStatus.FAILED)
        raise e
    finally:
        if tmp_path and tmp_path.exists():
            tmp_path.unlink()
        session.close()
