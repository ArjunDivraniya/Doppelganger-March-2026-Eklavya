// INLINE PROVIDER (Copilot Enhanced)

import * as vscode from "vscode";
import { detectAzure, shouldTrigger, extractCommentIntent, getActiveErrors } from "./azureDetector";
import { buildContext } from "./contextBuilder";
import { fetchSuggestion, getRemainingLines } from "./apiService";

const SUPPORTED_LANGUAGES = [
    "typescript", "javascript",
    "typescriptreact", "javascriptreact", "csharp"
];

export function registerInlineProvider(
    context: vscode.ExtensionContext,
    backendUrl: string
) {
    const provider: vscode.InlineCompletionItemProvider = {
        async provideInlineCompletionItems(document, position, ctx, token) {

            // Guard 1 — supported language
            if (!SUPPORTED_LANGUAGES.includes(document.languageId)) return [];

            // Guard 2 — Copilot smart trigger
            if (!shouldTrigger(document, position)) return [];

            const fullText = document.getText();
            const lines = fullText.split("\n");
            const currentLine = document.lineAt(position.line).text.trim();

            // Detect errors near cursor
            const activeErrors = getActiveErrors(document, position);

            // Detect comment intent
            const commentIntent = extractCommentIntent(lines, position.line);

            // Detect Azure relevance
            const detection = detectAzure(fullText, currentLine, document.fileName);

            // Guard 3 — must be Azure OR have errors OR have comment intent
            if (!detection.isAzure && !activeErrors && !commentIntent.hasIntent) {
                return [];
            }

            // Build rich context
            const codeContext = buildContext(
                document,
                position,
                detection,
                activeErrors,
                commentIntent.hasIntent ? commentIntent.fullPrompt : ""
            );

            // Override comment if intent detected
            if (commentIntent.hasIntent) {
                codeContext.commentAbove = commentIntent.fullPrompt;
                if (commentIntent.service) {
                    codeContext.detectedServices = [commentIntent.service];
                }
            }

            // Fetch suggestion
            const suggestion = await fetchSuggestion(codeContext, backendUrl);
            if (!suggestion) return [];

            // Filter already written lines
            const remaining = getRemainingLines(suggestion, fullText);
            if (!remaining || remaining.trim().length === 0) return [];

            // Format for display
            const formatted = formatSuggestion(remaining, document, position);
            if (!formatted) return [];

            return [
                new vscode.InlineCompletionItem(
                    formatted,
                    new vscode.Range(position, position)
                )
            ];
        }
    };

    // Register for all supported languages
    const disposable = vscode.languages.registerInlineCompletionItemProvider(
        SUPPORTED_LANGUAGES.map(lang => ({ language: lang })),
        provider
    );

    context.subscriptions.push(disposable);
    console.log("[inlineProvider] ✅ Copilot-style provider registered");
}

function formatSuggestion(
    suggestion: string,
    document: vscode.TextDocument,
    position: vscode.Position
): string {
    const fixed = suggestion
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\r/g, "")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/^```[\w]*\n?/, "")
        .replace(/\n?```$/, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    if (!fixed) return "";

    const lineText = document.lineAt(position.line).text;
    const indentMatch = lineText.match(/^(\s*)/);
    const indentation = indentMatch ? indentMatch[1] : "";

    return fixed
        .split("\n")
        .map((line, i) => {
            if (i === 0) return line;
            if (line.trim() === "") return "";
            return indentation + line;
        })
        .join("\n");
}
