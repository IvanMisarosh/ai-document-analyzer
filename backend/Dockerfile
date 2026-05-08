FROM python:3.12-slim

RUN pip install uv

WORKDIR /app

COPY pyproject.toml .
RUN uv sync --no-dev

COPY app ./app
COPY alembic ./alembic
COPY alembic.ini .

ENV PATH="/app/.venv/bin:$PATH"
