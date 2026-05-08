from app.models import Document
from app.enums import DocumentStatus
from app.analyzer import schemas
from sqlalchemy.orm import Session
from typing import Optional, List, Union


class DocumentRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, document_id: int) -> Optional[Document]:
        return self.session.query(Document).filter(Document.id == document_id).first()

    def update_status(self, document: Document, status: DocumentStatus):
        document.status = status
        self.session.commit()

    def save_clauses(
        self,
        document: Document,
        results: Union[List[schemas.ClauseAnalysis], List[schemas.ChapterAnalysis]],
    ) -> None:
        document.clauses = [r.model_dump() for r in results]
        self.session.commit()

    def get_clauses(self, document_id: int) -> Optional[List[dict]]:
        doc = self.get_by_id(document_id)
        if doc is None:
            return None
        return doc.clauses
