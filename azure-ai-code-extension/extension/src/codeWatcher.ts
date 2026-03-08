// PHASE 3 — CODE WATCHER (Orchestrator)

import * as vscode from "vscode";
import { detectAzure } from "./azureDetector";
import { buildContext } from "./contextBuilder";
import { fetchSuggestion } from "./apiService";
import { logInfo, logWarn } from "./logger";

const SUPPORTED_LANGUAGES = ["typescript", "javascript", "typescriptreact", "javascriptreact", "csharp"];

export class CodeWatcher {
    private debounceTimer: NodeJS.Timeout | undefined;
    private lastSentKey: string = "";
    private backendUrl: string;
    private statusBar: vscode.StatusBarItem;
    private onSuggestion: (suggestion: string, service: string, isManual: boolean) => void;

    // COOLDOWN AFTER ACCEPTANCE
    private lastAcceptedAt: number = 0;
    private ACCEPT_COOLDOWN_MS: number = 1500;

    constructor(
        backendUrl: string,
        statusBar: vscode.StatusBarItem,
        onSuggestion: (suggestion: string, service: string, isManual: boolean) => void
    ) {
        this.backendUrl = backendUrl;
        this.statusBar = statusBar;
        this.onSuggestion = onSuggestion;
    }

    // COOLDOWN AFTER ACCEPTANCE
    public notifyAccepted(): void {
        this.lastAcceptedAt = Date.now();
        this.lastSentKey = ""; // reset so next trigger is fresh
        console.log("[codeWatcher] ⏸️ Cooldown started after accept");
    }

    public register(context: vscode.ExtensionContext): void {
        const disposable = vscode.workspace.onDidChangeTextDocument(event => this.handleChange(event));
        context.subscriptions.push(disposable);
        logInfo("CodeWatcher", "Registered text change listener");
    }

    private handleChange(event: vscode.TextDocumentChangeEvent): void {
        // COOLDOWN AFTER ACCEPTANCE
        // Guard: cooldown after acceptance
        const timeSinceAccept = Date.now() - this.lastAcceptedAt;
        if (timeSinceAccept < this.ACCEPT_COOLDOWN_MS) {
            console.log("[codeWatcher] ⏸️ In cooldown, skipping trigger");
            return;
        }

        const editor = vscode.window.activeTextEditor;

        // Guards
        if (!editor) {
            return;
        }
        if (editor.document !== event.document) {
            return;
        }
        if (!SUPPORTED_LANGUAGES.includes(event.document.languageId)) {
            return;
        }

        const change = event.contentChanges[0];
        if (!change || change.text.length < 1) {
            return;
        }

        // Debounce
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => this.processChange(event.document, editor), 200);
    }

    private async processChange(doc: vscode.TextDocument, editor: vscode.TextEditor): Promise<void> {
        const position = editor.selection.active;
        const fullText = doc.getText();
        const currentLine = doc.lineAt(position.line).text;

        // d) detectAzure
        const detection = detectAzure(fullText, currentLine, doc.fileName);
        logInfo("CodeWatcher", "Azure detection results", {
            isAzure: detection.isAzure,
            services: detection.detectedServices,
            linePreview: currentLine.trim().slice(0, 50)
        });

        // e) If NOT detection.isAzure → return
        if (!detection.isAzure) {
            logWarn("CodeWatcher", "Skipped: No Azure context detected (imports/keywords/filename)", {
                line: currentLine.trim(),
                file: doc.fileName
            });
            return;
        }

        // f) buildContext
        const codeContext = buildContext(doc, position, detection);

        // g) If codeContext.cacheKey === this.lastSentKey → return
        if (codeContext.cacheKey === this.lastSentKey) {
            logInfo("CodeWatcher", "Skipped: Duplicate request for this context", { cacheKey: codeContext.cacheKey });
            return;
        }


        // h) Update last sent key
        this.lastSentKey = codeContext.cacheKey;

        // i) status bar feedback
        this.statusBar.text = "$(sync~spin) AzureAI: Analyzing...";
        logInfo("CodeWatcher", "Fetching suggestion", {
            cacheKey: codeContext.cacheKey,
            backendUrl: this.backendUrl
        });

        // j) fetchSuggestion
        const suggestion = await fetchSuggestion(codeContext, this.backendUrl);

        // k) Result handling
        if (suggestion) {
            this.statusBar.text = "$(azure) AzureAI: ✓ Ready";
            logInfo("CodeWatcher", "Suggestion received", { length: suggestion.length });
            this.onSuggestion(suggestion, detection.detectedServices[0] ?? "azure", false);
        } else {
            // l) Fallback
            this.statusBar.text = "$(azure) AzureAI: Ready";
            logWarn("CodeWatcher", "No suggestion for typing event");
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
            logWarn("CodeWatcher", "Manual trigger without Azure context");
            vscode.window.showWarningMessage("AzureAI: No Azure context detected.");
            return;
        }

        const codeContext = buildContext(doc, position, detection);

        this.statusBar.text = "$(sync~spin) AzureAI: Analyzing...";
        logInfo("CodeWatcher", "Manual fetch started", {
            cacheKey: codeContext.cacheKey,
            backendUrl: this.backendUrl
        });
        const suggestion = await fetchSuggestion(codeContext, this.backendUrl);

        if (suggestion) {
            this.statusBar.text = "$(azure) AzureAI: ✓ Ready";
            logInfo("CodeWatcher", "Manual suggestion received", { length: suggestion.length });
            this.onSuggestion(suggestion, detection.detectedServices[0] ?? "azure", true);
        } else {
            this.statusBar.text = "$(azure) AzureAI: Ready";
            logWarn("CodeWatcher", "Manual fetch returned no suggestion");
            vscode.window.showWarningMessage("AzureAI: No suggestion found.");
        }
    }
}
