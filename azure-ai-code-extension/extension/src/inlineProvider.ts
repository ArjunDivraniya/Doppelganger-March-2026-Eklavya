// PHASE 5 — INLINE SUGGESTION PROVIDER (Copilot-style)

import * as vscode from "vscode";
import { detectAzure } from "./azureDetector";
import { buildContext } from "./contextBuilder";
import { fetchSuggestion } from "./apiService";
import { logError, logInfo, logWarn } from "./logger";

const SUPPORTED_LANGUAGES = ["typescript", "javascript", "typescriptreact", "javascriptreact", "csharp"];

export class InlineSuggestionProvider implements vscode.InlineCompletionItemProvider {
    private backendUrl: string;

    constructor(backendUrl: string) {
        this.backendUrl = backendUrl;
    }

    public async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionList | vscode.InlineCompletionItem[] | undefined> {
        console.log("[DEBUG] Pipeline Started");
        logInfo("InlineProvider", "Completion requested", {
            language: document.languageId,
            position: `${position.line}:${position.character}`,
            triggerKind: context.triggerKind
        });

        // 1. Guard for supported languages
        if (!SUPPORTED_LANGUAGES.includes(document.languageId)) {
            logWarn("InlineProvider", "Ignored unsupported language", { language: document.languageId });
            return undefined;
        }

        // 2. Detect Azure context
        const fullText = document.getText();
        const currentLine = document.lineAt(position.line).text;
        const detection = detectAzure(fullText, currentLine, document.fileName);

        logInfo("InlineProvider", "Azure detection result", {
            isAzure: detection.isAzure,
            services: detection.detectedServices,
            imports: detection.detectedImports
        });

        if (!detection.isAzure) {
            logWarn("InlineProvider", "Skipped non-Azure context");
            return undefined;
        }

        // 3. Build context for API
        const codeContext = buildContext(document, position, detection);

        // 4. Fetch suggestion (Mock or Real)
        try {
            const suggestion = await fetchSuggestion(codeContext, this.backendUrl);
            logInfo("InlineProvider", "DATA FLOW STEP 2 (GHOST TEXT): Sending result to Editor UI", {
                hasSuggestion: !!suggestion,
                suggestionLength: suggestion?.length ?? 0
            });

            if (!suggestion) {
                logWarn("InlineProvider", "No suggestion returned by API layer");
                return undefined;
            }

            if (token.isCancellationRequested) {
                logWarn("InlineProvider", "Request cancelled before rendering");
                return undefined;
            }

            // STEP 1 — Fix newlines again as safety net
            let fixed = suggestion
                .replace(/\\n/g, "\n")
                .replace(/\\t/g, "\t")
                .replace(/^```[\w]*\n?/, "")
                .replace(/\n?```$/, "")
                .replace(/^\n+/, "")
                .replace(/\n{3,}/g, "\n\n")
                .trim();

            // STEP 2 — Detect current line indentation
            const currentLineText = document.lineAt(position.line).text;
            const indentMatch = currentLineText.match(/^(\s*)/);
            const indentation = indentMatch ? indentMatch[1] : "";

            // STEP 3 — Apply indentation to every line after the first
            const formatted = fixed
                .split("\n")
                .map((line, index) => {
                    if (index === 0) return line;           // first line — no indent added
                    if (line.trim() === "") return "";     // empty lines — keep empty
                    return indentation + line;              // all other lines — add indent
                })
                .join("\n");

            // STEP 4 — Return as InlineCompletionItem
            const insertionRange = new vscode.Range(position, position);
            const item = new vscode.InlineCompletionItem(formatted, insertionRange);

            // Optional: Provide a command to log "acceptance"
            item.command = {
                command: "azureai.acceptSuggestion",
                title: "Accept Suggestion",
                arguments: [formatted, detection.detectedServices[0]]
            };

            logInfo("InlineProvider", "Inline item prepared", {
                preview: formatted.slice(0, 100)
            });

            return [item];
        } catch (error) {
            logError("InlineProvider", "Error fetching suggestion", {
                message: error instanceof Error ? error.message : String(error)
            });
            return undefined;
        }
    }
}
