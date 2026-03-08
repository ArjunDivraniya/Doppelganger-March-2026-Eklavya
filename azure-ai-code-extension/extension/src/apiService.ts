// PHASE 4 — API SERVICE (Mock → Real API toggle)

import axios from "axios";
import { CodeContext } from "./contextBuilder";
import { getMockSuggestion } from "./mockData";

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
// CHANGE THIS TO true WHEN BACKEND IS CONNECTED
// This is the ONLY line to change when switching from mock to real

export async function fetchSuggestion(
    context: CodeContext,
    backendUrl: string
): Promise<string | null> {
    // Always execute mock generation while backend is disabled.
    if (BACKEND_READY === false) {
        const result = getMockSuggestion(context.detectedServices, context.currentLine);
        console.log(`[apiService] Mock mode active, result: ${result ? "[apiService] 🎭 Mock response" : "NO"}`);
        return result;
    }

    // Session cache is only used for backend responses.
    const cached = getCached(context.cacheKey);
    if (cached) {
        console.log("[apiService] 💾 session cache hit");
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

    console.log(`[apiService] 📡 Fetching from: ${backendUrl}/suggest`);

    try {
        const response = await axios.post(`${backendUrl}/suggest`, payload, {
            timeout: 8000, // Slightly longer timeout for LLM
            headers: { "Content-Type": "application/json" }
        });

        const suggestion = response.data?.suggestion;
        if (suggestion) {
            setCache(context.cacheKey, suggestion);
            console.log("[apiService] ✅ backend response received");
            return suggestion;
        }

        console.log("[apiService] ⚠️ backend returned no suggestion");
        return null;
    } catch (err: any) {
        console.error("[apiService] ❌ backend error: " + (err.response?.data?.error || err.message));
        return null;
    }
}
