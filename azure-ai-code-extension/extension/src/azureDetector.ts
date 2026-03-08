// PHASE 1 — AZURE DETECTOR (Copilot Enhanced)

import * as vscode from "vscode";


export const AZURE_SDK_MAP: Record<string, string> = {
    // JS/TS imports
    "@azure/storage-blob": "blob-storage",
    "@azure/cosmos": "cosmos-db",
    "@azure/keyvault-secrets": "key-vault",
    "@azure/keyvault-keys": "key-vault",
    "@azure/identity": "azure-identity",
    "@azure/service-bus": "service-bus",
    "@azure/event-hubs": "event-hubs",
    "@azure/ai-text-analytics": "cognitive-services",
    "@azure/communication-sms": "communication-services",
    "@azure/search-documents": "cognitive-search",

    // C# usings
    "Azure.Storage.Blobs": "blob-storage",
    "Azure.Cosmos": "cosmos-db",
    "Azure.Security.KeyVault.Secrets": "key-vault",
    "Azure.Identity": "azure-identity",
    "Microsoft.Azure.ServiceBus": "service-bus",
    "Microsoft.Azure.EventHubs": "event-hubs"
};

const AZURE_KEYWORDS = [
    "azure",
    "blob",
    "cosmos",
    "keyvault",
    "secret",
    "storage",
    "servicebus",
    "eventhub",
    "credential",
    "client",
    "bus",
    "identity",
    "vault",
    "table",
    "queue",
    "auth"
];

const AZURE_FILE_NAME = /azure[-.]|\.azure\.|azure-config|azureservice/;

const KEYWORD_SERVICE_MAP: Record<string, string> = {
    "blob": "blob-storage",
    "storage": "blob-storage",
    "cosmos": "cosmos-db",
    "secret": "key-vault",
    "keyvault": "key-vault",
    "vault": "key-vault",
    "credential": "azure-identity",
    "identity": "azure-identity",
    "auth": "azure-identity",
    "servicebus": "service-bus",
    "bus": "service-bus",
    "eventhub": "event-hubs",
    "textanalytics": "cognitive-services",
    "table": "storage-table",
    "queue": "storage-queue"
};

const FORCE_ACTIVATION_MARKER = "// @azure-debug";

export interface DetectionResult {
    isAzure: boolean;
    detectedServices: string[];
    detectedImports: string[];
}

export function detectAzure(
    fullText: string,
    currentLine: string,
    fileName: string
): DetectionResult {
    const lowerCurrentLine = currentLine.toLowerCase();
    const lowerFullText = fullText.toLowerCase();
    const lowerFileName = fileName.toLowerCase();

    // Force activation mode: enabled by a top-of-file debug marker.
    const firstLines = fullText.split("\n").slice(0, 10).join("\n");
    const forceActivationMode = firstLines.includes(FORCE_ACTIVATION_MARKER);

    // a) Find JS/TS imports
    const tsImportRegex = /from\s+['"](@azure\/[^'"]+)['"]/g;
    const tsImports = Array.from(fullText.matchAll(tsImportRegex)).map(m => m[1]);

    // b) Find C# usings
    const csUsingRegex = /using\s+(Azure\.[^\s;]+|Microsoft\.Azure\.[^\s;]+)/g;
    const csUsings = Array.from(fullText.matchAll(csUsingRegex)).map(m => m[1]);

    const detectedImports = [...tsImports, ...csUsings];

    // c) Map all found strings through AZURE_SDK_MAP
    const detectedServices = Array.from(new Set(
        detectedImports
            .map(imp => AZURE_SDK_MAP[imp])
            .filter((service): service is string => !!service)
    ));

    // Keyword-first detection, case-insensitive on current line and full text.
    const keywordHitsCurrentLine = AZURE_KEYWORDS.filter(keyword => lowerCurrentLine.includes(keyword));
    const keywordHitsFullText = AZURE_KEYWORDS.filter(keyword => lowerFullText.includes(keyword));
    const keywordMatch = keywordHitsCurrentLine.length > 0 || keywordHitsFullText.length > 0;

    // Force trigger for JS/TS files even before imports are added.
    const isJsOrTsFile = /\.(ts|tsx|js|jsx|cs)$/.test(lowerFileName);
    const forceTrigger = isJsOrTsFile;

    // e) fileMatch
    const fileMatch = AZURE_FILE_NAME.test(lowerFileName);

    // Imports are no longer required to activate Azure pipeline.
    const isAzure = forceActivationMode || forceTrigger || detectedServices.length > 0 || keywordMatch || fileMatch;


    // If Azure context is detected but imports are missing, derive services from keywords.
    if (isAzure && detectedServices.length === 0) {
        for (const [kw, service] of Object.entries(KEYWORD_SERVICE_MAP)) {
            if (lowerCurrentLine.includes(kw.toLowerCase()) || lowerFullText.includes(kw.toLowerCase())) {
                detectedServices.push(service);
            }
        }

        // Keep payload non-empty when any Azure keyword exists.
        if (detectedServices.length === 0) {
            detectedServices.push("azure-identity");
        }
    }

    if (isAzure && detectedServices.length === 0) {
        detectedServices.push("azure-identity");
    }

    const uniqueServices = Array.from(new Set(detectedServices));

    // g) Return result
    return {
        isAzure,
        detectedServices: uniqueServices,
        detectedImports
    };
}

