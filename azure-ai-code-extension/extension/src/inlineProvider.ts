// PHASE 5 — INLINE SUGGESTION PROVIDER (Copilot-style)

import * as vscode from "vscode";
import { detectAzure } from "./azureDetector";
import { buildContext } from "./contextBuilder";
import { fetchSuggestion, getRemainingLines, wasAlreadyAccepted } from "./apiService";
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
        const diagnostics = vscode.languages
            .getDiagnostics(document.uri)
            .filter(d => d.severity === vscode.DiagnosticSeverity.Error);

        const targetDiagnostic = this.pickTargetDiagnostic(diagnostics, position);
        const targetPosition = targetDiagnostic
            ? new vscode.Position(
                targetDiagnostic.range.start.line,
                document.lineAt(targetDiagnostic.range.start.line).text.length
            )
            : position;

        const codeContext = buildContext(document, targetPosition, detection);

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

            if (wasAlreadyAccepted(suggestion)) {
                logInfo("InlineProvider", "Skipping already accepted suggestion");
                return [];
            }

            if (token.isCancellationRequested) {
                logWarn("InlineProvider", "Request cancelled before rendering");
                return undefined;
            }

            // FILTER ALREADY WRITTEN LINES
            // Get full file text
            const fullFileText = document.getText();

            // Filter out already written lines
            const remaining = getRemainingLines(suggestion, fullFileText);

            // Nothing left to suggest — all lines already written
            if (!remaining || remaining.trim().length === 0) {
                console.log("[inlineProvider] \uD83D\uDEAB No new lines to suggest");
                return [];
            }

            // Use remaining instead of full suggestion
            const suggestionToShow = remaining;

            // STEP 1 — Fix newlines again as safety net
            let fixed = suggestionToShow
                .replace(/\\n/g, "\n")
                .replace(/\\t/g, "\t")
                .replace(/^```[\w]*\n?/, "")
                .replace(/\n?```$/, "")
                .replace(/^\n+/, "")
                .replace(/\n{3,}/g, "\n\n")
                .trim();

            // STEP 2 — Detect current line indentation
            const currentLineText = document.lineAt(targetPosition.line).text;
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

            const dedupedAtTarget = this.removeImmediateDuplicateAtTarget(document, targetPosition, formatted);
            if (!dedupedAtTarget || dedupedAtTarget.trim().length === 0) {
                logInfo("InlineProvider", "Skipping duplicate suggestion at target location");
                return [];
            }

            // STEP 4 — Return as InlineCompletionItem
            const insertionRange = new vscode.Range(targetPosition, targetPosition);
            const item = new vscode.InlineCompletionItem(dedupedAtTarget, insertionRange);

            // Optional: Provide a command to log "acceptance"
            item.command = {
                command: "azureai.acceptSuggestion",
                title: "Accept Suggestion",
                arguments: [dedupedAtTarget, detection.detectedServices[0]]
            };

            logInfo("InlineProvider", "Inline item prepared", {
                preview: dedupedAtTarget.slice(0, 100),
                targetLine: targetPosition.line,
                hasErrorTarget: !!targetDiagnostic
            });

            return [item];
        } catch (error) {
            logError("InlineProvider", "Error fetching suggestion", {
                message: error instanceof Error ? error.message : String(error)
            });
            return undefined;
        }
    }

    private pickTargetDiagnostic(
        diagnostics: vscode.Diagnostic[],
        cursor: vscode.Position
    ): vscode.Diagnostic | undefined {
        if (diagnostics.length === 0) return undefined;

        const sorted = diagnostics
            .slice()
            .sort((a, b) => {
                const aDist = Math.abs(a.range.start.line - cursor.line);
                const bDist = Math.abs(b.range.start.line - cursor.line);
                return aDist - bDist;
            });

        return sorted[0];
    }

    private removeImmediateDuplicateAtTarget(
        document: vscode.TextDocument,
        target: vscode.Position,
        suggestion: string
    ): string | null {
        const normalize = (line: string): string => line.trim().replace(/\s+/g, " ");
        const suggestionLines = suggestion.split("\n").map(l => l.replace(/\r/g, ""));
        const candidate = suggestionLines.filter(l => l.trim().length > 0);
        if (candidate.length === 0) return null;

        const existingWindow: string[] = [];
        for (let i = target.line; i < Math.min(document.lineCount, target.line + candidate.length + 1); i++) {
            existingWindow.push(document.lineAt(i).text);
        }

        let overlap = 0;
        const maxOverlap = Math.min(candidate.length, existingWindow.length);
        const candidateNorm = candidate.map(normalize);
        const existingNorm = existingWindow.map(normalize);

        for (let size = maxOverlap; size > 0; size--) {
            let matches = true;
            for (let i = 0; i < size; i++) {
                if (candidateNorm[i] !== existingNorm[i]) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                overlap = size;
                break;
            }
        }

        if (overlap >= candidate.length) return null;
        return candidate.slice(overlap).join("\n");
    }
}
