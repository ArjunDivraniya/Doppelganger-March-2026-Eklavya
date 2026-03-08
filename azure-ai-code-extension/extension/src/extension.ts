// ENTRY POINT (Copilot Enhanced)

import * as vscode from "vscode";
console.log("[AzureAI] extension.ts script loading...");
import { CodeWatcher } from "./codeWatcher";
import { registerInlineProvider } from "./inlineProvider";
import { logInfo, showDebugLogs, logWarn, logError } from "./logger";
import { AzureImportFixer } from "./importFixer";
import { detectAzure } from "./azureDetector";
import { buildContext } from "./contextBuilder";
import { fetchSuggestion, markAsAccepted } from "./apiService";
import { config } from "./config";
import { injectMissingImports } from "./importInjector";
import { sendFeedback, detectIntent, FeedbackData } from "./feedbackService";

let webviewPanel: vscode.WebviewPanel | undefined;
let watcherInstance: CodeWatcher | undefined;

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
  registerInlineProvider(context, config.BACKEND_URL);
  console.log("[extension] ✅ Inline provider registered");

  // 2.5 Register Code Action Provider (Quick Fixes for missing Azure imports)
  const supportedLanguages = ["typescript", "javascript", "typescriptreact", "javascriptreact", "csharp"];
  const importFixer = new AzureImportFixer();
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      supportedLanguages.map(lang => ({ language: lang })),
      importFixer,
      { providedCodeActionKinds: AzureImportFixer.providedCodeActionKinds }
    )
  );

  // 3. Create watcher with callback to send suggestions to webview (Dashboard Mode)
  watcherInstance = new CodeWatcher(
    config.BACKEND_URL,
    statusBar,
    (suggestion, service, isManual, triggerLine) => {
      sendToWebview(context, suggestion, service, isManual, triggerLine);
    }
  );
  watcherInstance.register(context);

  // 4. Register commands
  const manualCommand = vscode.commands.registerCommand("azureai.suggest", () => {
    logInfo("Extension", "Manual suggestion command triggered");
    watcherInstance?.triggerManually();
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

    watcherInstance?.notifyAccepted();

    // Automate import injection
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const triggerLine = editor.document.lineAt(editor.selection.active.line).text;

      injectMissingImports(editor.document, suggestion).catch(err => {
        logError("Extension", "Failed to inject missing imports automatically", { error: err.message });
      });

      const lastLine = Math.max(0, editor.document.lineCount - 1);
      const lastChar = editor.document.lineAt(lastLine).text.length;
      const endPos = new vscode.Position(lastLine, lastChar);
      editor.selection = new vscode.Selection(endPos, endPos);
      editor.revealRange(new vscode.Range(endPos, endPos), vscode.TextEditorRevealType.InCenterIfOutsideViewport);

      promptInlineFeedback(suggestion, service, triggerLine);
    }
  });

  context.subscriptions.push(manualCommand, acceptCommand, showLogsCommand, debugProbeCommand);
}

function getSdkType(service: string): string {
  const sdkMap: Record<string, string> = {
    "blob-storage": "@azure/storage-blob",
    "cosmos-db": "@azure/cosmos",
    "key-vault": "@azure/keyvault-secrets",
    "azure-identity": "@azure/identity",
    "service-bus": "@azure/service-bus",
    "event-hubs": "@azure/event-hubs",
    "cognitive-services": "@azure/ai-text-analytics",
  }
  return sdkMap[service] ?? "@azure/unknown"
}

function promptInlineFeedback(suggestion: string, service: string, triggerLine?: string): void {
  const feedbackData: FeedbackData = {
    suggestion,
    rating: "positive",
    sdkType: getSdkType(service),
    intent: detectIntent(triggerLine ?? "", service)
  };

  vscode.window.showInformationMessage(
    "Was this suggestion helpful?",
    "👍 Helpful",
    "👎 Not Helpful"
  ).then(choice => {
    if (!choice) return;

    feedbackData.rating = choice === "👍 Helpful" ? "positive" : "negative";
    sendFeedback(feedbackData, config.BACKEND_URL).then(success => {
      if (success) {
        vscode.window.setStatusBarMessage("$(check) AzureAI: Feedback received", 2500);
      }
    });
  });
}

function sendToWebview(context: vscode.ExtensionContext, suggestion: string, service: string, reveal: boolean = false, triggerLine: string = "") {
  // If panel already exists, just send message
  if (webviewPanel) {
    logInfo("Extension", "DATA FLOW STEP 2 (DASHBOARD): Sending result to Webview panel", {
      service,
      suggestionPreview: suggestion.slice(0, 50) + "..."
    });
    webviewPanel.webview.postMessage({
      type: "suggestion",
      suggestion,
      service,
      sdkType: getSdkType(service),
      intent: detectIntent(triggerLine, service),
      triggerLine
    });
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
        watcherInstance?.notifyAccepted();

        console.log("[extension] ✅ Accepted and trackers notified");
        vscode.window.showInformationMessage("✓ Azure snippet inserted!");
      }
    }

    if (msg.type === "reject") {
      webviewPanel?.dispose();
    }

    if (msg.type === "retry" || msg.type === "fetch") {
      logInfo("Extension", "Manual fetch requested from webview");
      watcherInstance?.triggerManually();
    }

    if (msg.type === "feedback") {
      const feedbackData: FeedbackData = {
        suggestion: msg.suggestion,
        rating: msg.rating,           // "positive" or "negative"
        sdkType: msg.sdkType,
        intent: msg.intent
      };

      sendFeedback(feedbackData, config.BACKEND_URL).then(success => {
        if (success) {
          vscode.window.setStatusBarMessage(
            "$(check) AzureAI: Feedback received — thanks!",
            3000   // disappears after 3 seconds
          );
        }
      });

      console.log("[extension] ⭐ Feedback received:", msg.rating, msg.sdkType);
    }
  });

  console.log("[extension] 🪟 New webview panel created");
  // Wait a bit for webview to load before sending the first message
  setTimeout(() => {
    webviewPanel?.webview.postMessage({
      type: "suggestion",
      suggestion,
      service,
      sdkType: getSdkType(service),
      intent: detectIntent(triggerLine, service),
      triggerLine
    });
  }, 1000);
}