// ── ADD 1: Smart Trigger Detection ──────────────────────────────────────────

function isInsideString(text: string): boolean {
    let inString = false;
    let quoteChar = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (text[i - 1] === '\\') continue; // escape char
        if (!inString && (char === '"' || char === "'" || char === "`")) {
            inString = true;
            quoteChar = char;
        } else if (inString && char === quoteChar) {
            inString = false;
            quoteChar = '';
        }
    }
    return inString;
}

export function shouldTrigger(
    document: vscode.TextDocument,
    position: vscode.Position
): boolean {
    const lineText = document.lineAt(position.line).text;
    const textBeforeCursor = lineText.slice(0, position.character);
    const textAfterCursor = lineText.slice(position.character).trim();

    if (textBeforeCursor.trim().length < 3) return false;
    if (textAfterCursor.length > 0) return false;

    const trimmedBefore = textBeforeCursor.trim();
    const lastChar = trimmedBefore[trimmedBefore.length - 1];
    if (!/[a-zA-Z0-9_\.\(\{]/.test(lastChar)) return false;

    if (isInsideString(textBeforeCursor)) return false;

    return true;
}

// ── ADD 2: Comment Intent Extractor ─────────────────────────────────────────

export interface CommentIntent {
    hasIntent: boolean;
    rawComment: string;
    action: string;
    service: string;
    fullPrompt: string;
}

export function extractCommentIntent(
    lines: string[],
    cursorLine: number
): CommentIntent {
    const commentLines: string[] = [];

    // Look at lines from cursorLine-1 down to cursorLine-3
    for (let i = cursorLine - 1; i >= Math.max(0, cursorLine - 3); i--) {
        if (!lines[i]) continue;
        const line = lines[i].trim();
        if (line.startsWith("//")) {
            commentLines.unshift(line.replace(/^\/\/\s*/, "").trim());
        }
    }

    const rawComment = commentLines.join(" ");
    const lowerComment = rawComment.toLowerCase();

    // Detect Action
    let action = "general";
    if (lowerComment.match(/upload|send|write|create|add|insert/)) action = "upload";
    else if (lowerComment.match(/download|read|get|fetch|retrieve|query|list/)) action = "fetch";
    else if (lowerComment.match(/delete|remove|drop/)) action = "delete";
    else if (lowerComment.match(/auth|login|connect|credential/)) action = "authenticate";
    else if (lowerComment.match(/update|edit|modify|patch/)) action = "update";

    // Detect Service
    let service = "azure-identity"; // fallback
    if (lowerComment.match(/blob|storage|file|container/)) service = "blob-storage";
    else if (lowerComment.match(/cosmos|database|document/)) service = "cosmos-db";
    else if (lowerComment.match(/keyvault|secret/)) service = "key-vault";
    else if (lowerComment.match(/service.?bus|queue|message/)) service = "service-bus";
    else if (lowerComment.match(/event.?hub|stream/)) service = "event-hubs";
    else if (lowerComment.match(/identity|credential|auth/)) service = "azure-identity";

    const fullPrompt = `Generate TypeScript/C# Azure SDK code for this task:
${rawComment}
Service: ${service}
Action: ${action}
Rules:
- Use DefaultAzureCredential never connection strings
- Include try/catch error handling
- Add brief inline comments
- Return only working code no explanation`;

    return {
        hasIntent: commentLines.length > 0,
        rawComment,
        action,
        service,
        fullPrompt
    };
}

// ── ADD 3: Error Extractor ──────────────────────────────────────────────────

export function getActiveErrors(
    document: vscode.TextDocument,
    position: vscode.Position
): string {
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);

    const nearbyErrors = errors.filter(d => Math.abs(d.range.start.line - position.line) <= 5);

    if (nearbyErrors.length === 0) return "";

    return nearbyErrors.map(d => `Line ${d.range.start.line + 1}: ${d.message}`).join("\n");
}

