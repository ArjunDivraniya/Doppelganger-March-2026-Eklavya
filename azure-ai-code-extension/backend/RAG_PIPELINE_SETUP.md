# RAG Pipeline Setup (Azure SDK Suggestions)

This document summarizes what was implemented for the Retrieval-Augmented Generation (RAG) pipeline and how to run it.

## What Was Implemented

### 1. Embedding Ingestion Script

- File: `backend/scripts/embedChunks.js`
- Purpose:
  - Loads `backend/dataset/chunks.json`
  - Generates embeddings using OpenAI model `text-embedding-3-small`
  - Stores vectors in ChromaDB collection `azure_docs`

Stored vector payload:

```json
{
  "id": "chunk.id",
  "embedding": [0.123, 0.456],
  "document": "chunk.text",
  "metadata": {
    "source": "chunk.source",
    "type": "chunk.type"
  }
}
```

Behavior:
- Uses async/await
- Logs progress per batch
- Handles embedding errors per chunk
- Skips duplicates by checking existing IDs

### 2. Retrieval Function

- File: `backend/src/services/ragService.js`
- Added function: `retrieveRelevantDocs(query)`

Flow:
1. Create query embedding using OpenAI
2. Query Chroma collection `azure_docs`
3. Return top 3 relevant chunk texts

### 3. Suggestion Endpoint Integration

- File: `backend/src/controllers/suggestController.js`

Current flow:
1. Analyze code context
2. Retrieve docs from vector DB using RAG
3. Build prompt with retrieved docs + user code
4. Generate suggestion from LLM
5. Post-process suggestion and return response

### 4. Prompt Builder Update

- File: `backend/src/services/promptBuilder.js`
- Added `buildPrompt({ userCode, retrievedDocs })`

Template:
- You are an expert Azure SDK assistant
- Include documentation context
- Include developer code context
- Ask model to suggest next Azure SDK code snippet

### 5. End-to-End Smoke Test

- File: `backend/scripts/testRagPipeline.js`
- Test query:
  - `Upload a file to Azure Blob using DefaultAzureCredential`
- Validates suggestion includes:
  - `BlobServiceClient`
  - `DefaultAzureCredential`
  - `containerClient`
  - upload-related call

## Environment Variables

Configured in `backend/.env.example`:

```env
PORT=3000
GROQ_API_KEY=api
GROQ_MODEL=llama-3.3-70b-versatile
OPENAI_API_KEY=your_openai_api_key_here
CHROMA_DB_PATH=http://localhost:8000
```

Notes:
- `OPENAI_API_KEY` is required for embeddings and retrieval.
- `CHROMA_DB_PATH` should point to a reachable Chroma endpoint with the current client setup.

## NPM Commands

From `backend` directory:

```bash
npm install
npm run embed:chunks
npm run test:rag
npm run dev
```

## Quick Run Order

1. Ensure `backend/dataset/chunks.json` exists.
2. Set env vars (`OPENAI_API_KEY`, `CHROMA_DB_PATH`, and LLM keys).
3. Run ingestion: `npm run embed:chunks`
4. Run smoke test: `npm run test:rag`
5. Start API: `npm run dev`

## Files Updated for RAG

- `backend/scripts/embedChunks.js`
- `backend/scripts/testRagPipeline.js`
- `backend/src/services/ragService.js`
- `backend/src/services/promptBuilder.js`
- `backend/src/controllers/suggestController.js`
- `backend/src/services/llmService.js`
- `backend/package.json`
- `backend/.env.example`
