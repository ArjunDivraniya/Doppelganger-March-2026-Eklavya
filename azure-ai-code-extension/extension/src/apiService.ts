// PHASE 4 — API SERVICE (Mock → Real API toggle)
// ACCEPTED SUGGESTION TRACKER

import axios from "axios";
import * as vscode from "vscode";
import { CodeContext } from "./contextBuilder";
import { getMockSuggestion } from "./mockData";
import { logError, logInfo, logWarn } from "./logger";

const sessionCache = new Map<string, string>();
const DEBUG_DISABLE_SESSION_CACHE = true;

// ── Accepted Suggestions Tracker ──────────────────────────────────
const acceptedSuggestions = new Set<string>();

export function markAsAccepted(suggestion: string): void {
    const key = suggestion.trim().slice(0, 80);
    acceptedSuggestions.add(key);
    // Keep Set bounded to 20 entries — evict oldest when full
    if (acceptedSuggestions.size > 20) {
        const oldest = acceptedSuggestions.values().next().value;
        if (oldest !== undefined) {
            acceptedSuggestions.delete(oldest);
        }
    }
    console.log("[apiService] ✅ Marked as accepted:", key.slice(0, 40));
}

export function wasAlreadyAccepted(suggestion: string): boolean {
    const key = suggestion.trim().slice(0, 80);
    return acceptedSuggestions.has(key);
}

export function getRemainingLines(
    fullSuggestion: string,
    currentFileText: string
): string | null {
    // Split suggestion into individual lines
    const suggestionLines = fullSuggestion
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0);

    // Split current file into individual lines
    const fileLines = currentFileText
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0);

    // Find how many suggestion lines already exist in file
    let matchedCount = 0;
    for (const suggLine of suggestionLines) {
        const existsInFile = fileLines.some(fileLine =>
            fileLine === suggLine
        );
        if (existsInFile) {
            matchedCount++;
        } else {
            break; // stop at first line not yet written
        }
    }

    // If no lines matched — return full suggestion
    if (matchedCount === 0) return fullSuggestion;

    // If ALL lines already written — return null (nothing left)
    if (matchedCount >= suggestionLines.length) {
        console.log("[apiService] 🚫 All suggestion lines already written");
        return null;
    }

    // Return only the remaining unwritten lines
    const remaining = suggestionLines
        .slice(matchedCount)
        .join("\n");

    console.log(
        "[apiService] 📋 Returning remaining",
        suggestionLines.length - matchedCount,
        "lines of",
        suggestionLines.length
    );

    return remaining;
}

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

/**
 * Cleans and formats a raw suggestion string from the API or mock.
 * Handles escaped characters, markdown fences, excess blank lines, etc.
 */
function cleanSuggestion(raw: string): string {
    return raw
        .replace(/\\n/g, "\n")         // fix escaped newlines → real newlines
        .replace(/\\t/g, "\t")         // fix escaped tabs → real tabs
        .replace(/\\r/g, "")           // remove carriage returns
        .replace(/\\"/g, '"')          // fix escaped double quotes
        .replace(/\\'/g, "'")          // fix escaped single quotes
        .replace(/^```[\w]*\n?/, "")    // strip opening markdown fence
        .replace(/\n?```$/, "")         // strip closing markdown fence
        .replace(/^\n+/, "")            // remove leading newlines
        .replace(/\n{3,}/g, "\n\n")     // collapse 3+ blank lines to 1
        .trim();                         // remove leading/trailing whitespace
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
        if (!result) return null;
        const cleanedMock = cleanSuggestion(result);
        const remainingMock = getRemainingLines(cleanedMock, context.previousCode);
        if (!remainingMock) return null;
        return remainingMock;
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
            const cleaned = cleanSuggestion(suggestion);
            if (!DEBUG_DISABLE_SESSION_CACHE) {
                setCache(context.cacheKey, cleaned);
            }
            logInfo("ApiService", "DATA FLOW STEP 1: Backend response received by Extension logic", {
                latencyMs: Date.now() - startedAt,
                suggestionPreview: cleaned.slice(0, 50) + "..."
            });
            const remaining = getRemainingLines(cleaned, context.previousCode);
            if (!remaining) return null;
            return remaining;
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
            const fallback = getMockSuggestion(context.detectedServices, context.currentLine);
            if (!fallback) return null;
            const cleanedFallback = cleanSuggestion(fallback);
            const remainingFallback = getRemainingLines(cleanedFallback, context.previousCode);
            if (!remainingFallback) return null;
            return remainingFallback;
        }


        return null;
    }
}
