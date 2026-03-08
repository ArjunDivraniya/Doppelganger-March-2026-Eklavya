// ENTRY POINT — extension.ts

import * as vscode from "vscode";
console.log("[AzureAI] extension.ts script loading...");
import { CodeWatcher } from "./codeWatcher";
import { InlineSuggestionProvider } from "./inlineProvider";
import { logInfo, showDebugLogs, logWarn, logError } from "./logger";
import { AzureImportFixer } from "./importFixer";
import { detectAzure } from "./azureDetector";
import { buildContext } from "./contextBuilder";
import { fetchSuggestion, markAsAccepted } from "./apiService";
import { config } from "./config";
import { injectMissingImports } from "./importInjector";

let webviewPanel: vscode.WebviewPanel | undefined;
let watcher: CodeWatcher;

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage("⚡ AzureAI Suggestion Engine — Active (Copilot Mode)");
    console.log("⚡ AzureAI Code Suggest — activated");
    showDebugLogs();
    logInfo("Extension", "Activated", { backendUrl: config.BACKEND_URL });

    const inlineSuggestEnabled = vscode.workspace.getConfiguration("editor").get<boolean>("inlineSuggest.enabled");
    if (!inlineSuggestEnabled) {
        logWarn("Extension", "editor.inlineSuggest.enabled is false; ghost text may not appear");
        vscode.window.showWarningMessage(
            "AzureAI: inline suggestions are disabled (editor.inlineSuggest.enabled=false).",
            "Enable"
        ).then(async choice => {
            if (choice === "Enable") {
                await vscode.workspace.getConfiguration("editor").update("inlineSuggest.enabled", true, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage("AzureAI: inline suggestions enabled. Please retry typing.");
                logInfo("Extension", "Enabled editor.inlineSuggest.enabled via quick action");
            }
        });
    }

    // 1. Create status bar item
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.text = "$(azure) AzureAI: Ready";
    statusBar.tooltip = "AzureAI Code Suggest — Copilot mode active";
    statusBar.command = "azureai.suggest"; // Manual trigger still opens webview
    statusBar.show();
    context.subscriptions.push(statusBar);

    // 2. Register Inline Completion Provider (Copilot Style)
    const inlineProvider = new InlineSuggestionProvider(config.BACKEND_URL);
    const supportedLanguages = ["typescript", "javascript", "typescriptreact", "javascriptreact", "csharp"];

    context.subscriptions.push(
        vscode.languages.registerInlineCompletionItemProvider(
            supportedLanguages.map(lang => ({ language: lang })),
            inlineProvider
        )
    );

    // 2.5 Register Code Action Provider (Quick Fixes for missing Azure imports)
    const importFixer = new AzureImportFixer();
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            supportedLanguages.map(lang => ({ language: lang })),
            importFixer,
            { providedCodeActionKinds: AzureImportFixer.providedCodeActionKinds }
        )
    );

    // 3. Create watcher with callback to send suggestions to webview (Dashboard Mode)
    watcher = new CodeWatcher(
        config.BACKEND_URL,
        statusBar,
        (suggestion, service, isManual) => sendToWebview(context, suggestion, service, isManual)
    );
    watcher.register(context);

    // 4. Register commands
    const manualCommand = vscode.commands.registerCommand("azureai.suggest", () => {
        logInfo("Extension", "Manual suggestion command triggered");
        watcher.triggerManually();
    });

    const showLogsCommand = vscode.commands.registerCommand("azureai.showDebugLogs", () => {
        showDebugLogs();
    });

    const debugProbeCommand = vscode.commands.registerCommand("azureai.debugProbe", async () => {
        showDebugLogs();

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage("AzureAI Debug Probe: No active editor.");
            logWarn("DebugProbe", "No active editor");
            return;
        }

        const doc = editor.document;
        const pos = editor.selection.active;
        const fullText = doc.getText();
        const currentLine = doc.lineAt(pos.line).text;

        logInfo("DebugProbe", "Starting probe", {
            file: doc.fileName,
            language: doc.languageId,
            cursor: `${pos.line}:${pos.character}`
        });

        const detection = detectAzure(fullText, currentLine, doc.fileName);
        logInfo("DebugProbe", "Detection result", detection);

        if (!detection.isAzure) {
            vscode.window.showWarningMessage("AzureAI Debug Probe: No Azure context detected.");
            logWarn("DebugProbe", "Probe stopped due to non-Azure context");
            return;
        }

        const codeContext = buildContext(doc, pos, detection);
        const suggestion = await fetchSuggestion(codeContext, config.BACKEND_URL);

        if (!suggestion) {
            vscode.window.showWarningMessage("AzureAI Debug Probe: Request completed but no suggestion returned.");
            logWarn("DebugProbe", "Probe request returned no suggestion");
            return;
        }

        logInfo("DebugProbe", "Probe success", {
            suggestionLength: suggestion.length,
            preview: suggestion.slice(0, 120)
        });
        vscode.window.showInformationMessage("AzureAI Debug Probe: Suggestion received. Check 'AzureAI Debug' output.");
    });

    const acceptCommand = vscode.commands.registerCommand("azureai.acceptSuggestion", (suggestion: string, service: string) => {
        console.log(`[extension] ✓ Suggestion accepted for ${service}`);

        if (typeof suggestion === "string" && suggestion.trim().length > 0) {
            markAsAccepted(suggestion);
        }

        watcher.notifyAccepted();

        // Automate import injection
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            injectMissingImports(editor.document, suggestion).catch(err => {
                logError("Extension", "Failed to inject missing imports automatically", { error: err.message });
            });

            const lastLine = Math.max(0, editor.document.lineCount - 1);
            const lastChar = editor.document.lineAt(lastLine).text.length;
            const endPos = new vscode.Position(lastLine, lastChar);
            editor.selection = new vscode.Selection(endPos, endPos);
            editor.revealRange(new vscode.Range(endPos, endPos), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        }
    });

    context.subscriptions.push(manualCommand, acceptCommand, showLogsCommand, debugProbeCommand);
}

