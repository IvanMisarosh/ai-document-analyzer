from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "LLM-Powered Terms & Conditions Analyzer"
    DATABASE_URL: str
    GOOGLE_API_KEY: str

    # Celery configuration
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    # Redis configuration
    REDIS_URL: str = "redis://localhost:6380/0"

    # MinIO / object storage
    MINIO_ENDPOINT: str = "localhost:9002"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "documents"
    MINIO_SECURE: bool = False

    # Authentication settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # LLM settings
    LLM_MODEL_NAME: str = "gemini-3.1-flash-lite"
    LLM_TEMPERATURE: float = 0.2
    LLM_MAX_CHUNK_LENGTH: int = 8000
    LLM_CHUNK_TEXT_OVERLAP: int = 150

    LLM_REQUESTS_PER_MINUTE: int = 30
    LLM_LIMIT_KEY: str = "llm"
    LLM_MAX_CONCURRENT_REQUESTS: int = 2
    MAX_RETRIES: int = 4
    RETRY_BACKOFF_BASE: int = 5

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
