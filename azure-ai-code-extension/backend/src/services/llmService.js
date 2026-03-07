/**
 * LLM Service
 * Communicates with Groq API (OpenAI-compatible) to generate code completions.
 * Falls back to a mock response when GROQ_API_KEY is not configured.
 */

const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Generate a code completion from the LLM.
 * @param {{ role: string, content: string }[]} messages
 * @returns {Promise<string>} raw LLM text response
 */
exports.generateCompletion = async (messages) => {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    // ── Mock mode (no API key) ─────────────────────────
    if (!apiKey) {
        console.warn('[LLM] GROQ_API_KEY not set — returning mock suggestion');
        return getMockSuggestion(messages);
    }

    // ── Groq API call ──────────────────────────────────
    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model,
                messages,
                temperature: 0.2,
                max_tokens: 256,
                top_p: 1,
                stream: false,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                timeout: 15000, // 15s timeout
            }
        );

        const choice = response.data?.choices?.[0];
        if (!choice || !choice.message?.content) {
            throw new Error('Empty response from Groq API');
        }

        return choice.message.content;
    } catch (err) {
        if (err.response) {
            const status = err.response.status;
            const detail = err.response.data?.error?.message || JSON.stringify(err.response.data);
            throw new Error(`Groq API error (${status}): ${detail}`);
        }
        throw new Error(`LLM request failed: ${err.message}`);
    }
};

/**
 * Generate a completion from a single prompt string.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
exports.generate = async (prompt) => {
    const messages = [
        {
            role: 'user',
            content: prompt,
        },
    ];

    return exports.generateCompletion(messages);
};

// ── Mock suggestions for development/testing ───────────

function getMockSuggestion(messages) {
    const userMsg = messages.find((m) => m.role === 'user')?.content || '';
    const normalized = userMsg.toLowerCase();

    if (normalized.includes('upload a file to azure blob') && normalized.includes('defaultazurecredential')) {
        return `const credential = new DefaultAzureCredential();
const blobServiceClient = new BlobServiceClient(\`https://${'${process.env.AZURE_STORAGE_ACCOUNT_NAME}'}.blob.core.windows.net\`, credential);
const containerClient = blobServiceClient.getContainerClient(containerName);
await containerClient.createIfNotExists();
const blockBlobClient = containerClient.getBlockBlobClient(fileName);
await blockBlobClient.uploadData(fileBuffer);`;
    }

    if (userMsg.includes('BlobServiceClient') || userMsg.includes('blob-storage')) {
        return 'BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)';
    }
    if (userMsg.includes('CosmosClient') || userMsg.includes('cosmos-db')) {
        return 'new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY })';
    }
    if (userMsg.includes('DefaultAzureCredential') || userMsg.includes('identity')) {
        return 'new DefaultAzureCredential()';
    }

    return '// Azure SDK code suggestion placeholder';
}
