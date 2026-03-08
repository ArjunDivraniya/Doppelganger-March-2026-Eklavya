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
            logInfo("InlineProvider", "Fetch completed", {
                hasSuggestion: !!suggestion,
                suggestionLength: suggestion?.length ?? 0,
                cancelled: token.isCancellationRequested
            });

            if (!suggestion) {
                logWarn("InlineProvider", "No suggestion returned by API layer");
                return undefined;
            }

            if (token.isCancellationRequested) {
                logWarn("InlineProvider", "Request cancelled before rendering");
                return undefined;
            }

            // 5. Create Inline Completion Item
            // Use a range that replaces the entire line for smoother insertion (since backend returns full line)
            const lineRange = document.lineAt(position.line).range;
            const item = new vscode.InlineCompletionItem(
                suggestion,
                lineRange
            );

            // Optional: Provide a command to log "acceptance"
            item.command = {
                command: "azureai.acceptSuggestion",
                title: "Accept Suggestion",
                arguments: [suggestion, detection.detectedServices[0]]
            };

            logInfo("InlineProvider", "Inline item prepared", {
                preview: suggestion.slice(0, 100)
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
