# AI Document Intelligence

A local document-search application with a FastAPI backend and a lightweight HTML/JavaScript client. It supports text ingestion, keyword-based retrieval, extractive summaries, and extractive question answering without requiring a hosted LLM.

## Features

- ingest text through JSON or UTF-8 file upload;
- persist document content and metadata locally;
- search documents with relevance scores;
- generate extractive sentence summaries;
- answer questions using sentence overlap;
- inspect and test the REST API through OpenAPI docs.

> The current implementation uses deterministic text analysis—not embeddings, semantic vector search, or generative AI. That makes it inexpensive and easy to run, but less capable on paraphrases and complex questions.

## Architecture

```text
Static web client
       │ REST
       ▼
FastAPI routes
       │
Intelligence service
       ├── local document repository
       └── deterministic text analytics
```

## Run locally

```bash
git clone https://github.com/karthikmk007/AI-Document_search-.git
cd AI-Document_search-/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs`. To use the web client, open `frontend/index.html` while the API is running.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/documents` | Ingest text |
| POST | `/documents/upload` | Upload UTF-8 text |
| GET | `/documents` | List documents |
| GET | `/documents/{id}` | Read one document |
| DELETE | `/documents/{id}` | Delete one document |
| POST | `/search` | Search documents |
| POST | `/documents/{id}/summary` | Extract summary sentences |
| POST | `/documents/{id}/qa` | Extract an answer |

## Tests

```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest
```

## Limitations and roadmap

Local flat-file persistence and open CORS are suitable for a demo, not production. Strong next steps are authentication, restricted CORS, a database, embeddings with a vector index, evaluation datasets, and CI.
