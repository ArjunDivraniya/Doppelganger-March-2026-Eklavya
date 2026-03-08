// PHASE 4 — API SERVICE (Mock → Real API toggle)

import axios from "axios";
import { CodeContext } from "./contextBuilder";
import { getMockSuggestion } from "./mockData";
import { logError, logInfo, logWarn } from "./logger";

const sessionCache = new Map<string, string>();

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
        logInfo("ApiService", "Mock mode active", {
            hasSuggestion: !!result,
            services: context.detectedServices
        });
        return result;
    }

    // Session cache is only used for backend responses.
    const cached = getCached(context.cacheKey);
    if (cached) {
        logInfo("ApiService", "Session cache hit", {
            cacheKey: context.cacheKey,
            suggestionLength: cached.length
        });
        return cached;
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

    logInfo("ApiService", "Sending backend request", {
        url: `${backendUrl}/suggest`,
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
        const response = await axios.post(`${backendUrl}/suggest`, payload, {
            timeout: 8000, // Slightly longer timeout for LLM
            headers: { "Content-Type": "application/json" }
        });

        const suggestion = response.data?.suggestion;
        if (suggestion) {
            setCache(context.cacheKey, suggestion);
            logInfo("ApiService", "Backend response received", {
                latencyMs: Date.now() - startedAt,
                status: response.status,
                suggestionLength: suggestion.length
            });
            return suggestion;
        }

        logWarn("ApiService", "Backend returned no suggestion", {
            latencyMs: Date.now() - startedAt,
            status: response.status,
            responseKeys: Object.keys(response.data ?? {})
        });
        return null;
    } catch (err: any) {
        logError("ApiService", "Backend request failed", {
            latencyMs: Date.now() - startedAt,
            status: err.response?.status,
            backendError: err.response?.data?.error,
            message: err.message
        });

        if (FALLBACK_TO_MOCK_ON_BACKEND_ERROR) {
            const fallback = getMockSuggestion(context.detectedServices, context.currentLine);
            logWarn("ApiService", "Using mock fallback after backend failure", {
                hasSuggestion: !!fallback,
                services: context.detectedServices
            });
            return fallback;
        }

        return null;
    }
}
