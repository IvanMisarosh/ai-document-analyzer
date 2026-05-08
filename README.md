# Terms & Conditions Analyzer

LLM-powered analyzer for Terms & Conditions documents. Upload a PDF, the system extracts clauses/chapters, sends them through Google Gemini, and returns risk assessments with key insights.

## Stack

| Layer | Technology |
|-------|-----------|
| API | FastAPI + Uvicorn |
| Worker | Celery (Redis broker) |
| Database | PostgreSQL (SQLAlchemy 2 + Alembic) |
| Clause storage | JSONB column on `documents` table |
| File storage | MinIO (S3-compatible) |
| LLM | Google Gemini via LangChain |
| Frontend | Vite + React + TypeScript + TanStack Query + Tailwind CSS |
| Package manager | `uv` (backend) / `npm` (frontend) |

## Monorepo layout

```
practice/
├── backend/          # FastAPI + Celery
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models.py         # User, Document (JSONB clauses column)
│   │   ├── storage.py        # MinIO client helpers
│   │   ├── tasks.py          # Celery task: download→analyze→save
│   │   ├── analyzer/         # PDF parser, LLM analyzer, routes
│   │   └── auth/             # JWT auth routes + service
│   ├── alembic/              # DB migrations
│   ├── tests/                # pytest (26 tests, no live services needed)
│   ├── pyproject.toml        # uv-managed dependencies
│   └── .env.example
├── frontend/         # Vite + React + TypeScript
│   └── src/
│       ├── api/      # axios client + typed API functions
│       └── pages/    # login, register, upload, list, detail, clauses
└── docker-compose.yml
```

## Quick start (Docker)

```sh
cp backend/.env.example backend/.env
# Edit backend/.env: set GOOGLE_API_KEY and a strong SECRET_KEY
docker compose up --build
```

Services:
- Frontend: http://localhost:5173 (dev) / http://localhost:80 (prod)
- Backend API: http://localhost:8000
- MinIO console: http://localhost:9001 (minioadmin / minioadmin)

Apply migrations on first run:
```sh
docker compose exec backend alembic upgrade head
```

## Local development

### Backend

```sh
cd backend
cp .env.example .env   # fill in values
uv sync
uv run uvicorn app.main:app --reload
# In another terminal:
uv run celery -A app.celery worker --loglevel=info
```

### Frontend

```sh
cd frontend
npm install
npm run dev   # proxies /api → http://localhost:8000
```

### Tests

```sh
cd backend
uv run pytest tests/ -v
```

## API endpoints

### Auth
- `POST /auth/register` — create account
- `POST /auth/token` — get JWT (OAuth2 password form)

### Documents
- `POST /document/` — upload PDF (multipart)
- `GET /documents/` — list user's documents
- `GET /document/{id}` — document detail
- `GET /document/{id}/status` — polling endpoint
- `POST /document/{id}/analyze` — enqueue analysis
- `GET /document/{id}/clauses` — clause analysis results (JSONB)
- `GET /document/{id}/download-url` — presigned MinIO URL

## Environment variables

See `backend/.env.example` for the full list. Required:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_API_KEY` | Gemini API key |
| `SECRET_KEY` | JWT signing key (≥32 chars) |
| `CELERY_BROKER_URL` | Redis URL |
| `CELERY_RESULT_BACKEND` | Redis URL |

MinIO defaults to `minioadmin/minioadmin` on `localhost:9000` (safe for local dev, change in production).

---