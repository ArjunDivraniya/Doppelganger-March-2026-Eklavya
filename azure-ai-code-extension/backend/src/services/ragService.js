const { ChromaClient } = require('chromadb');
const { createEmbedding: createTextEmbedding, getProvider } = require('./embeddingService');

const COLLECTION_NAME = 'azure_docs';
const DEFAULT_RESULT_COUNT = 3;

function createChromaClient() {
    const configured = (process.env.CHROMA_DB_PATH || '').trim();
    const fallbackUrl = 'http://localhost:8000';
    const chromaUrl = /^https?:\/\//i.test(configured) ? configured : fallbackUrl;

    const parsed = new URL(chromaUrl);
    const ssl = parsed.protocol === 'https:';
    const port = parsed.port ? Number(parsed.port) : ssl ? 443 : 8000;

    return new ChromaClient({
        host: parsed.hostname,
        port,
        ssl,
    });
}

async function getCollection(chromaClient) {
    return chromaClient.getOrCreateCollection({ name: COLLECTION_NAME });
}

async function generateEmbedding(text) {
    return createTextEmbedding(text);
}

async function retrieveRelevantDocs(query, maxResults = DEFAULT_RESULT_COUNT) {
    if (!query || !query.trim()) {
        return [];
    }

    try {
        if (getProvider() !== 'openai') {
            console.log(`[RAG] Using ${getProvider()} embeddings provider`);
        }

        const embedding = await generateEmbedding(query);
        const chroma = createChromaClient();
        const collection = await getCollection(chroma);

        const result = await collection.query({
            queryEmbeddings: [embedding],
            nResults: maxResults,
            include: ['documents', 'metadatas', 'distances'],
        });

        const docs = result?.documents?.[0] || [];
        return docs.filter(Boolean).slice(0, maxResults);
    } catch (error) {
        console.error(`[RAG] Retrieval failed: ${error.message}`);
        return [];
    }
}

exports.retrieveRelevantDocs = retrieveRelevantDocs;
