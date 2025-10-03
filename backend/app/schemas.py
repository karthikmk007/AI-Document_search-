from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class DocumentCreate(BaseModel):
    title: str = Field(..., min_length=1)
    text: str = Field(..., min_length=1)
    metadata: Optional[Dict[str, str]] = None


class DocumentMetadata(BaseModel):
    document_id: str
    title: str
    created_at: datetime
    metadata: Dict[str, str]
    preview: str


class DocumentDetail(DocumentMetadata):
    text: str


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)


class SearchResult(BaseModel):
    document_id: str
    title: str
    score: float
    preview: str


class SummaryRequest(BaseModel):
    max_sentences: int = Field(default=3, ge=1, le=10)


class QuestionRequest(BaseModel):
    question: str = Field(..., min_length=1)


class AnswerResponse(BaseModel):
    answer: str
    confidence: float
    context: List[str]
