from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.db import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)

    documents = relationship("Document", back_populates="user")


class Document(Base):
    __tablename__ = 'documents'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    user_context = Column(String(500), nullable=True)
    # MinIO object key (e.g. "user-1/uuid.pdf")
    object_key = Column(String(500), nullable=False)
    status = Column(String(50), nullable=False)
    # Analysis results stored as JSONB; null until analysis completes
    clauses = Column(JSONB, nullable=True)

    user = relationship("User", back_populates="documents")
