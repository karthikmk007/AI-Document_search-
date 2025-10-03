from __future__ import annotations

import math
import re
from collections import Counter
from difflib import SequenceMatcher
from typing import List, Sequence, Tuple

from ..models import Document

_TOKEN_PATTERN = re.compile(r"\b\w+\b", re.UNICODE)


def _tokenize(text: str) -> List[str]:
    return [token.lower() for token in _TOKEN_PATTERN.findall(text)]


def _split_sentences(text: str) -> List[str]:
    raw = re.split(r"(?<=[.!?])\s+", text.strip())
    sentences = [sentence.strip() for sentence in raw if sentence.strip()]
    return sentences or ([text.strip()] if text.strip() else [])


def summarize_text(text: str, max_sentences: int = 3) -> List[str]:
    sentences = _split_sentences(text)
    if len(sentences) <= max_sentences:
        return sentences
    tokens = _tokenize(text)
    frequency = Counter(tokens)
    scores = []
    for index, sentence in enumerate(sentences):
        sentence_tokens = _tokenize(sentence)
        if not sentence_tokens:
            continue
        score = sum(frequency[token] for token in sentence_tokens) / len(sentence_tokens)
        scores.append((score, index, sentence))
    if not scores:
        return sentences[:max_sentences]
    scores.sort(key=lambda item: (-item[0], item[1]))
    selected = sorted(scores[:max_sentences], key=lambda item: item[1])
    summary = [sentence for _, _, sentence in selected]
    if sentences:
        lead_sentence = sentences[0]
        if lead_sentence not in summary:
            summary = [lead_sentence] + summary[:-1]
    return summary


def _token_similarity(left: str, right: str) -> float:
    if left == right:
        return 1.0
    return SequenceMatcher(None, left, right).ratio()


def search_documents(query: str, documents: Sequence[Document], top_k: int = 5) -> List[Tuple[Document, float, str]]:
    query_tokens = _tokenize(query)
    if not query_tokens:
        return []
    query_freq = Counter(query_tokens)
    results: List[Tuple[Document, float, str]] = []
    for document in documents:
        doc_tokens = _tokenize(document.text)
        if not doc_tokens:
            continue
        doc_freq = Counter(doc_tokens)
        match_score = 0.0
        for token, qty in query_freq.items():
            best_overlap = 0.0
            for doc_token, doc_qty in doc_freq.items():
                similarity = _token_similarity(token, doc_token)
                if similarity < 0.6:
                    continue
                best_overlap = max(best_overlap, similarity * min(qty, doc_qty))
            match_score += best_overlap
        score = match_score / math.sqrt(len(doc_tokens))
        if score <= 0:
            continue
        summary = summarize_text(document.text, max_sentences=2)
        preview = " ".join(summary) if summary else document.preview()
        results.append((document, score, preview))
    results.sort(key=lambda item: item[1], reverse=True)
    return results[:top_k]


def answer_question(text: str, question: str) -> Tuple[str, float, List[str]]:
    sentences = _split_sentences(text)
    if not sentences:
        return "", 0.0, []
    question_tokens = _tokenize(question)
    if not question_tokens:
        return "", 0.0, []
    question_freq = Counter(question_tokens)
    best_score = 0.0
    best_index = 0
    for index, sentence in enumerate(sentences):
        sentence_tokens = _tokenize(sentence)
        if not sentence_tokens:
            continue
        sentence_freq = Counter(sentence_tokens)
        overlap = sum(min(question_freq[token], sentence_freq[token]) for token in question_freq)
        score = overlap / len(sentence_tokens)
        if score > best_score:
            best_score = score
            best_index = index
    answer = sentences[best_index]
    context_window = sentences[max(0, best_index - 1) : min(len(sentences), best_index + 2)]
    confidence = min(1.0, best_score * len(question_tokens))
    return answer, confidence, context_window
