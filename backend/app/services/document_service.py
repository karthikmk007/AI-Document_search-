from __future__ import annotations

from typing import Dict, List

from ..models import Document
from ..repositories.document_repository import DocumentRepository


class DocumentService:
    def __init__(self, repository: DocumentRepository | None = None) -> None:
        self._repository = repository or DocumentRepository()

    def ingest_document(self, title: str, text: str, metadata: Dict[str, str] | None = None) -> Document:
        return self._repository.add_document(title=title, text=text, metadata=metadata)

    def upsert_document(self, document_id: str, title: str, text: str, metadata: Dict[str, str] | None = None) -> Document:
        return self._repository.upsert_document(document_id=document_id, title=title, text=text, metadata=metadata)

    def list_documents(self) -> List[Document]:
        return self._repository.list_documents()

    def get_document(self, document_id: str) -> Document:
        return self._repository.get_document(document_id)

    def delete_document(self, document_id: str) -> None:
        self._repository.delete_document(document_id)
