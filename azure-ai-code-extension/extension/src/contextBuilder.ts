// PHASE 2 — CONTEXT BUILDER

import * as vscode from "vscode";
import { DetectionResult } from "./azureDetector";
import { logInfo } from "./logger";

export interface CodeContext {
    language: string;
    fileName: string;
    imports: string[];
    detectedServices: string[];
    currentLine: string;
    previousCode: string;
    cursorLine: number;
    cursorChar: number;
    cacheKey: string;
}

export function buildContext(
    document: vscode.TextDocument,
    position: vscode.Position,
    detection: DetectionResult
): CodeContext {
    // a) lines
    const lines = document.getText().split("\n");

    // b) startLine
    const startLine = Math.max(0, position.line - 20);

    // c) previousCode
    const previousCode = lines.slice(startLine, position.line).join("\n");

    // d) currentLine
    const currentLine = lines[position.line] ?? "";

    const previousTail = previousCode.slice(-160).replace(/\s+/g, " ").trim();

    // e) cacheKey
    const cacheKey = [
        ...detection.detectedServices,
        String(position.line),
        currentLine.trim().slice(0, 60),
        previousTail
    ].join(":");

    // f) Return full CodeContext object
    const context: CodeContext = {
        language: document.languageId,
        fileName: document.fileName,
        imports: detection.detectedImports,
        detectedServices: detection.detectedServices,
        currentLine: currentLine,
        previousCode: previousCode,
        cursorLine: position.line,
        cursorChar: position.character,
        cacheKey: cacheKey
    };

    logInfo("ContextBuilder", "Context built", {
        file: context.fileName,
        language: context.language,
        importsCount: context.imports.length,
        services: context.detectedServices,
        cursor: `${context.cursorLine}:${context.cursorChar}`,
        currentLinePreview: context.currentLine.trim().slice(0, 100),
        previousCodeLength: context.previousCode.length,
        cacheKey: context.cacheKey
    });

    return context;
}
