# AI Document Intelligence

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue)](.github/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A lightweight knowledge-management stack that lets you ingest plain-text documents, search them with natural language prompts, extract summaries, and answer task-oriented questions. The backend is powered by FastAPI and simple extractive heuristics; the frontend is a static HTML/JavaScript dashboard that speaks to the REST API.

## Features
- 🚀 FastAPI backend with interactive OpenAPI docs (`/docs`).
- 📂 File upload and JSON ingestion endpoints with metadata support.
- 🔎 Keyword-style semantic search with relevance scoring and previews.
- 📝 Extractive summaries constrained by sentence count.
- ❓ Task-oriented Q&A that surfaces the best-matching sentence with confidence.
- 🎨 Minimal frontend for uploads, search, summaries, and Q&A calls.

## Architecture
- **Backend:** FastAPI service with an in-memory/indexed document repository and lightweight NLP utilities (see [`backend/app/services`](backend/app/services)).
- **Storage:** JSON index and persisted documents under [`data/documents`](data/documents/).
- **Frontend:** Static HTML/CSS/JS client that targets the REST API (`frontend/`).

```
AI-Document_search-/
├── backend/            # FastAPI application and services
├── data/documents/     # Persisted document payloads and metadata index
├── frontend/           # Static client that talks to the backend REST API
└── README.md
```

## Quickstart

### Prerequisites
- Python 3.11+
- (Optional) A modern browser for the static frontend

### Backend
1. Create a virtual environment and install dependencies:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   # Optional: developer tooling
   pip install -r requirements-dev.txt
   ```
2. Launch the API with reload for local development:
   ```bash
   uvicorn app.main:app --reload
   ```
3. Open http://localhost:8000/docs to explore and try the endpoints.

Common API calls:
```bash
# Ingest a document directly
curl -X POST http://localhost:8000/documents \
  -H "Content-Type: application/json" \
  -d '{"title": "Notes", "text": "Hello world", "metadata": {"tag": "demo"}}'

# Search across stored documents
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "document question answering", "top_k": 3}'
```

### Frontend
1. Start the backend on http://localhost:8000.
2. Open `frontend/index.html` in your browser.
3. Upload text files, run free-text searches, preview summaries, and ask questions directly from the page.
4. To point to a different API host/port, update `API_BASE` in [`frontend/app.js`](frontend/app.js).

## Testing
Run the backend test suite (uses `pytest`):
```bash
cd backend
python -m pytest
```

## Deployment notes
- The service is dependency-light and can run anywhere Python is available (Docker, VM, or PaaS).
- For production, consider swapping the naive text analytics (`backend/app/services/text_analytics.py`) for embeddings/LLM pipelines and securing the API with authentication.

## Contributing
Issues and pull requests are welcome! Please include tests for new functionality and keep FastAPI response models consistent with the schemas defined in [`backend/app/schemas.py`](backend/app/schemas.py).

## License
This project is licensed under the [MIT License](LICENSE).
