// PHASE 5 — INLINE SUGGESTION PROVIDER (Copilot-style)

import * as vscode from "vscode";
import { detectAzure } from "./azureDetector";
import { buildContext } from "./contextBuilder";
import { fetchSuggestion } from "./apiService";

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

        console.log(`[InlineProvider] 🔍 Checking: ${document.languageId} at ${position.line}:${position.character}`);

        // 1. Guard for supported languages
        if (!SUPPORTED_LANGUAGES.includes(document.languageId)) {
            return undefined;
        }

        // 2. Detect Azure context
        const fullText = document.getText();
        const currentLine = document.lineAt(position.line).text;
        const detection = detectAzure(fullText, currentLine, document.fileName);

        console.log(`[InlineProvider] 🛡️ isAzure: ${detection.isAzure}, Services: ${detection.detectedServices.join(",")}`);

        if (!detection.isAzure) return undefined;

        // 3. Build context for API
        const codeContext = buildContext(document, position, detection);

        // 4. Fetch suggestion (Mock or Real)
        try {
            const suggestion = await fetchSuggestion(codeContext, this.backendUrl);

            if (!suggestion || token.isCancellationRequested) return undefined;

            // 5. Create Inline Completion Item
            const item = new vscode.InlineCompletionItem(
                suggestion,
                new vscode.Range(position, position)
            );

            // Optional: Provide a command to log "acceptance"
            item.command = {
                command: "azureai.acceptSuggestion",
                title: "Accept Suggestion",
                arguments: [suggestion, detection.detectedServices[0]]
            };

            return [item];
        } catch (error) {
            console.error("[InlineProvider] ❌ Error fetching suggestion:", error);
            return undefined;
        }
    }
}
