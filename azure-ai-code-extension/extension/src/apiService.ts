// PHASE 4 — API SERVICE (Mock → Real API toggle)

import axios from "axios";
import * as vscode from "vscode";
import { CodeContext } from "./contextBuilder";
import { getMockSuggestion } from "./mockData";
import { logError, logInfo, logWarn } from "./logger";

const sessionCache = new Map<string, string>();
const DEBUG_DISABLE_SESSION_CACHE = true;

function normalizeBackendBaseUrl(rawUrl: string): string {
    const trimmed = rawUrl.trim().replace(/\/+$/, "");

    // Always prefer loopback IP to avoid localhost resolution delays in Extension Host.
    if (/^https?:\/\/localhost(?=[:/]|$)/i.test(trimmed)) {
        return trimmed.replace(/^http:\/\/localhost(?=[:/]|$)/i, "http://127.0.0.1");
    }

    if (!/^https?:\/\//i.test(trimmed)) {
        return "http://127.0.0.1:3005";
    }

    return trimmed;
}

function getCached(key: string): string | null {
    return sessionCache.get(key) ?? null;
}

function setCache(key: string, value: string): void {
    sessionCache.set(key, value);
    if (sessionCache.size > 50) {
        const firstKey = sessionCache.keys().next().value;
        if (firstKey !== undefined) {
            sessionCache.delete(firstKey);
        }
    }
}

export const BACKEND_READY: boolean = true;
const FALLBACK_TO_MOCK_ON_BACKEND_ERROR: boolean = true;
// CHANGE THIS TO true WHEN BACKEND IS CONNECTED
// This is the ONLY line to change when switching from mock to real

export async function fetchSuggestion(
    context: CodeContext,
    backendUrl: string
): Promise<string | null> {
    const startedAt = Date.now();

    // Always execute mock generation while backend is disabled.
    if (BACKEND_READY === false) {
        const result = getMockSuggestion(context.detectedServices, context.currentLine);
        logInfo("ApiService", "OFFLINE MODE: Using mock suggestions (BACKEND_READY=false)", {
            hasSuggestion: !!result,
            services: context.detectedServices
        });
        return result;
    }


    // Debug phase: bypass session cache so every keystroke makes a fresh backend request.
    if (!DEBUG_DISABLE_SESSION_CACHE) {
        const cached = getCached(context.cacheKey);
        if (cached) {
            logInfo("ApiService", "Session cache hit", {
                cacheKey: context.cacheKey,
                suggestionLength: cached.length
            });
            return cached;
        }
    }

    // Prepare full payload for the backend
    const payload = {
        language: context.language,
        imports: context.imports,
        currentLine: context.currentLine,
        context: context.previousCode,
        cursorPosition: {
            line: context.cursorLine,
            character: context.cursorChar
        }
    };

    const normalizedBase = normalizeBackendBaseUrl(backendUrl || "http://127.0.0.1:3005");
    const targetUrl = `${normalizedBase}/suggest`;

    logInfo("ApiService", "Sending backend request", {
        url: targetUrl,
        payload: {
            language: payload.language,
            imports: payload.imports,
            detectedServices: context.detectedServices,
            currentLinePreview: payload.currentLine.trim().slice(0, 100),
            previousCodeLength: payload.context.length,
            cursorPosition: payload.cursorPosition,
            cacheKey: context.cacheKey
        }
    });

    try {
        const response = await axios.post(targetUrl, payload, {
            timeout: 10000, // 10s timeout for backend LLM processing
            headers: { "Content-Type": "application/json" }
        });

        const suggestion = response.data?.suggestion;
        if (suggestion) {
            if (!DEBUG_DISABLE_SESSION_CACHE) {
                setCache(context.cacheKey, suggestion);
            }
            logInfo("ApiService", "DATA FLOW STEP 1: Backend response received by Extension logic", {
                latencyMs: Date.now() - startedAt,
                suggestionPreview: suggestion.slice(0, 50) + "..."
            });
            return suggestion;
        }

        return null;
    } catch (err: any) {
        const latencyMs = Date.now() - startedAt;
        const status = err.response?.status;

        if (status === 500) {
            logError("ApiService", "Backend 500 Internal Server Error", { latencyMs });
        } else if (err.code === 'ECONNABORTED') {
            logError("ApiService", "Backend request timeout", { latencyMs });
        } else {
            logError("ApiService", "Backend request failed", {
                latencyMs,
                status,
                message: err.message
            });
        }

        vscode.window.showErrorMessage(
            `AzureAI backend unreachable at ${targetUrl}. ${err?.message ?? "Unknown error"}`
        );

        if (FALLBACK_TO_MOCK_ON_BACKEND_ERROR) {
            logWarn("ApiService", "BACKEND UNAVAILABLE: Using mock fallback suggestion", {
                originalError: err.message,
                services: context.detectedServices
            });
            return getMockSuggestion(context.detectedServices, context.currentLine);
        }


        return null;
    }
}
