// PHASE 2 — CONTEXT BUILDER

import * as vscode from "vscode";
import { DetectionResult } from "./azureDetector";

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

    // e) cacheKey
    const cacheKey = [
        ...detection.detectedServices,
        currentLine.trim().slice(0, 40)
    ].join(":");

    // f) Return full CodeContext object
    return {
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
}
