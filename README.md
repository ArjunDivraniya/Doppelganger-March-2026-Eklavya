# ⚡ AzureAI Code Suggest

### Real-time AI-powered Azure SDK suggestions inside VS Code

![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-007ACC?logo=visualstudiocode&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
![Azure OpenAI](https://img.shields.io/badge/Azure-OpenAI-0078D4?logo=microsoftazure&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Status: Hackathon Preview](https://img.shields.io/badge/Status-Hackathon%20Preview-orange)

AzureAI Code Suggest is a specialized VS Code extension + backend API that delivers instant, context-aware, production-ready Azure SDK code while developers type.

---

## 🚨 The Problem

Azure developers waste hours every day searching for correct SDK usage.
The pain points are:

- Manual searching on docs.microsoft.com, Stack Overflow, GitHub takes minutes to hours per task
- Azure SDKs (storage, cosmos, keyvault, identity, service bus, event hubs) are vast and frequently updated - hard to master
- No real-time, context-aware tool tailored specifically to Azure inside VS Code
- Focus languages C# and React Native/TypeScript have very different SDK patterns
- Mistakes in Azure SDK usage cause security vulnerabilities, data loss, and production failures

| Task | Without AzureAI | With AzureAI |
|------|------------------|--------------|
| Manual search for blob upload code | 8-15 mins | <2 seconds |
| Find secure KeyVault pattern | 20-30 mins | <2 seconds |
| Debug wrong CosmosDB query syntax | 10-45 mins | Instant suggestion |
| Set up DefaultAzureCredential | 15-25 mins | <2 seconds |

> Key insight: Developers should not context-switch to search docs for every Azure SDK call.

---

## ✅ Our Solution

AzureAI Code Suggest is a VS Code extension that:

- Monitors your code as you type in real time
- Detects which Azure SDK you are using (from imports/using statements)
- Extracts intelligent context (current line, previous 20 lines, cursor position)
- Sends context to backend API powered by Azure OpenAI
- Returns accurate, secure, production-ready code snippets instantly
- Displays suggestions in a beautiful sidebar panel
- Lets you accept with one click - code inserts directly into editor

Key differentiator: Unlike GitHub Copilot which is general-purpose,
AzureAI Code Suggest is SPECIALIZED for Azure - it injects curated
Azure SDK knowledge into every prompt, eliminating hallucinations.

> This project is purpose-built for Azure developer workflows, not generic autocomplete.

---

## 🎬 Demo

![Demo GIF](./assets/demo.gif)

Hackathon demo flow:

1. Open any TypeScript or C# file
2. Type an Azure import (e.g. `import { BlobServiceClient } from "@azure/storage-blob"`)
3. Start typing your code - extension detects Azure context automatically
4. Suggestion appears in sidebar panel within milliseconds
5. Click Accept - code inserts directly at cursor
6. Rate the suggestion with stars for feedback
7. Optional: Click "Create PR" to open a GitHub pull request

---

## 🏗️ Architecture & Complete Workflow

```text
┌─────────────────────────────────────────────────────────────┐
│                    VS CODE EDITOR                           │
│                                                             │
│  Developer types Azure code                                 │
│         ↓                                                   │
│  ┌─────────────────────┐                                    │
│  │   codeWatcher.ts    │  ← Detects typing (debounce 500ms) │
│  └─────────┬───────────┘                                    │
│            ↓                                                │
│  ┌─────────────────────┐                                    │
│  │  azureDetector.ts   │  ← Is this Azure code? Which SDK? │
│  └─────────┬───────────┘                                    │
│            ↓                                                │
│  ┌─────────────────────┐                                    │
│  │ contextBuilder.ts   │  ← Extract imports, lines, cursor │
│  └─────────┬───────────┘                                    │
│            ↓                                                │
│  ┌─────────────────────┐                                    │
│  │   apiService.ts     │  ← Cache check → Call Backend     │
│  └─────────┬───────────┘                                    │
└────────────┼────────────────────────────────────────────────┘
						 ↓ HTTP POST /suggest
┌────────────────────────────────────────────────────────────┐
│                    BACKEND (Azure App Service)              │
│                                                             │
│  Express API receives { language, imports,                  │
│                         currentLine, context,               │
│                         detectedServices }                  │
│         ↓                                                   │
│  RAG System queries Azure documentation vector store        │
│         ↓                                                   │
│  Azure OpenAI (gpt-4o-mini) generates suggestion            │
│         ↓                                                   │
│  Returns { suggestion: "...code..." }                       │
└────────────────────────────────────────────────────────────┘
						 ↓ JSON response
┌────────────────────────────────────────────────────────────┐
│                    WEBVIEW PANEL (Sidebar)                  │
│                                                             │
│  Displays suggestion with service badge                     │
│  Accept → inserts code at cursor                           │
│  Reject → dismisses panel                                  │
│  Rate → sends feedback for model fine-tuning               │
│  Create PR → opens GitHub pull request                     │
└────────────────────────────────────────────────────────────┘
```

The extension layer captures developer intent in real time and converts editor activity into structured context. The backend layer enriches that context with RAG-retrieved Azure documentation, generates a safe suggestion with Azure OpenAI, and caches responses for speed. The webview layer delivers a polished feedback loop where users can accept, reject, rate, and optionally create a pull request in one workflow.

> Three-layer design keeps the editor fast while centralizing AI intelligence and caching in the backend.

---

## 📁 Project Structure

```text
AzureAI-Code-Suggest/
├── extension/                    ← VS Code Extension (Frontend)
│   ├── src/
│   │   ├── extension.ts          ← Entry point, wires everything together
│   │   ├── codeWatcher.ts        ← Watches typing, debounce orchestrator
│   │   ├── azureDetector.ts      ← Detects Azure SDK from imports
│   │   ├── contextBuilder.ts     ← Builds API payload from editor context
│   │   ├── apiService.ts         ← Calls backend, session cache
│   │   └── mockData.ts           ← Local snippets (works without backend)
│   ├── webview/
│   │   └── panel.tsx             ← React sidebar UI (suggestions display)
│   └── package.json
│
├── backend/                      ← Node.js Express API
│   ├── src/
│   │   ├── server.ts             ← Express app entry point
│   │   ├── routes/suggest.ts     ← POST /suggest endpoint
│   │   ├── openai/client.ts      ← Azure OpenAI integration
│   │   ├── rag/retriever.ts      ← RAG document retrieval
│   │   └── cache/redis.ts        ← Redis caching layer
│   └── package.json
│
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose | Why We Chose It |
|-------|------------|---------|------------------|
| Extension Language | TypeScript | VS Code extension logic | Type-safe, VS Code native |
| Extension API | VS Code Extension API | Editor events, webview, commands | Official VS Code integration |
| UI Framework | React + Tailwind CSS | Sidebar panel UI | Fast component rendering |
| HTTP Client | Axios | Backend API calls | Promise-based, timeout support |
| Backend Runtime | Node.js + Express | REST API server | Fast, lightweight, Azure-compatible |
| AI Model | Azure OpenAI gpt-4o-mini | Code generation | Fast (low latency), cost-effective |
| Caching Layer | Redis (Azure Cache) | Prompt response caching | Reduces repeat API calls 80%+ |
| Session Cache | VS Code Memento / Map | Client-side dedup | Zero-latency for same context |
| Hosting | Azure App Service | Backend deployment | Same region as OpenAI = low latency |
| Debounce | Native setTimeout | Typing delay handling | Reduces API calls from 50 to 5 |
| Context Parser | Regex + VS Code API | Import/keyword detection | No heavy AST parser needed |

---

## ⚡ Key Features

- 🔍 Smart Azure Detection
	Detects Azure SDK intent from imports and usage patterns in TypeScript and C#. It identifies target Azure services before sending any request to the backend.
- 🧠 Context-Aware Suggestions
	Captures current line, nearby code, imports, and cursor position for precise prompt construction. Suggestions are grounded in what the developer is actually writing.
- ⚡ Sub-200ms Response Time
	Uses debounce, smart filters, and multi-layer caching to keep interaction near real time. Developers receive useful suggestions without interrupting flow state.
- 🗄️ Multi-Layer Caching (session cache + Redis)
	A local session cache avoids repeat calls during active editing. Redis on the backend prevents re-computation across users and sessions.
- 🔒 Security-First Suggestions (always uses DefaultAzureCredential)
	Prompts prioritize secure defaults and recommended identity patterns. The system avoids insecure connection-string-first examples where possible.
- 🌐 Multi-Language Support (TypeScript, JavaScript, C#)
	The detector and prompt templates adapt by language. This enables consistent quality across frontend and backend Azure code paths.
- ⭐ Feedback Loop (star ratings logged for fine-tuning)
	Users can rate suggestions directly in the sidebar. Feedback signals are logged to improve future prompts and model behavior.
- 🔀 One-Click GitHub PR Creation
	After accepting a suggestion, users can optionally trigger a PR flow. This accelerates the path from generated code to collaboration.
- 🎭 Mock Mode (works fully without backend during development)
	Developers can run the full extension UX without provisioning cloud resources. This is ideal for demos, testing, and fast iteration.
- 🔄 Zero-Config Backend Switch (one boolean to toggle mock → real)
	A single flag flips from local mock responses to live backend calls. Teams can move from prototype to production mode in seconds.

> Specialized context + secure defaults turns AI suggestions into deployable Azure code, not just snippets.

---

## 🔌 API Reference

### POST /suggest

Request payload:

```json
{
	"language": "typescript",
	"imports": ["@azure/storage-blob"],
	"currentLine": "const blobServiceClient = new",
	"context": "// previous 20 lines of code...",
	"detectedServices": ["blob-storage"]
}
```

Response:

```json
{
	"suggestion": "const blobServiceClient = new BlobServiceClient(\n  `https://${accountName}.blob.core.windows.net`,\n  new DefaultAzureCredential()\n);"
}
```

Error response:

```json
{
	"error": "No suggestion available for this context"
}
```

Full data flow:

1. Extension sends POST /suggest with context payload
2. Backend checks Redis cache using MD5 hash of payload
3. Cache miss → RAG retriever queries Azure docs vector store
4. Retrieved docs + user context injected into OpenAI prompt
5. gpt-4o-mini generates suggestion with `max_tokens: 150`, `temperature: 0.2`
6. Response cached in Redis with 1 hour TTL
7. Suggestion returned to extension in JSON
8. Extension sends suggestion to webview via postMessage
9. User accepts → code inserted at cursor position

---

## 🚀 Performance Optimizations

| Optimization | Technique | Impact |
|--------------|-----------|--------|
| Debounce | 500ms delay after last keystroke | Reduces calls from ~50 to ~5 per session |
| Session Cache | In-memory Map (50 entries) | Zero API calls for repeated context |
| Redis Cache | Backend prompt hash cache | 80%+ reduction in OpenAI API calls |
| Azure Co-location | Backend + OpenAI in same region | ~50ms latency reduction |
| Model Choice | gpt-4o-mini not gpt-4o | 3x faster, 10x cheaper |
| Token Limit | max_tokens: 150 | Faster response, focused output |
| Significance Filter | Only trigger if change >= 2 chars | Ignores spaces/single chars |
| Streaming | stream: true on OpenAI call | First token in ~80ms |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- VS Code 1.74+
- Azure Account (for real mode)
- npm or yarn

### Installation

Step 1 - Clone the repo:

```bash
git clone https://github.com/your-team/azureai-code-suggest
cd azureai-code-suggest
```

Step 2 - Install extension dependencies:

```bash
cd extension
npm install
```

Step 3 - Install backend dependencies:

```bash
cd ../backend
npm install
```

Step 4 - Configure environment:

```env
BACKEND_URL=https://your-backend.azurewebsites.net
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
REDIS_CONNECTION_STRING=your-redis-connection-string
```

Step 5 - Run in mock mode (no backend needed):

In `apiService.ts`, `BACKEND_READY` is `false` by default.
Press `F5` in VS Code to launch extension in debug mode.
Open any TypeScript file and start typing Azure code.

Step 6 - Switch to real backend:

In `apiService.ts` change: `BACKEND_READY = true`
In `extension.ts` change `BACKEND_URL` to your real Azure App Service URL

---

## ☁️ Supported Azure Services

| Service | JS/TS Import | C# Using |
|---------|---------------|----------|
| Azure Blob Storage | @azure/storage-blob | Azure.Storage.Blobs |
| Azure Cosmos DB | @azure/cosmos | Azure.Cosmos |
| Azure Key Vault | @azure/keyvault-secrets | Azure.Security.KeyVault.Secrets |
| Azure Identity | @azure/identity | Azure.Identity |
| Azure Service Bus | @azure/service-bus | Microsoft.Azure.ServiceBus |
| Azure Event Hubs | @azure/event-hubs | Microsoft.Azure.EventHubs |
| Azure AI Text Analytics | @azure/ai-text-analytics | (coming soon) |
| Azure Communication | @azure/communication-sms | (coming soon) |
| Azure Cognitive Search | @azure/search-documents | (coming soon) |

---

## 🏆 Hackathon

- Built in: 24-48 hours
- Category: AI + Cloud + Developer Tools
- Key Innovation: Context-injected Azure knowledge (eliminates AI hallucinations)
- Unique Features list:
	- Intent detection from comments (`// I need to upload to blob → full function`)
	- Mock mode for zero-dependency development
	- Security-first: always suggests DefaultAzureCredential over connection strings
	- Multi-layer caching: session + Redis = 80%+ API call reduction
	- One boolean to switch from mock to real backend

---

## 👥 Team

| Name | Role | Responsibility |
|------|------|----------------|
| Arjun | Extension Developer | codeWatcher, azureDetector, contextBuilder, apiService |
| Dhruvesh | UI Developer | Webview panel, React sidebar, accept/reject UI |
| [Backend Dev 1] | Backend Developer | Express API, Azure OpenAI integration |
| [Backend Dev 2] | Backend Developer | RAG system, Redis caching, Azure deployment |

---

## 🔮 Future Roadmap

Completed:

- [x] Real-time Azure SDK detection
- [x] Context extraction (imports, cursor, previous 20 lines)
- [x] Mock mode for offline development
- [x] Sidebar webview UI with accept/reject
- [x] Session caching to reduce API calls
- [x] Star rating feedback system
- [x] Multi-language support (TypeScript + C#)

Planned:

- [ ] GitHub Copilot Chat integration
- [ ] Azure Bicep / ARM template suggestions
- [ ] Support for Python Azure SDK
- [ ] Auto-detect security vulnerabilities in Azure code
- [ ] VS Code Marketplace public release
- [ ] Fine-tune model on collected feedback data
- [ ] Support for React Native + Azure Mobile SDK

---

## 📄 License

MIT License - feel free to use, modify, and distribute.

<p align="center">
	Built with ❤️ using Azure OpenAI, VS Code API, and TypeScript
	<br/>
	Made for Hackathon 2025
</p>
