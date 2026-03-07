// ENTRY POINT — extension.ts

import * as vscode from "vscode";
import { CodeWatcher } from "./codeWatcher";
import { InlineSuggestionProvider } from "./inlineProvider";

const BACKEND_URL = process.env.BACKEND_URL ?? "https://demo-backend.azurewebsites.net";

let webviewPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log("⚡ AzureAI Code Suggest — activated");

    // 1. Create status bar item
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.text = "$(azure) AzureAI: Ready";
    statusBar.tooltip = "AzureAI Code Suggest — Copilot mode active";
    statusBar.command = "azureai.suggest"; // Manual trigger still opens webview
    statusBar.show();
    context.subscriptions.push(statusBar);

    // 2. Register Inline Completion Provider (Copilot Style)
    const inlineProvider = new InlineSuggestionProvider(BACKEND_URL);
    const inlineRegistration = vscode.languages.registerInlineCompletionItemProvider(
        { pattern: "**" }, // All files, or filter by SUPPORTED_LANGUAGES
        inlineProvider
    );
    context.subscriptions.push(inlineRegistration);

    // 3. Create watcher with callback to send suggestions to webview (Dashboard Mode)
    const watcher = new CodeWatcher(
        BACKEND_URL,
        statusBar,
        (suggestion, service, isManual) => sendToWebview(context, suggestion, service, isManual)
    );
    watcher.register(context);

    // 4. Register commands
    const manualCommand = vscode.commands.registerCommand("azureai.suggest", () => {
        watcher.triggerManually();
    });

    const acceptCommand = vscode.commands.registerCommand("azureai.acceptSuggestion", (suggestion, service) => {
        console.log(`[extension] ✓ Suggestion accepted for ${service}`);
        // You could send telemetry here
    });

    context.subscriptions.push(manualCommand, acceptCommand);
}

function sendToWebview(context: vscode.ExtensionContext, suggestion: string, service: string, reveal: boolean = false) {
    // If panel already exists, just send message
    if (webviewPanel) {
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
                vscode.window.showInformationMessage("✓ Azure snippet inserted!");
            }
        }

        if (msg.type === "reject") {
            webviewPanel?.dispose();
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
    console.log("⚡ AzureAI deactivated");
}
