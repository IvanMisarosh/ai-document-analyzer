from app.config import settings
from app.analyzer.service import AnalyzerService
from app.analyzer.pdf_parser import PDFParser
from app.analyzer.llm_analyzer import LLMAnalyzer
from langchain_google_genai import ChatGoogleGenerativeAI
from app.analyzer.concurrency_limiter import ConcurrencyLimiter


def create_analyzer_service() -> AnalyzerService:
    parser = PDFParser()
    llm = get_llm()
    limiter = ConcurrencyLimiter(max_concurrent=settings.LLM_MAX_CONCURRENT_REQUESTS)
    analyzer = LLMAnalyzer(
        llm=llm,
        max_chapter_length=settings.LLM_MAX_CHUNK_LENGTH,
        chunck_text_overlap=settings.LLM_CHUNK_TEXT_OVERLAP,
        limiter=limiter)
    return AnalyzerService(analyzer, parser)


def get_llm() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=settings.LLM_MODEL_NAME,
        temperature=settings.LLM_TEMPERATURE,
        google_api_key=settings.GOOGLE_API_KEY,
    )
