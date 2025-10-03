from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Dict, Optional


def _now_utc() -> datetime:
    return datetime.now(UTC)


@dataclass(slots=True)
class Document:
    document_id: str
    title: str
    text: str
    source_path: Path
    created_at: datetime = field(default_factory=_now_utc)
    metadata: Dict[str, str] = field(default_factory=dict)

    def preview(self, length: int = 200) -> str:
        return self.text[:length]
