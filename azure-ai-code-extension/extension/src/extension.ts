// ENTRY POINT — extension.ts

import * as vscode from "vscode";
import { CodeWatcher } from "./codeWatcher";

const BACKEND_URL = process.env.BACKEND_URL ?? "https://demo-backend.azurewebsites.net";

let webviewPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log("⚡ AzureAI Code Suggest — activated");

  // Create status bar item
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.text = "$(azure) AzureAI: Ready";
  statusBar.tooltip = "AzureAI Code Suggest — click to trigger manually";
  statusBar.command = "azureai.suggest";
  statusBar.show();
  context.subscriptions.push(statusBar);

  // Create watcher with callback to send suggestions to webview
  const watcher = new CodeWatcher(
    BACKEND_URL,
    statusBar,
    (suggestion, service) => sendToWebview(context, suggestion, service)
  );

  watcher.register(context);

  // Register manual trigger command
  const command = vscode.commands.registerCommand("azureai.suggest", () => {
    watcher.triggerManually();
  });
  context.subscriptions.push(command);
}

function sendToWebview(context: vscode.ExtensionContext, suggestion: string, service: string) {
  // If panel already exists, just send message and reveal
  if (webviewPanel) {
    webviewPanel.webview.postMessage({ type: "suggestion", suggestion, service });
    webviewPanel.reveal(vscode.ViewColumn.Beside, true);
    console.log("[extension] 📨 Message sent to existing panel");
    return;
  }

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

  // ── TEAMMATE INTEGRATION POINT ──────────────────────────
  // Dhruvesh's webview listens for messages like this:
  //   window.addEventListener('message', event => {
  //     if (event.data.type === 'suggestion') {
  //       renderSuggestion(event.data.suggestion, event.data.service)
  //     }
  //   })
  // The webview sends back messages using:
  //   vscode.postMessage({ type: 'accept', suggestion })
  //   vscode.postMessage({ type: 'reject' })
  //   vscode.postMessage({ type: 'feedback', rating: 4, suggestion })
  // ─────────────────────────────────────────────────────────

  console.log("[extension] 🪟 New webview panel created");
  webviewPanel.webview.postMessage({ type: "suggestion", suggestion, service });
}

export function deactivate() {
  webviewPanel?.dispose();
  console.log("⚡ AzureAI deactivated");
}
