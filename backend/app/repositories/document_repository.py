from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Dict, List

from ..config import DATA_DIR
from ..models import Document


class DocumentRepository:
    def __init__(self, data_dir: Path = DATA_DIR, index_path: Path | None = None) -> None:
        self._data_dir = data_dir
        self._index_path = index_path or (self._data_dir / "index.json")
        self._data_dir.mkdir(parents=True, exist_ok=True)
        self._index_path.parent.mkdir(parents=True, exist_ok=True)
        self._index: Dict[str, Dict[str, str]] = self._load_index()

    def _load_index(self) -> Dict[str, Dict[str, str]]:
        if not self._index_path.exists():
            return {}
        try:
            with self._index_path.open("r", encoding="utf-8") as handle:
                data = json.load(handle)
        except json.JSONDecodeError:
            data = {}
        return data

    def _persist_index(self) -> None:
        with self._index_path.open("w", encoding="utf-8") as handle:
            json.dump(self._index, handle, indent=2)

    def add_document(self, title: str, text: str, metadata: Dict[str, str] | None = None) -> Document:
        document_id = uuid.uuid4().hex
        file_path = self._data_dir / f"{document_id}.txt"
        file_path.write_text(text, encoding="utf-8")
        created_at = datetime.now(UTC).isoformat()
        record = {
            "title": title,
            "path": str(file_path),
            "created_at": created_at,
            "metadata": metadata or {},
        }
        self._index[document_id] = record
        self._persist_index()
        return self._record_to_document(document_id, record, text)

    def list_documents(self) -> List[Document]:
        return [self._record_to_document(doc_id, record) for doc_id, record in self._index.items()]

    def get_document(self, document_id: str) -> Document:
        record = self._index.get(document_id)
        if not record:
            raise KeyError(document_id)
        return self._record_to_document(document_id, record)

    def upsert_document(self, document_id: str, title: str, text: str, metadata: Dict[str, str] | None = None) -> Document:
        file_path = self._data_dir / f"{document_id}.txt"
        created_at = datetime.now(UTC).isoformat()
        file_path.write_text(text, encoding="utf-8")
        record = {
            "title": title,
            "path": str(file_path),
            "created_at": created_at,
            "metadata": metadata or {},
        }
        self._index[document_id] = record
        self._persist_index()
        return self._record_to_document(document_id, record, text)

    def _record_to_document(self, document_id: str, record: Dict[str, str], text: str | None = None) -> Document:
        file_path = Path(record["path"])
        if text is None and file_path.exists():
            text = file_path.read_text(encoding="utf-8")
        if text is None:
            text = ""
        raw_created = record["created_at"]
        try:
            created_at = datetime.fromisoformat(raw_created)
        except ValueError:
            if raw_created.endswith("Z"):
                created_at = datetime.fromisoformat(raw_created[:-1] + "+00:00")
            else:
                raise
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=UTC)
        metadata = record.get("metadata", {})
        return Document(
            document_id=document_id,
            title=record["title"],
            text=text,
            source_path=file_path,
            created_at=created_at,
            metadata=metadata,
        )

    def delete_document(self, document_id: str) -> None:
        record = self._index.pop(document_id, None)
        if record:
            file_path = Path(record["path"])
            if file_path.exists():
                file_path.unlink()
            self._persist_index()
