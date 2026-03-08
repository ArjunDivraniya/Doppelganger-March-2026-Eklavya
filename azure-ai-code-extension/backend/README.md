# Azure AI Code Assistant Backend

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![ChromaDB](https://img.shields.io/badge/Vector%20DB-Chroma-orange)
![LLM](https://img.shields.io/badge/LLM-Groq%20Llama-blue)

Backend API for the Azure AI Code Assistant extension. It receives editor context, performs Azure intent analysis, retrieves docs via RAG, generates code suggestions, and stores developer feedback.

## What This Service Does
- Exposes `POST /suggest` for AI code completion.
- Exposes `POST /feedback` for suggestion quality feedback.
- Exposes `GET /health` for readiness checks.
- Uses a 5-step suggestion pipeline:
  1. Context analysis
  2. RAG doc retrieval
  3. Prompt building
  4. LLM generation
  5. Response post-processing

## Tech Stack
- Runtime: Node.js + Express
- Database: MongoDB (feedback storage)
- Vector Store: ChromaDB
- Embeddings: Local (`@chroma-core/default-embed`) or OpenAI
- LLM: Groq API (`llama-3.3-70b-versatile` by default)

## Project Structure
```text
backend/
├── src/
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── suggestController.js
│   │   └── feedbackController.js
│   ├── routes/
│   │   ├── suggest.js
│   │   └── feedback.js
│   ├── models/
│   │   └── Feedback.js
│   └── services/
│       ├── contextAnalyzer.js
│       ├── embeddingService.js
│       ├── llmService.js
│       ├── promptBuilder.js
│       ├── ragService.js
│       └── responseProcessor.js
├── scripts/
│   ├── embedChunks.js
│   ├── testRagPipeline.js
│   └── testSdkFiltering.js
├── dataset/
│   ├── chunks.json
│   └── rawDocs.json
├── .env.example
└── package.json
```

## API Endpoints

### `GET /health`
Returns service status.

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-08T12:34:56.000Z"
}
```

### `POST /suggest`
Generates an Azure SDK suggestion from editor context.

Request body:
```json
{
  "language": "typescript",
  "imports": ["@azure/storage-blob"],
  "currentLine": "const blobServiceClient = new",
  "context": "const credential = new DefaultAzureCredential();",
  "cursorPosition": { "line": 14, "character": 32 }
}
```

Response:
```json
{
  "suggestion": "const blobServiceClient = new BlobServiceClient(...)"
}
```

Validation rules:
- `language` is required.
- `currentLine` is required.

### `POST /feedback`
Stores developer feedback for a suggestion.

Request body:
```json
{
  "suggestion": "const client = ...",
  "rating": "positive",
  "sdkType": "blob-storage",
  "intent": "upload-data",
  "language": "typescript"
}
```

Validation rules:
- `suggestion` is required.
- `rating` must be `positive` or `negative`.

Response:
```json
{
  "message": "Feedback stored successfully"
}
```

## Suggestion Pipeline
```text
VS Code Extension
    -> POST /suggest
        -> contextAnalyzer.analyze(...)
        -> ragService.retrieveRelevantDocs(...)
        -> promptBuilder.buildPrompt(...)
        -> llmService.generate(...)
        -> responseProcessor.process(...)
    <- { suggestion }
```

## Environment Setup
Create `.env` in `backend/` based on `.env.example`:

```env
PORT=3000
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
OPENAI_API_KEY=your_openai_key_if_using_openai_embeddings
EMBEDDING_PROVIDER=local
EMBEDDING_DIM=384
CHROMA_DB_PATH=http://localhost:8000
MONGO_URI=mongodb://localhost:27017/azure-ai-assistant
```

Notes:
- If `GROQ_API_KEY` is missing, the LLM service falls back to mock suggestion mode.
- If `EMBEDDING_PROVIDER=local`, OpenAI key is not required for embeddings.
- MongoDB is required for feedback persistence.

## Run Locally
From `backend/`:

```bash
npm install
npm run dev
```

Production start:
```bash
npm start
```

## RAG Commands
From `backend/`:

```bash
npm run embed:chunks
npm run test:rag
npm run test:filtering
```

## Quick cURL Tests

Health:
```bash
curl http://localhost:3000/health
```

Suggest:
```bash
curl -X POST http://localhost:3000/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "language":"javascript",
    "imports":["@azure/storage-blob"],
    "currentLine":"const blobServiceClient = new",
    "context":""
  }'
```

Feedback:
```bash
curl -X POST http://localhost:3000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "suggestion":"const client = ...",
    "rating":"positive",
    "sdkType":"blob-storage",
    "intent":"create-client"
  }'
```

## Troubleshooting
- `MONGO_URI is missing`: add `MONGO_URI` in `.env`.
- `Groq API error`: verify `GROQ_API_KEY` and model name.
- `RAG retrieval failed`: ensure ChromaDB is running and `CHROMA_DB_PATH` is reachable.
- Empty suggestions: inspect logs from `suggestController`, `ragService`, and `llmService`.

## Related Docs
- `BACKEND_SETUP_GUIDE.md`
- `BACKEND_IMPLEMENTATION_DETAILS.md`
- `RAG_PIPELINE_SETUP.md`
