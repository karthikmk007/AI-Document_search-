from __future__ import annotations

from typing import Dict, List

from ..models import Document
from .document_service import DocumentService
from .text_analytics import answer_question, search_documents, summarize_text


class IntelligenceService:
    def __init__(self, document_service: DocumentService | None = None) -> None:
        self._document_service = document_service or DocumentService()

    def ingest_document(self, title: str, text: str, metadata: Dict[str, str] | None = None) -> Document:
        return self._document_service.ingest_document(title=title, text=text, metadata=metadata)

    def list_documents(self) -> List[Document]:
        return self._document_service.list_documents()

    def get_document(self, document_id: str) -> Document:
        return self._document_service.get_document(document_id)

    def delete_document(self, document_id: str) -> None:
        self._document_service.delete_document(document_id)

    def summarize_document(self, document_id: str, max_sentences: int) -> List[str]:
        document = self._document_service.get_document(document_id)
        return summarize_text(document.text, max_sentences=max_sentences)

    def ask_question(self, document_id: str, question: str):
        document = self._document_service.get_document(document_id)
        return answer_question(document.text, question)

    def search(self, query: str, top_k: int):
        documents = self._document_service.list_documents()
        return search_documents(query, documents, top_k=top_k)
