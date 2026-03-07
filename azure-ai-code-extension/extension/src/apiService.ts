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

export const BACKEND_READY: boolean = false;
// CHANGE THIS TO true WHEN BACKEND IS CONNECTED
// This is the ONLY line to change when switching from mock to real

export async function fetchSuggestion(
    context: CodeContext,
    backendUrl: string
): Promise<string | null> {
    // a) Check session cache
    const cached = getCached(context.cacheKey);
    if (cached) {
        console.log("[apiService] ✅ Session cache hit");
        return cached;
    }

    // b) If BACKEND_READY === false
    if (BACKEND_READY === false) {
        const result = getMockSuggestion(context.detectedServices, context.currentLine);
        if (result) {
            setCache(context.cacheKey, result);
            console.log("[apiService] 🎭 Mock response");
            return result;
        }
        return null;
    }

    // c) If BACKEND_READY === true
    const payload = {
        language: context.language,
        imports: context.imports,
        currentLine: context.currentLine,
        context: context.previousCode,
        detectedServices: context.detectedServices
    };

    try {
        const response = await axios.post(`${backendUrl}/suggest`, payload, {
            timeout: 5000,
            headers: { "Content-Type": "application/json" }
        });
        const suggestion = response.data?.suggestion;
        if (suggestion) {
            setCache(context.cacheKey, suggestion);
            console.log("[apiService] 🤖 API response");
            return suggestion;
        }
        return null;
    } catch (err: any) {
        console.log("[apiService] ❌ Error: " + err.message);
        return null;
    }
}
