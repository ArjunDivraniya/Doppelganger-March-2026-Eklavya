# Backend Implementation Details

This file documents what is currently implemented in the `backend` folder for the Azure AI Code Assistant project.

## 1. Tech Stack and Runtime

- Runtime: Node.js
- API framework: Express
- Module system: CommonJS (`require`, `module.exports`)
- HTTP client: `axios`
- HTML parsing for docs scraping: `cheerio`
- Vector DB client: `chromadb`
- LLM provider for generation: Groq API (OpenAI-compatible endpoint)
- Embeddings provider:
  - Default: local/free deterministic hashing embeddings
  - Optional: OpenAI embeddings (`text-embedding-3-small`)

## 2. Folder-Level Implementation

### `src/server.js`

Implemented:
- Express app initialization
- `cors` and JSON middleware
- request logging middleware
- `GET /health` endpoint
- mount `POST /suggest` route
- global error handler
- server startup logs (including LLM key status)

### `src/routes/suggest.js`

Implemented:
- `POST /suggest` route wiring to controller

### `src/controllers/suggestController.js`

Implemented end-to-end suggestion orchestration:
1. Validates request body (`language`, `currentLine` required)
2. Calls `contextAnalyzer.analyze(...)`
3. Builds retrieval query from analysis + code line
4. Calls `ragService.retrieveRelevantDocs(...)`
5. Builds final prompt via `promptBuilder.buildPrompt(...)`
6. Calls LLM via `llmService.generate(...)`
7. Cleans output with `responseProcessor.process(...)`
8. Returns `{ suggestion }`

Also includes latency and pipeline logging.

## 3. Service Implementations

### `src/services/contextAnalyzer.js`

Implemented:
- Azure SDK detection from imports/context (Blob, Cosmos, Identity, etc.)
- intent detection from heuristics (create-client, upload, query, delete, auth, etc.)
- code location detection (assignment, async-call, declaration, etc.)

Output shape:
- `sdkType`
- `intent`
- `codeLocation`

### `src/services/promptBuilder.js`

Implemented:
- `buildPrompt({ userCode, retrievedDocs })`
- Produces a single instruction prompt containing:
  - assistant role framing
  - retrieved documentation context
  - developer code context
  - task instruction to suggest next Azure SDK snippet

### `src/services/llmService.js`

Implemented:
- Groq chat completion request logic
- configurable model (`GROQ_MODEL`, default `llama-3.3-70b-versatile`)
- `generateCompletion(messages)` and `generate(prompt)` wrapper
- timeout and API error handling
- mock fallback when `GROQ_API_KEY` is missing

### `src/services/responseProcessor.js`

Implemented:
- strips markdown code fences
- removes common explanation/preamble lines
- returns cleaned code-only suggestion text

### `src/services/embeddingService.js`

Implemented provider abstraction for embeddings:
- `EMBEDDING_PROVIDER=local` (default)
  - deterministic, normalized hashed-token embedding
  - free, no API cost
- `EMBEDDING_PROVIDER=openai`
  - uses OpenAI embeddings API model `text-embedding-3-small`

Exposed:
- `createEmbedding(text)`
- `getProvider()`

### `src/services/ragService.js`

Implemented vector retrieval:
- connects to Chroma collection `azure_docs`
- creates query embedding via `embeddingService`
- retrieves top-k documents (default 3)
- returns text chunks for prompt context
- catches retrieval errors and returns `[]`

Notes:
- uses Chroma client with `host`/`port`/`ssl`
- parses `CHROMA_DB_PATH`, defaulting to `http://localhost:8000`

## 4. Data Pipeline Scripts

### `scripts/scrapeDocs.js`

Implemented data preparation stage:
- reads URLs from:
  - preferred: `backend/dataset/urls.txt`
  - fallback: `backend/src/dataset/urls.txt`
- fetches Azure docs pages
- extracts cleaned content from `<main>`
- extracts code snippets from `<pre>/<code>`
- outputs:
  - `backend/dataset/rawDocs.json`
  - `backend/dataset/chunks.json` (approx 500-char chunks)

### `scripts/embedChunks.js`

Implemented embedding ingestion stage:
- loads `backend/dataset/chunks.json`
- creates embeddings via `embeddingService`
- stores vectors in Chroma collection `azure_docs`
- vector payload includes:
  - `id`
  - `embedding`
  - `document`
  - `metadata { source, type }`
- dedupe behavior:
  - fetches existing IDs from collection
  - skips already indexed IDs
- includes batch progress logging and robust error handling

### `scripts/testRagPipeline.js`

Implemented smoke test:
- query: `Upload a file to Azure Blob using DefaultAzureCredential`
- runs retrieval + prompt building + generation
- validates generated suggestion includes required terms

## 5. Dataset State

Current dataset paths used by backend logic:
- `backend/src/dataset/urls.txt` (legacy/fallback path in scraper)
- `backend/dataset/rawDocs.json`
- `backend/dataset/chunks.json`

`urls.txt` was deduplicated to remove repeated URLs.

## 6. Environment Variables

Primary env variables used:

```env
PORT=3000

# LLM generation
GROQ_API_KEY=...
GROQ_MODEL=llama-3.3-70b-versatile

# Embeddings
EMBEDDING_PROVIDER=local
EMBEDDING_DIM=384
OPENAI_API_KEY=...   # required only when EMBEDDING_PROVIDER=openai

# Vector DB
CHROMA_DB_PATH=http://localhost:8000
```

Behavior summary:
- If `EMBEDDING_PROVIDER=local`, embedding works without OpenAI billing.
- If `EMBEDDING_PROVIDER=openai`, OpenAI key and quota are required.
- If `GROQ_API_KEY` is missing, generation falls back to mock responses.

## 7. NPM Scripts

From `backend`:

- `npm run dev` -> start API with nodemon
- `npm start` -> start API
- `npm run embed:chunks` -> ingest chunk embeddings into Chroma
- `npm run test:rag` -> run end-to-end RAG smoke test

## 8. API Endpoints

### `GET /health`
Returns server status and timestamp.

### `POST /suggest`
Request body:

```json
{
  "language": "javascript",
  "imports": ["@azure/storage-blob"],
  "currentLine": "const blobServiceClient = ",
  "context": "const credential = new DefaultAzureCredential();"
}
```

Response body:

```json
{
  "suggestion": "...generated code..."
}
```

## 9. Current Operational Notes

- Chroma server must be running and reachable at `CHROMA_DB_PATH`.
- Local embedding mode avoids OpenAI quota errors for ingestion/retrieval.
- Groq API key is still needed for real model generation.
- If keys are missing, system can still run in mock generation mode.

## 10. Recommended Run Order

1. Start Chroma server
2. Ensure `.env` is set (`EMBEDDING_PROVIDER=local` recommended)
3. Build vectors:

```bash
npm run embed:chunks
```

4. Verify pipeline:

```bash
npm run test:rag
```

5. Run backend:

```bash
npm run dev
```

## 11. Implemented Files Summary

Implemented and actively used backend files:
- `src/server.js`
- `src/routes/suggest.js`
- `src/controllers/suggestController.js`
- `src/services/contextAnalyzer.js`
- `src/services/promptBuilder.js`
- `src/services/llmService.js`
- `src/services/responseProcessor.js`
- `src/services/ragService.js`
- `src/services/embeddingService.js`
- `scripts/scrapeDocs.js`
- `scripts/embedChunks.js`
- `scripts/testRagPipeline.js`
- `src/dataset/urls.txt`
- `dataset/rawDocs.json`
- `dataset/chunks.json`
