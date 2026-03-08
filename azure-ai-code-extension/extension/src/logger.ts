import * as vscode from "vscode";

const output = vscode.window.createOutputChannel("AzureAI Debug");

function serialize(data: unknown): string {
    if (data === undefined) {
        return "";
    }

    if (typeof data === "string") {
        return data;
    }

    try {
        return JSON.stringify(data);
    } catch {
        return "[unserializable-data]";
    }
}

function stamp(level: "INFO" | "WARN" | "ERROR", scope: string, message: string, data?: unknown): void {
    const ts = new Date().toISOString();
    const suffix = data !== undefined ? ` | ${serialize(data)}` : "";
    const line = `[AzureAI] [${ts}] [${level}] [${scope}] ${message}${suffix}`;
    output.appendLine(line);
    console.log(line);
}

export function logInfo(scope: string, message: string, data?: unknown): void {
    stamp("INFO", scope, message, data);
}

export function logWarn(scope: string, message: string, data?: unknown): void {
    stamp("WARN", scope, message, data);
}

export function logError(scope: string, message: string, data?: unknown): void {
    stamp("ERROR", scope, message, data);
}

export function showDebugLogs(): void {
    output.show(true);
}
