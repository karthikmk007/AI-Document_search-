const API_BASE = 'http://localhost:8000';

let currentDocumentId = null;

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return response.json();
}

function renderDocuments(documents) {
  const list = document.getElementById('document-list');
  list.innerHTML = '';
  documents.forEach((doc) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${doc.title}</strong><br><small>${new Date(doc.created_at).toLocaleString()}</small>`;
    item.addEventListener('click', () => loadDocumentDetail(doc.document_id));
    list.appendChild(item);
  });
}

async function refreshDocuments() {
  try {
    const documents = await fetchJSON(`${API_BASE}/documents`);
    renderDocuments(documents);
  } catch (error) {
    console.error('Failed to load documents', error);
  }
}

async function handleSearch(event) {
  event.preventDefault();
  const query = document.getElementById('search-query').value.trim();
  if (!query) return;
  const resultsList = document.getElementById('search-results');
  resultsList.innerHTML = '<li>Searching…</li>';
  try {
    const payload = { query, top_k: 5 };
    const results = await fetchJSON(`${API_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    resultsList.innerHTML = '';
    if (!results.length) {
      resultsList.innerHTML = '<li>No results found.</li>';
      return;
    }
    results.forEach((result) => {
      const item = document.createElement('li');
      item.innerHTML = `<strong>${result.title}</strong><br><small>Score: ${result.score}</small><p>${result.preview}</p>`;
      item.addEventListener('click', () => loadDocumentDetail(result.document_id));
      resultsList.appendChild(item);
    });
  } catch (error) {
    resultsList.innerHTML = `<li class="error">${error.message}</li>`;
  }
}

async function loadDocumentDetail(documentId) {
  try {
    const detail = await fetchJSON(`${API_BASE}/documents/${documentId}`);
    currentDocumentId = documentId;
    document.getElementById('document-detail').hidden = false;
    document.getElementById('detail-title').textContent = detail.title;
    document.getElementById('detail-meta').textContent = `Created: ${new Date(detail.created_at).toLocaleString()}`;
    document.getElementById('detail-text').textContent = detail.text;
    document.getElementById('summary-list').innerHTML = '';
    document.getElementById('qa-response').innerHTML = '';
  } catch (error) {
    console.error('Unable to load document', error);
  }
}

async function fetchSummary() {
  if (!currentDocumentId) return;
  const summaryList = document.getElementById('summary-list');
  summaryList.innerHTML = '<li>Summarising…</li>';
  try {
    const payload = { max_sentences: 3 };
    const sentences = await fetchJSON(`${API_BASE}/documents/${currentDocumentId}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    summaryList.innerHTML = '';
    sentences.forEach((sentence) => {
      const item = document.createElement('li');
      item.textContent = sentence;
      summaryList.appendChild(item);
    });
  } catch (error) {
    summaryList.innerHTML = `<li class="error">${error.message}</li>`;
  }
}

async function handleQuestion(event) {
  event.preventDefault();
  if (!currentDocumentId) return;
  const question = document.getElementById('qa-question').value.trim();
  if (!question) return;
  const responseContainer = document.getElementById('qa-response');
  responseContainer.textContent = 'Thinking…';
  try {
    const payload = { question };
    const answer = await fetchJSON(`${API_BASE}/documents/${currentDocumentId}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    responseContainer.innerHTML = `
      <p><strong>Answer:</strong> ${answer.answer}</p>
      <p><strong>Confidence:</strong> ${(answer.confidence * 100).toFixed(1)}%</p>
      <p><strong>Context:</strong> ${answer.context.join(' ')}</p>
    `;
  } catch (error) {
    responseContainer.textContent = error.message;
  }
}

async function handleUpload(event) {
  event.preventDefault();
  const fileInput = document.getElementById('upload-file');
  if (!fileInput.files.length) return;
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  const status = document.getElementById('upload-status');
  status.textContent = 'Uploading…';
  try {
    await fetchJSON(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    status.textContent = 'Upload successful';
    fileInput.value = '';
    refreshDocuments();
  } catch (error) {
    status.textContent = error.message;
  }
}

function closeDetail() {
  document.getElementById('document-detail').hidden = true;
  currentDocumentId = null;
}

function bindEvents() {
  document.getElementById('search-form').addEventListener('submit', handleSearch);
  document.getElementById('refresh-documents').addEventListener('click', refreshDocuments);
  document.getElementById('upload-form').addEventListener('submit', handleUpload);
  document.getElementById('fetch-summary').addEventListener('click', fetchSummary);
  document.getElementById('qa-form').addEventListener('submit', handleQuestion);
  document.getElementById('close-detail').addEventListener('click', closeDetail);
}

window.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  refreshDocuments();
});
