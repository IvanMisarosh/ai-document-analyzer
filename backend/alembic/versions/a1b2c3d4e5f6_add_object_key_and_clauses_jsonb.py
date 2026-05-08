"""Add object_key and clauses JSONB, drop file_url and Mongo fields

Revision ID: a1b2c3d4e5f6
Revises: ccf72240a3d3
Create Date: 2026-05-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'ccf72240a3d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Replace file_url (filesystem path) with object_key (MinIO key)
    op.add_column('documents', sa.Column('object_key', sa.String(length=500), nullable=True))
    # Copy existing file_url values into object_key so we don't lose data
    op.execute("UPDATE documents SET object_key = file_url WHERE object_key IS NULL")
    op.alter_column('documents', 'object_key', nullable=False)
    op.drop_column('documents', 'file_url')

    # Allow user_context to be NULL (previously NOT NULL)
    op.alter_column('documents', 'user_context', nullable=True)

    # Add JSONB column for clause analysis results
    op.add_column('documents', sa.Column('clauses', JSONB, nullable=True))


def downgrade() -> None:
    op.drop_column('documents', 'clauses')
    op.add_column('documents', sa.Column('file_url', sa.String(length=250), nullable=True))
    op.execute("UPDATE documents SET file_url = object_key WHERE file_url IS NULL")
    op.alter_column('documents', 'file_url', nullable=False)
    op.drop_column('documents', 'object_key')
    op.alter_column('documents', 'user_context', nullable=False)
