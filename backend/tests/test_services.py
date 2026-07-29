from __future__ import annotations

from pathlib import Path

from app.models import Document
from app.repositories.document_repository import DocumentRepository
from app.services.text_analytics import answer_question, search_documents, summarize_text


def test_document_repository_add_and_get(tmp_path):
    data_dir = tmp_path / "docs"
    repo = DocumentRepository(data_dir=data_dir, index_path=data_dir / "index.json")

    created = repo.add_document(title="Sample", text="Hello world", metadata={"tag": "demo"})

    retrieved = repo.get_document(created.document_id)

    assert retrieved.document_id == created.document_id
    assert retrieved.text == "Hello world"
    assert retrieved.metadata["tag"] == "demo"


def test_summarize_text_returns_top_sentences():
    text = (
        "FastAPI enables high-performance services. "
        "It is built atop Starlette and Pydantic. "
        "Developers enjoy automatic docs and easy validation. "
        "This makes it a strong choice for modern backends."
    )

    summary = summarize_text(text, max_sentences=2)

    assert len(summary) == 2
    assert any("FastAPI" in sentence for sentence in summary)


def test_search_documents_ranks_relevant_documents(tmp_path):
    doc1 = Document(
        document_id="1",
        title="AI Planning",
        text="AI systems can summarise documents and answer questions.",
        source_path=tmp_path / "1.txt",
        metadata={},
    )
    doc2 = Document(
        document_id="2",
        title="Gardening",
        text="Garden plants need sunlight and water to grow.",
        source_path=tmp_path / "2.txt",
        metadata={},
    )

    results = search_documents("document question answering", [doc1, doc2], top_k=1)

    assert results
    top_document, score, _ = results[0]
    assert top_document.document_id == "1"
    assert score > 0


def test_answer_question_selects_best_sentence():
    text = (
        "Open source LLMs require fine-tuning for domain accuracy. "
        "They can be paired with retrieval augmented generation for better context."
    )

    answer, confidence, context = answer_question(text, "How can accuracy be improved?")

    assert "retrieval" in answer.lower()
    assert confidence > 0
    assert context
