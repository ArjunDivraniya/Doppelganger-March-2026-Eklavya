// PHASE 3 — CODE WATCHER (Orchestrator)

import * as vscode from "vscode";
import { detectAzure } from "./azureDetector";
import { buildContext } from "./contextBuilder";
import { fetchSuggestion } from "./apiService";

const SUPPORTED_LANGUAGES = ["typescript", "javascript", "typescriptreact", "javascriptreact", "csharp"];

export class CodeWatcher {
    private debounceTimer: NodeJS.Timeout | undefined;
    private lastSentKey: string = "";
    private backendUrl: string;
    private statusBar: vscode.StatusBarItem;
    private onSuggestion: (suggestion: string, service: string) => void;

    constructor(
        backendUrl: string,
        statusBar: vscode.StatusBarItem,
        onSuggestion: (suggestion: string, service: string) => void
    ) {
        this.backendUrl = backendUrl;
        this.statusBar = statusBar;
        this.onSuggestion = onSuggestion;
    }

    public register(context: vscode.ExtensionContext): void {
        const disposable = vscode.workspace.onDidChangeTextDocument(event => this.handleChange(event));
        context.subscriptions.push(disposable);
        console.log("[codeWatcher] ✅ Registered");
    }

    private handleChange(event: vscode.TextDocumentChangeEvent): void {
        const editor = vscode.window.activeTextEditor;

        // Guards
        if (!editor) return;
        if (editor.document !== event.document) return;
        if (!SUPPORTED_LANGUAGES.includes(event.document.languageId)) return;

        const change = event.contentChanges[0];
        if (!change || change.text.length < 2) return;

        // Debounce
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => this.processChange(event.document, editor), 500);
    }

    private async processChange(doc: vscode.TextDocument, editor: vscode.TextEditor): Promise<void> {
        const position = editor.selection.active;
        const fullText = doc.getText();
        const currentLine = doc.lineAt(position.line).text;

        // d) detectAzure
        const detection = detectAzure(fullText, currentLine, doc.fileName);

        // e) If NOT detection.isAzure → return
        if (!detection.isAzure) return;

        // f) buildContext
        const codeContext = buildContext(doc, position, detection);

        // g) If codeContext.cacheKey === this.lastSentKey → return
        if (codeContext.cacheKey === this.lastSentKey) return;

        // h) Update last sent key
        this.lastSentKey = codeContext.cacheKey;

        // i) status bar feedback
        this.statusBar.text = "$(sync~spin) AzureAI: Analyzing...";

        // j) fetchSuggestion
        const suggestion = await fetchSuggestion(codeContext, this.backendUrl);

        // k) Result handling
        if (suggestion) {
            this.statusBar.text = "$(azure) AzureAI: ✓ Ready";
            this.onSuggestion(suggestion, detection.detectedServices[0] ?? "azure");
        } else {
            // l) Fallback
            this.statusBar.text = "$(azure) AzureAI: Ready";
        }
    }

    public async triggerManually(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const doc = editor.document;
        const position = editor.selection.active;
        const fullText = doc.getText();
        const currentLine = doc.lineAt(position.line).text;

        const detection = detectAzure(fullText, currentLine, doc.fileName);
        if (!detection.isAzure) {
            vscode.window.showWarningMessage("AzureAI: No Azure context detected.");
            return;
        }

        const codeContext = buildContext(doc, position, detection);

        this.statusBar.text = "$(sync~spin) AzureAI: Analyzing...";
        const suggestion = await fetchSuggestion(codeContext, this.backendUrl);

        if (suggestion) {
            this.statusBar.text = "$(azure) AzureAI: ✓ Ready";
            this.onSuggestion(suggestion, detection.detectedServices[0] ?? "azure");
        } else {
            this.statusBar.text = "$(azure) AzureAI: Ready";
            vscode.window.showWarningMessage("AzureAI: No suggestion found.");
        }
    }
}
