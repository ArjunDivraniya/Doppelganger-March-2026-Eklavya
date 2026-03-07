# Backend Setup & Developer Guide

## 🎯 Project Overview
This is the backend API for the Azure AI Code Assistant VS Code extension. It receives code context from the extension and returns AI-generated Azure SDK code suggestions.

---

## 📊 Backend Status Report

### ✅ **COMPLETED** (Backend Developer 1 - Your Work)

The following components are **fully implemented and working**:

#### 1. **Server Setup** (`src/server.js`)
- ✅ Express server with CORS and JSON parsing
- ✅ Request logging middleware
- ✅ Global error handler
- ✅ Health check endpoint (`GET /health`)
- ✅ Server runs on port 3000 (configurable via .env)

#### 2. **Routing Layer** (`src/routes/suggest.js`)
- ✅ POST /suggest endpoint configured
- ✅ Routes connected to controller

#### 3. **Controller** (`src/controllers/suggestController.js`)
- ✅ Complete request handling pipeline
- ✅ Input validation (language, currentLine)
- ✅ 5-step AI suggestion flow:
  1. Context analysis
  2. RAG documentation retrieval
  3. Prompt building
  4. LLM generation
  5. Response processing
- ✅ Error handling and latency tracking

#### 4. **Context Analyzer Service** (`src/services/contextAnalyzer.js`)
- ✅ Detects Azure SDK type (Blob Storage, Cosmos DB, Identity, etc.)
- ✅ Identifies developer intent (create-client, upload, download, etc.)
- ✅ Analyzes code location (variable-declaration, async-call, etc.)
- ✅ Supports JavaScript, TypeScript, C#, Python packages

#### 5. **Prompt Builder Service** (`src/services/promptBuilder.js`)
- ✅ Constructs system and user prompts for LLM
- ✅ Includes retrieved documentation
- ✅ Formats code context properly
- ✅ Optimized for Azure SDK code generation

#### 6. **LLM Service** (`src/services/llmService.js`)
- ✅ Groq API integration (OpenAI-compatible)
- ✅ Uses Llama 3.3 70B model
- ✅ Mock mode for testing without API key
- ✅ Error handling and timeout (15s)
- ✅ Response validation

#### 7. **Response Processor Service** (`src/services/responseProcessor.js`)
- ✅ Strips markdown code fences
- ✅ Removes LLM explanations
- ✅ Returns clean code snippets only

---

### ⏳ **PENDING** (Backend Developer 2 - RAG Implementation)

#### **RAG Service** (`src/services/ragService.js`)
- ⚠️ **Currently:** Uses static placeholder documentation
- 🔧 **Needs:** Real vector search / document retrieval

**What needs to be implemented:**
1. Set up a vector database (Pinecone, Weaviate, Azure AI Search, or FAISS)
2. Embed Azure SDK documentation into the vector store
3. Implement semantic search to retrieve relevant docs based on:
   - `sdkType` (e.g., 'blob-storage', 'cosmos-db')
   - `intent` (e.g., 'create-client', 'upload', 'query')
4. Return top-k relevant documentation chunks
5. Handle edge cases (empty results, errors)

**Current stub interface:**
```javascript
exports.retrieveDocumentation = async (sdkType, intent) => {
    // TODO: Replace with actual RAG retrieval logic
    // 1. Convert sdkType + intent into a query embedding
    // 2. Search vector store for relevant documentation chunks
    // 3. Return the top-k results concatenated
}
```

**Expected output format:**
- Returns a string containing relevant Azure SDK documentation
- Should be 200-500 tokens (not too long for LLM context)

---

## 🚀 How to Run the Backend

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables
```bash
# Copy the example file
copy .env.example .env

# Edit .env and add your Groq API key
```

**Required environment variables:**
```env
PORT=3000
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

> **Note:** If you don't have a Groq API key, the backend will run in **mock mode** with placeholder suggestions.

### Step 3: Start the Server
```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

### Step 4: Test the Health Endpoint
```bash
# In a new terminal or browser
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-07T..."
}
```

### Step 5: Test the Suggest Endpoint
```bash
curl -X POST http://localhost:3000/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "imports": ["@azure/storage-blob"],
    "currentLine": "const blobServiceClient = ",
    "context": "const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;"
  }'
```

Expected response:
```json
{
  "suggestion": "BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)"
}
```

---

## 🧪 Testing the Backend

### Manual Testing
Use curl or Postman to send POST requests to `/suggest` with different scenarios:

1. **Blob Storage Client Creation:**
```json
{
  "language": "javascript",
  "imports": ["@azure/storage-blob"],
  "currentLine": "const blobServiceClient = ",
  "context": ""
}
```

2. **Cosmos DB Query:**
```json
{
  "language": "javascript",
  "imports": ["@azure/cosmos"],
  "currentLine": "const items = await container.items.query(",
  "context": "const container = client.database('mydb').container('mycont');"
}
```