function sendToWebview(context: vscode.ExtensionContext, suggestion: string, service: string, reveal: boolean = false) {
    // If panel already exists, just send message
    if (webviewPanel) {
        logInfo("Extension", "DATA FLOW STEP 2 (DASHBOARD): Sending result to Webview panel", {
            service,
            suggestionPreview: suggestion.slice(0, 50) + "..."
        });
        webviewPanel.webview.postMessage({ type: "suggestion", suggestion, service });
        if (reveal) {
            webviewPanel.reveal(vscode.ViewColumn.Beside, true);
        }
        console.log("[extension] 📨 Message sent to existing panel");
        return;
    }

    if (!reveal) return; // Don't create panel automatically anymore — stay silent like Copilot

    // Create new webview panel
    webviewPanel = vscode.window.createWebviewPanel(
        "azureAISuggest",
        "⚡ AzureAI Suggest",
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    // Clean up when panel is disposed
    webviewPanel.onDidDispose(() => {
        webviewPanel = undefined;
    });

    // Set HTML content
    webviewPanel.webview.html = getWebviewContent();

    // Handle messages from webview
    webviewPanel.webview.onDidReceiveMessage(msg => {
        if (msg.type === "accept") {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                editor.insertSnippet(
                    new vscode.SnippetString(msg.suggestion),
                    editor.selection.active
                );

                // NOTIFY TRACKERS ON ACCEPT
                markAsAccepted(msg.suggestion);
                watcher.notifyAccepted();

                console.log("[extension] ✅ Accepted and trackers notified");
                vscode.window.showInformationMessage("✓ Azure snippet inserted!");
            }
        }

        if (msg.type === "reject") {
            webviewPanel?.dispose();
        }

        if (msg.type === "retry" || msg.type === "fetch") {
            logInfo("Extension", "Manual fetch requested from webview");
            watcher.triggerManually();
        }

        if (msg.type === "feedback") {
            context.globalState.update("feedback:" + Date.now(), {
                rating: msg.rating,
                suggestion: msg.suggestion
            });
            vscode.window.showInformationMessage("⭐ Thanks for rating " + msg.rating + "/5!");
        }
    });

    console.log("[extension] 🪟 New webview panel created");
    // Wait a bit for webview to load before sending the first message
    setTimeout(() => {
        webviewPanel?.webview.postMessage({ type: "suggestion", suggestion, service });
    }, 1000);
}

function getWebviewContent() {
    // During development, we point to the Vite dev server
    // Note: In production, you would load the physical index.html from dist/
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AzureAI Suggest</title>
        <style>
            body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
            iframe { width: 100%; height: 100%; border: none; }
        </style>
    </head>
    <body>
        <iframe src="http://localhost:5173"></iframe>
        <script>
            const vscode = acquireVsCodeApi();
            window.addEventListener('message', event => {
                const message = event.data;
                // Forward message from extension to iframe
                const iframe = document.querySelector('iframe');
                iframe.contentWindow.postMessage(message, '*');
            });

            // Forward message from iframe to extension
            window.addEventListener('message', event => {
                const message = event.data;
                if (message.type === 'accept' || message.type === 'reject' || message.type === 'feedback') {
                    vscode.postMessage(message);
                }
            });
        </script>
    </body>
    </html>`;
}

export function deactivate() {
    webviewPanel?.dispose();
    logInfo("Extension", "Deactivated");
    console.log("⚡ AzureAI deactivated");
}
