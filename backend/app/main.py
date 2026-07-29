from __future__ import annotations

from typing import Any, Dict, List

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .models import Document
from .schemas import (
    AnswerResponse,
    DocumentCreate,
    DocumentDetail,
    DocumentMetadata,
    QuestionRequest,
    SearchRequest,
    SearchResult,
    SummaryRequest,
)
from .services.intelligence_service import IntelligenceService

app = FastAPI(title="AI Document Intelligence", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_service = IntelligenceService()


def _to_metadata(document: Document) -> DocumentMetadata:
    return DocumentMetadata(
        document_id=document.document_id,
        title=document.title,
        created_at=document.created_at,
        metadata=document.metadata,
        preview=document.preview(),
    )


def _to_detail(document: Document) -> DocumentDetail:
    return DocumentDetail(
        document_id=document.document_id,
        title=document.title,
        created_at=document.created_at,
        metadata=document.metadata,
        preview=document.preview(),
        text=document.text,
    )


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/documents", response_model=DocumentMetadata)
def create_document(payload: DocumentCreate) -> DocumentMetadata:
    document = _service.ingest_document(
        title=payload.title,
        text=payload.text,
        metadata=payload.metadata,
    )
    return _to_metadata(document)


@app.get("/documents", response_model=List[DocumentMetadata])
def list_documents() -> List[DocumentMetadata]:
    documents = _service.list_documents()
    documents.sort(key=lambda item: item.created_at, reverse=True)
    return [_to_metadata(document) for document in documents]


@app.get("/documents/{document_id}", response_model=DocumentDetail)
def get_document(document_id: str) -> DocumentDetail:
    try:
        document = _service.get_document(document_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Document not found") from exc
    return _to_detail(document)


@app.delete("/documents/{document_id}", status_code=204, response_model=None)
def delete_document(document_id: str) -> None:
    _service.delete_document(document_id)


@app.post("/documents/upload", response_model=DocumentMetadata)
def upload_document(file: UploadFile = File(...)) -> DocumentMetadata:
    filename = file.filename or "uploaded-document"
    try:
        content = file.file.read()
    finally:
        file.file.close()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="Unsupported file encoding; expected UTF-8 text") from exc
    document = _service.ingest_document(title=filename, text=text, metadata={"source": "upload"})
    return _to_metadata(document)


@app.post("/search", response_model=List[SearchResult])
def search_documents(payload: SearchRequest) -> List[SearchResult]:
    results = _service.search(query=payload.query, top_k=payload.top_k)
    search_results = []
    for document, score, preview in results:
        search_results.append(
            SearchResult(
                document_id=document.document_id,
                title=document.title,
                score=round(score, 4),
                preview=preview,
            )
        )
    return search_results


@app.post("/documents/{document_id}/summary", response_model=List[str])
def summarize_document(document_id: str, payload: SummaryRequest) -> List[str]:
    try:
        return _service.summarize_document(document_id=document_id, max_sentences=payload.max_sentences)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Document not found") from exc


@app.post("/documents/{document_id}/qa", response_model=AnswerResponse)
def ask_question(document_id: str, payload: QuestionRequest) -> AnswerResponse:
    try:
        answer, confidence, context = _service.ask_question(document_id=document_id, question=payload.question)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Document not found") from exc
    if not answer:
        raise HTTPException(status_code=404, detail="No suitable answer found")
    return AnswerResponse(answer=answer, confidence=round(confidence, 4), context=context)