3. **Azure Identity:**
```json
{
  "language": "typescript",
  "imports": ["@azure/identity"],
  "currentLine": "const credential = ",
  "context": ""
}
```

### Validation
- ✅ Server starts without errors
- ✅ `/health` returns 200 OK
- ✅ `/suggest` accepts valid requests
- ✅ `/suggest` returns code suggestions (mock or real)
- ✅ Invalid requests return 400 error
- ✅ Logs show request timestamps and latency

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js                      # Express server setup
│   ├── controllers/
│   │   └── suggestController.js       # Main request handler
│   ├── routes/
│   │   └── suggest.js                 # Route definitions
│   └── services/
│       ├── contextAnalyzer.js         # ✅ Detects SDK & intent
│       ├── promptBuilder.js           # ✅ Builds LLM prompts
│       ├── llmService.js              # ✅ Groq API integration
│       ├── responseProcessor.js       # ✅ Cleans LLM output
│       └── ragService.js              # ⏳ RAG implementation (PENDING)
├── .env                               # Environment variables (create from .env.example)
├── .env.example                       # Example configuration
├── package.json                       # Dependencies
└── BACKEND_SETUP_GUIDE.md            # This file
```

---

## 🔄 Request/Response Flow

```
1. VS Code Extension → POST /suggest
   { language, imports, currentLine, context }

2. Controller validates input
   ↓
3. Context Analyzer detects SDK type & intent
   ↓
4. RAG Service retrieves relevant docs (⏳ PENDING)
   ↓
5. Prompt Builder creates LLM messages
   ↓
6. LLM Service calls Groq API
   ↓
7. Response Processor cleans output
   ↓
8. Controller returns JSON
   { suggestion: "code snippet" }
```

---

## 📝 API Documentation

### `POST /suggest`
Generate an Azure SDK code suggestion.

**Request Body:**
```json
{
  "language": "javascript | typescript | csharp | python",
  "imports": ["@azure/storage-blob", ...],
  "currentLine": "const blobClient = ",
  "context": "// previous code lines (optional)"
}
```

**Response:**
```json
{
  "suggestion": "BlobServiceClient.fromConnectionString(connStr)"
}
```

**Error Response:**
```json
{
  "error": "Missing required fields: 'language' and 'currentLine' are required."
}
```

### `GET /health`
Check if the server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-07T10:30:00.000Z"
}
```

---

## 🎯 Development Checklist

### Backend Developer 1 (You) - ✅ COMPLETE
- [x] Set up Express server
- [x] Configure middleware (CORS, JSON, error handling)
- [x] Create routing structure
- [x] Implement controller with 5-step pipeline
- [x] Build context analyzer
- [x] Build prompt builder
- [x] Integrate Groq API for LLM
- [x] Implement response processor
- [x] Add request logging
- [x] Test with mock data

### Backend Developer 2 (RAG Implementation) - ⏳ TODO
- [ ] Choose vector database (Pinecone, Weaviate, Azure AI Search, FAISS)
- [ ] Set up vector database connection
- [ ] Embed Azure SDK documentation
- [ ] Implement semantic search
- [ ] Replace stub in `ragService.js`
- [ ] Test retrieval accuracy
- [ ] Optimize for latency (<500ms)
- [ ] Handle edge cases

---

## 🛠️ Troubleshooting

### Server won't start
- Check if port 3000 is already in use: `netstat -ano | findstr :3000`
- Try changing PORT in .env

### "GROQ_API_KEY missing" warning
- This is normal if you're testing without an API key
- Backend will use mock mode
- Add a real key to .env to use Groq API

### No suggestions returned
- Check console logs for errors
- Verify request body has `language` and `currentLine`
- Test with curl to isolate extension issues

### LLM timeout
- Groq API has a 15s timeout
- Check your internet connection
- Verify API key is valid

---

## 📞 Support & Next Steps

**Your work is COMPLETE and FUNCTIONAL! ✅**

The backend is ready to:
- Accept code context from the VS Code extension
- Analyze Azure SDK usage
- Generate code suggestions via Groq API
- Return clean code snippets

**Next:** Wait for Backend Developer 2 to implement the RAG service, which will improve suggestion accuracy by retrieving relevant Azure documentation.

**Testing:** You can test the full system now using mock mode or with a real Groq API key.

---

## 🎓 Learning Resources

- [Groq API Documentation](https://console.groq.com/docs/overview)
- [Azure SDK for JavaScript](https://learn.microsoft.com/en-us/javascript/api/overview/azure/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [RAG (Retrieval-Augmented Generation)](https://www.pinecone.io/learn/retrieval-augmented-generation/)

---

**Backend Status:** ✅ **FULLY FUNCTIONAL** (RAG optimization pending)