function getWebviewContent() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    background: #0d1117;
    color: #e6edf3;
    padding: 16px;
    font-size: 13px;
  }

  .header {
    font-size: 11px;
    color: #8b949e;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .service-badge {
    display: inline-block;
    font-size: 10px;
    background: #1f6feb33;
    color: #58a6ff;
    border: 1px solid #1f6feb;
    border-radius: 4px;
    padding: 2px 7px;
    margin-bottom: 10px;
  }

  .code-block {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 8px;
    padding: 14px;
    font-family: 'Cascadia Code', 'Fira Code', monospace;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    margin-bottom: 14px;
    color: #e6edf3;
  }

  .divider {
    border: none;
    border-top: 1px solid #21262d;
    margin: 12px 0;
  }

  .action-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .btn {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: opacity 0.15s;
  }
  .btn:hover { opacity: 0.85; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-accept  { background: #238636; color: #fff; }
  .btn-reject  { background: #21262d; color: #8b949e; border: 1px solid #30363d; }

  .feedback-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .feedback-label {
    font-size: 11px;
    color: #8b949e;
    flex-shrink: 0;
  }

  .btn-helpful {
    flex: 1;
    padding: 7px;
    border-radius: 6px;
    border: 1px solid #238636;
    background: transparent;
    color: #56d364;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-helpful:hover  { background: #238636; color: #fff; }
  .btn-helpful:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-nothelpful {
    flex: 1;
    padding: 7px;
    border-radius: 6px;
    border: 1px solid #da3633;
    background: transparent;
    color: #f85149;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-nothelpful:hover  { background: #da3633; color: #fff; }
  .btn-nothelpful:disabled { opacity: 0.4; cursor: not-allowed; }

  .thanks-msg {
    display: none;
    font-size: 11px;
    color: #56d364;
    margin-top: 8px;
    text-align: center;
    padding: 6px;
    background: #1a3a1a;
    border-radius: 4px;
    border: 1px solid #238636;
  }
</style>
</head>
<body>

  <div class="header">AI Code Suggestion</div>
  <div class="service-badge" id="serviceBadge">azure</div>

  <div class="code-block" id="codeBlock">
    Waiting for suggestion...
  </div>

  <hr class="divider">

  <!-- Accept / Reject -->
  <div class="action-row">
    <button class="btn btn-accept"  onclick="accept()">✓ Accept</button>
    <button class="btn btn-reject"  onclick="reject()">✕ Dismiss</button>
  </div>

  <hr class="divider">

  <!-- Feedback -->
  <div class="feedback-row">
    <span class="feedback-label">Was this helpful?</span>
    <button class="btn-helpful"    id="btnHelp"    onclick="sendFeedback('positive')">👍 Helpful</button>
    <button class="btn-nothelpful" id="btnNoHelp"  onclick="sendFeedback('negative')">👎 Not Helpful</button>
  </div>

  <div class="thanks-msg" id="thanksMsg">
    ✅ Thanks for your feedback!
  </div>

<script>
  const vscode = acquireVsCodeApi()

  // Store current suggestion data
  let currentData = {
    suggestion: "",
    sdkType:    "",
    intent:     "",
    service:    ""
  }

  // ── Receive suggestion from extension ──────────────
  window.addEventListener('message', event => {
    const { type, suggestion, service, sdkType, intent } = event.data

    if (type === 'suggestion') {
      // Store data for feedback
      currentData = { suggestion, sdkType, intent, service }

      // Update UI
      document.getElementById('serviceBadge').textContent = '⚡ ' + service
      document.getElementById('codeBlock').textContent    = suggestion

      // Reset feedback buttons
      document.getElementById('btnHelp').disabled   = false
      document.getElementById('btnNoHelp').disabled = false
      document.getElementById('thanksMsg').style.display = 'none'
    }
  })

  // ── Accept button ──────────────────────────────────
  function accept() {
    vscode.postMessage({
      type:       'accept',
      suggestion: currentData.suggestion
    })
  }

  // ── Reject button ──────────────────────────────────
  function reject() {
    vscode.postMessage({ type: 'reject' })
  }

  // ── Feedback buttons ───────────────────────────────
  function sendFeedback(rating) {
    // Send to extension
    vscode.postMessage({
      type:       'feedback',
      rating:     rating,
      suggestion: currentData.suggestion,
      sdkType:    currentData.sdkType,
      intent:     currentData.intent
    })

    // Disable both buttons after click
    document.getElementById('btnHelp').disabled   = true
    document.getElementById('btnNoHelp').disabled = true

    // Show thank you message
    document.getElementById('thanksMsg').style.display = 'block'
  }
</script>
</body>
</html>
`;
}

export function deactivate() {
  webviewPanel?.dispose();
  logInfo("Extension", "Deactivated");
  console.log("⚡ AzureAI deactivated");
}
