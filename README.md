# AI Document Intelligence

AI Document Intelligence is a lightweight knowledge management stack that lets you ingest plain-text documents, search them with natural language prompts, extract short summaries, and answer task-oriented questions. A FastAPI backend handles ingestion, storage, search, and extractive Q&A. A static HTML/JS client offers a simple dashboard for interacting with the service.

## Project layout

```
AI-Document /
├── backend/            # FastAPI application and services
├── data/documents/     # Persisted document payloads and metadata index
├── frontend/           # Static client that talks to the backend REST API
└── README.md
```

## Backend quickstart

1. Create a virtual environment and install dependencies:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   # Optional: testing tools
   pip install -r requirements-dev.txt
   ```

2. Launch the API (reload enabled for local development):
   ```bash
   uvicorn app.main:app --reload
   ```

3. Visit `http://localhost:8000/docs` for interactive OpenAPI documentation.

### API highlights

- `POST /documents` – ingest raw text via JSON payload
- `POST /documents/upload` – upload UTF-8 text files
- `GET /documents` – list stored documents with metadata previews
- `GET /documents/{id}` – fetch full document content
- `POST /search` – keyword-style semantic search with relevance scoring
- `POST /documents/{id}/summary` – extract the top sentences for a document
- `POST /documents/{id}/qa` – extractive question answering using sentence overlap

A seed document is preloaded under `data/documents/` so you can experiment immediately.

### Running tests

```bash
cd backend
python -m pytest
```

If pytest fails because of a local Python tooling conflict (e.g., missing `pygments` styles), reinstall the offending dependency inside the virtual environment: `pip install --upgrade pygments`.

## Frontend quickstart

The `frontend/` folder contains a static client (HTML, CSS, vanilla JavaScript).

1. Start the backend on `http://localhost:8000`.
2. Open `frontend/index.html` in a browser.
3. Upload text files, run free-text searches, preview summaries, and ask questions directly from the page.

To deploy behind a different hostname or port, update `API_BASE` in `frontend/app.js`.

## Extending the system

- Swap the naive text analytics in `backend/app/services/text_analytics.py` with embeddings or LLM-backed pipelines.
- Replace the JSON/flat file repository with a vector database or relational store.
- Harden the frontend by bundling with your favourite framework (React, Vue, Svelte) and adding authentication.

## Troubleshooting

- **Uploads rejected:** Ensure files are UTF-8 encoded text (`.txt`, `.md`, `.json`).
- **No answers returned:** Long-term memory recall relies on sentence overlap; try rephrasing or enriching documents with more context.
- **Tests crash on import:** Activate the virtualenv so pytest and its dependencies are isolated from global site packages.
