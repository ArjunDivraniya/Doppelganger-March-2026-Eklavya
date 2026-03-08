// config.ts
// Centralized configuration file for the AzureAI Code Extension

export const config = {
    // ── Backend Connection ─────────────────────────────────
    // URL of the local or remote backend server
    BACKEND_URL: (process.env.BACKEND_URL && process.env.BACKEND_URL.trim() !== "")
        ? process.env.BACKEND_URL
        : "https://azure-ai-code-backend.onrender.com",

    // Set to true to connect to the actual backend.
    // Set to false to force OFFLINE mode (mocks only).
    BACKEND_READY: true,

    // If the backend request fails or times out, should we fallback to local mock data?
    FALLBACK_TO_MOCK_ON_BACKEND_ERROR: true,

    // ── Debugging ──────────────────────────────────────────
    // Disable extension-level session caching to always fetch fresh completions
    DEBUG_DISABLE_SESSION_CACHE: true,
};
