# Azure AI Code Assistant 🚀

<div align="center">

![Azure AI Code Assistant](https://img.shields.io/badge/Azure-AI%20Assistant-0078D4?logo=microsoftazure&logoColor=white)
![VS Code](https://img.shields.io/badge/VS%20Code-1.75%2B-007ACC?logo=visualstudiocode&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Supported-3178C6?logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Supported-F7DF1E?logo=javascript&logoColor=black)
![C#](https://img.shields.io/badge/C%23-Supported-239120?logo=csharp&logoColor=white)

**Your intelligent coding companion for Azure SDK development**

### 🌐 [Visit Our Website](https://azure-ai-code-assistant.vercel.app/) |

[🎯 Features](#-features) • [📦 Installation](#-installation) • [🎮 How to Use](#-how-to-use) • [❓ FAQ](#-faq)

</div>

---

## 📖 What is Azure AI Code Assistant?

**Azure AI Code Assistant** is an intelligent VS Code extension that provides **real-time, AI-powered code suggestions** specifically designed for Azure SDK development. Think of it as a specialized GitHub Copilot for Azure!

### 🎯 What Makes It Special?

- **🧠 Azure-Aware Intelligence**: Understands Azure SDKs (Storage, Cosmos DB, Key Vault, Service Bus, Identity, and more)
- **⚡ Instant Suggestions**: Get inline ghost-text suggestions as you type (just like Copilot)
- **🔍 Context-Smart**: Analyzes your code, imports, and context to provide relevant recommendations
- **📚 RAG-Powered**: Uses Retrieval-Augmented Generation with Azure documentation for accurate suggestions
- **🎨 Beautiful UI**: Interactive suggestion panel with syntax-highlighted code examples
- **🚀 Zero Backend Setup**: Backend is already hosted in the cloud - just install and start coding!

---

## ✨ Features

### 🤖 Inline Ghost Text Suggestions
Get Copilot-style inline suggestions as you type. The extension automatically detects when you're working with Azure SDKs and provides intelligent completions.

```typescript
// Just start typing...
const blobServiceClient = new  // ← Suggestion appears here!
```

### 📋 Interactive Suggestion Panel
Open a beautiful webview panel showing detailed suggestions with:
- 📄 Full code examples
- 🎨 Syntax highlighting
- 💡 Multiple suggestion options
- ⭐ Feedback buttons
- 🔄 Retry capabilities

### 🎯 Smart Detection
Automatically detects Azure SDK usage from:
- ✅ Import statements (`@azure/*` packages)
- ✅ Azure keywords (BlobServiceClient, CosmosClient, etc.)
- ✅ C# namespaces (Azure.Storage, Azure.Identity, etc.)
- ✅ File context and patterns

### 🔧 Auto-Import Injection
When you accept a suggestion, the extension automatically:
- ✅ Detects missing Azure SDK imports
- ✅ Injects them at the top of your file
- ✅ Maintains proper code formatting

### ⚡ Quick Fixes
Get one-click fixes for missing Azure imports with integrated CodeActions.

---

## 📦 Installation

### From VS Code Marketplace (Recommended)

1. **Open VS Code**
2. **Go to Extensions** (`Ctrl+Shift+X` or `Cmd+Shift+X` on Mac)
3. **Search** for "Azure AI Code Assistant"
4. **Click Install**
5. **Reload VS Code** when prompted

### From VSIX File

1. Download the latest `.vsix` file from the [releases page](https://marketplace.visualstudio.com/items?itemName=TEAMEKLAVYA.azure-ai-code-assistant)
2. Open VS Code
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "Install from VSIX" and select **Extensions: Install from VSIX...**
5. Select the downloaded `.vsix` file
6. Reload VS Code when prompted

### ✅ Configuration

The extension works **out of the box** with no configuration needed! The backend is already hosted and ready to serve suggestions.

#### Optional: Enable Inline Suggestions

For the best experience, ensure inline suggestions are enabled in VS Code:

1. Open Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "inline suggest"
3. Check **Editor: Inline Suggest Enabled**

Or let the extension do it for you - it will prompt you on first use!

---

## 🎮 How to Use

### Method 1: Automatic Suggestions (Inline Ghost Text)

1. **Open any TypeScript, JavaScript, React, or C# file**
2. **Import an Azure SDK package** or work with Azure code:
   ```typescript
   import { BlobServiceClient } from "@azure/storage-blob";
   ```
3. **Start typing** - suggestions appear automatically as gray ghost text
4. **Press `Tab`** to accept the suggestion

### Method 2: Manual Suggestions (Webview Panel)

1. **Write some Azure-related code**
2. **Press `Ctrl+Shift+.`** (or `Cmd+Shift+.` on Mac)
   - Or right-click and select **"AzureAI: Get Suggestion"**
   - Or open Command Palette (`Ctrl+Shift+P`) and run **"AzureAI: Get Suggestion"**
3. **View suggestions** in the interactive panel
4. **Click "Accept"** to insert the code
5. **Click feedback buttons** (👍/👎) to help improve suggestions

---

## 🔧 How It Works

### Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│  Your VS Code Editor                                 │
│                                                      │
│  1. You type Azure code                             │
│  2. Extension detects Azure context                 │
│  3. Sends context to cloud backend                  │
└──────────────────┬───────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────────────┐
│  Cloud Backend (azure-ai-code-backend.onrender.com) │
│                                                      │
│  4. Analyzes your code context                      │
│  5. Retrieves relevant Azure docs (RAG)             │
│  6. Generates suggestion using Groq LLM             │
└──────────────────┬───────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────────────┐
│  Back to VS Code                                     │
│                                                      │
│  7. Shows inline suggestion or webview panel        │
│  8. You accept and continue coding! 🎉             │
└──────────────────────────────────────────────────────┘
```

### What Gets Sent to the Backend?

The extension sends:
- ✅ Programming language (TypeScript, JavaScript, C#)
- ✅ Current line of code you're writing
- ✅ Previous ~20 lines for context
- ✅ Import statements
- ✅ Cursor position

**Privacy Note**: Only code context is sent - never your entire workspace or sensitive data.

### Backend Processing

1. **Context Analysis**: Detects which Azure SDK and intent (create client, upload, query, etc.)
2. **Document Retrieval**: Uses RAG to fetch relevant Azure documentation
3. **Prompt Building**: Constructs an intelligent prompt with your code + docs
4. **LLM Generation**: Groq Llama 3.3 generates the suggestion
5. **Post-Processing**: Cleans and formats the suggestion


---

## 🌐 Supported Languages & SDKs

### Languages
- ✅ **TypeScript** (.ts)
- ✅ **JavaScript** (.js)
- ✅ **React** (.tsx, .jsx)
- ✅ **C#** (.cs)

### Azure SDKs
- ✅ **Azure Storage** (Blob, Queue, File, Data Lake)
- ✅ **Azure Cosmos DB**
- ✅ **Azure Identity** (Authentication)
- ✅ **Azure Key Vault** (Secrets, Keys, Certificates)
- ✅ **Azure Service Bus**
- ✅ **Azure Event Hubs**
- ✅ **Azure App Configuration**
- ✅ **Azure Monitor**
- ✅ And many more!

---

## 📝 Usage Examples

### Example 1: Azure Blob Storage Client

**You type:**
```typescript
import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = new
```

**Extension suggests:**
```typescript
const blobServiceClient = new BlobServiceClient.fromConnectionString(connectionString);
```

### Example 2: Cosmos DB Container

**You type:**
```typescript
import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient({ endpoint, key });
const database = client.database("myDatabase");
const container =
```

**Extension suggests:**
```typescript
const container = database.container("myContainer");
```

### Example 3: Azure Identity Authentication

**You type:**
```typescript
import { DefaultAzureCredential } from "@azure/identity";

const credential =
```

**Extension suggests:**
```typescript
const credential = new DefaultAzureCredential();
```

### Example 4: Key Vault Secrets

**You type:**
```typescript
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

const vaultUrl = "https://myvault.vault.azure.net";
const credential = new DefaultAzureCredential();
const client = new SecretClient(vaultUrl, credential);

// Get a secret
```

**Extension suggests:**
```typescript
const secret = await client.getSecret("mySecretName");
console.log("Secret value:", secret.value);
```

---

## 💡 Status Bar Indicator

Look for the **Azure icon** in your VS Code status bar (bottom-left):

- **$(azure) AzureAI: Ready** - Extension is active and ready to help
- Click the status bar item to manually trigger suggestions

---

## 🐛 Troubleshooting

### Inline suggestions not appearing?

1. **Check inline suggestions setting:**
   - Open Settings (`Ctrl+,`)
   - Search for "inline suggest"
   - Ensure **Editor: Inline Suggest Enabled** is checked

2. **Check language support:**
   - Make sure you're editing a supported file type (`.ts`, `.js`, `.tsx`, `.jsx`, `.cs`)

3. **Check Azure context:**
   - The extension needs to detect Azure SDK usage
   - Try importing an Azure package: `import { BlobServiceClient } from "@azure/storage-blob";`

### No suggestions in webview panel?

1. **Check your internet connection** - The extension needs to reach the cloud backend
2. **Check debug logs:**
   - Run command: **AzureAI: Show Debug Logs**
   - Look for any error messages in the output panel

### Suggestions are slow?

- The backend is hosted on a free tier which may have cold starts (~30 seconds for first request)
- Subsequent requests should be much faster (~2-5 seconds)

### Extension not activating?

1. **Verify installation:**
   - Go to Extensions sidebar
   - Search for "Azure AI Code Assistant"
   - Ensure it's installed and enabled

2. **Check VS Code version:**
   - Extension requires VS Code 1.75.0 or higher
   - Run **Help → About** to check your version

3. **Reload VS Code:**
   - Run **Developer: Reload Window** from Command Palette

---

## ❓ FAQ

### Do I need to set up a backend?

**No!** The backend is already hosted in the cloud at `azure-ai-code-backend.onrender.com`. Just install the extension and start coding!

### Does this extension require Azure credentials?

**No!** You don't need any Azure subscriptions or credentials to use this extension. The AI backend handles everything.

### Is my code being stored or shared?

**No!** Only the code context around your cursor is sent to the backend for suggestion generation. Nothing is stored permanently. Your code privacy is respected.

### What LLM powers this extension?

The extension uses **Groq's Llama 3.3 70B** model combined with a **RAG (Retrieval-Augmented Generation)** pipeline that retrieves relevant Azure documentation to ground suggestions in official docs.

### Can I use this offline?

No, the extension requires an internet connection to communicate with the cloud backend for AI-powered suggestions.

### Does this replace GitHub Copilot?

Not necessarily! This extension is **specialized for Azure SDK development** and can work alongside GitHub Copilot. Use both for maximum productivity!

### How accurate are the suggestions?

The extension combines:
- Real Azure documentation (via RAG)
- Advanced LLM reasoning (Groq Llama 3.3)
- Your code context

This results in highly accurate, Azure-specific suggestions. However, always review generated code before using in production.

### Can I contribute feedback?

**Yes, please!** Click the feedback buttons (👍/👎) in the webview panel. Your feedback helps improve the AI model!

---

## 🎯 Tips for Best Results

1. **Use descriptive variable names** - Helps the AI understand your intent
2. **Add comments** - Describe what you're trying to accomplish
3. **Import Azure packages** - Makes context detection more accurate
4. **Be specific** - The more context you provide, the better the suggestions
5. **Try the manual trigger** - Use `Ctrl+Shift+.` if inline suggestions don't appear

---

## 🔒 Privacy & Security

- ✅ Only code context is sent (current line + ~20 previous lines)
- ✅ No personal data or credentials are transmitted
- ✅ No code is permanently stored
- ✅ All communication uses HTTPS
- ✅ Backend hosted on secure Render cloud infrastructure

---

## 📊 Feedback & Support

### Report Issues
- 🐛 Found a bug? [Open an issue on GitHub](https://github.com/ArjunDivraniya/Doppelganger-March-2026-Eklavya/issues)
- 💡 Have a feature request? [Let us know!](https://github.com/ArjunDivraniya/Doppelganger-March-2026-Eklavya/issues)

### Leave a Review
Love the extension? Leave a ⭐️ review on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=TEAMEKLAVYA.azure-ai-code-assistant)!

---

## 🏆 Credits

**Developed by TEAM EKLAVYA** for the Doppelganger Hackathon 2026

- 🌐 [Project Website](https://azure-ai-code-assistant.vercel.app/)
- 📺 [Video Demo](https://drive.google.com/drive/folders/1Zb8M3IUdBzpEJxNmIYs8VTnT2gJGGbvD)
- 💻 [GitHub Repository](https://github.com/ArjunDivraniya/Doppelganger-March-2026-Eklavya)

---

## 📄 License

This extension is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---


<div align="center">

**Made with ❤️ for Azure Developers**

[⭐ Star us on GitHub](https://github.com/ArjunDivraniya/Doppelganger-March-2026-Eklavya) • [📝 Report an Issue](https://github.com/ArjunDivraniya/Doppelganger-March-2026-Eklavya/issues) • [🌐 Visit Website](https://azure-ai-code-assistant.vercel.app/)

</div>
