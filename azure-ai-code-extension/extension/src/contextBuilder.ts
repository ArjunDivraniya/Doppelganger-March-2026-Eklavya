// PHASE 2 — CONTEXT BUILDER (Copilot Enhanced)

import * as vscode from "vscode";
import { DetectionResult } from "./azureDetector";
import { logInfo } from "./logger";

export interface CodeContext {
    language: string;
    fileName: string;
    fileNameHint: string;
    imports: string[];
    detectedServices: string[];
    currentLine: string;
    previousCode: string;
    cursorLine: number;
    cursorChar: number;
    cacheKey: string;
    codeAfterCursor: string;
    allVariables: string[];
    allFunctions: string[];
    commentAbove: string;
    openFilesContext: string;
    activeErrors: string;
    commentIntent: string;
}

export function buildContext(
    document: vscode.TextDocument,
    position: vscode.Position,
    detection: DetectionResult,
    activeErrors?: string,
    commentIntent?: string
): CodeContext {
    const lines = document.getText().split("\n");

    const startLine = Math.max(0, position.line - 60);
    const previousCode = lines.slice(startLine, position.line).join("\n");

    const endLine = Math.min(lines.length, position.line + 10);
    const codeAfterCursor = lines.slice(position.line + 1, endLine).join("\n");

    const fullText = document.getText();

    // Collect variables
    const allVariables: string[] = [];
    const varRegex = /(?:const|let|var)\s+(\w+)/g;
    let match;
    while ((match = varRegex.exec(fullText)) !== null) {
        allVariables.push(match[1]);
    }

    // Collect functions
    const allFunctions: string[] = [];
    const funcRegex = /(?:async\s+)?function\s+(\w+)|(\w+)\s*[:=]\s*(?:async\s*)?\(/g;
    while ((match = funcRegex.exec(fullText)) !== null) {
        if (match[1]) allFunctions.push(match[1]);
        if (match[2]) allFunctions.push(match[2]);
    }

    // Collect comments above cursor
    const commentAboveLines: string[] = [];
    for (let i = position.line - 1; i >= Math.max(0, position.line - 5); i--) {
        const lineText = lines[i].trim();
        if (lineText.startsWith("//") || lineText.startsWith("*") || lineText.startsWith("/*")) {
            commentAboveLines.unshift(lineText);
        } else if (lineText.length > 0) {
            break; // Stop at first non-comment line
        }
    }
    const commentAbove = commentAboveLines.join("\n");

    const openFilesContext = getOpenTabsContext(document.fileName, document.languageId);

    const fileNameParts = document.fileName.split(/[/\\]/);
    const fileNameHint = fileNameParts[fileNameParts.length - 1] ?? "";

    const currentLine = lines[position.line] ?? "";

    const cacheKey = [
        ...detection.detectedServices,
        currentLine.trim().slice(0, 40)
    ].join(":");

    const context: CodeContext = {
        language: document.languageId,
        fileName: document.fileName,
        fileNameHint,
        imports: detection.detectedImports,
        detectedServices: detection.detectedServices,
        currentLine,
        previousCode,
        cursorLine: position.line,
        cursorChar: position.character,
        cacheKey,
        codeAfterCursor,
        allVariables,
        allFunctions,
        commentAbove,
        openFilesContext,
        activeErrors: activeErrors || "",
        commentIntent: commentIntent || ""
    };

    logInfo("ContextBuilder", "Context built", {
        file: context.fileNameHint,
        language: context.language,
        services: context.detectedServices,
        cursor: `${context.cursorLine}:${context.cursorChar}`,
        previousCodeLength: context.previousCode.length,
        variablesCount: context.allVariables.length,
        functionsCount: context.allFunctions.length,
        hasCommentIntent: !!commentIntent,
        hasActiveErrors: !!activeErrors
    });

    return context;
}

function getOpenTabsContext(currentFile: string, currentLanguage: string): string {
    const validLanguages = ["typescript", "javascript", "typescriptreact", "javascriptreact", "csharp"];
    const snippets: string[] = [];

    for (const doc of vscode.workspace.textDocuments) {
        if (doc.fileName === currentFile) continue;
        if (doc.uri.scheme !== "file") continue;
        if (!validLanguages.includes(doc.languageId)) continue;

        const firstLines = doc.getText().split("\n").slice(0, 15).join("\n");
        const docNameParts = doc.fileName.split(/[/\\]/);
        const docName = docNameParts[docNameParts.length - 1];
        snippets.push(`// From ${docName}:\n${firstLines}`);
    }

    if (snippets.length === 0) return "";
    return snippets.join("\n\n").slice(0, 600);
}
