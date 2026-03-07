const OpenAI = require('openai');
const { ChromaClient } = require('chromadb');

const COLLECTION_NAME = 'azure_docs';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const DEFAULT_RESULT_COUNT = 3;

function createOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is missing.');
    }

    return new OpenAI({ apiKey });
}

function createChromaClient() {
    const chromaPath = process.env.CHROMA_DB_PATH || 'http://localhost:8000';
    return new ChromaClient({ path: chromaPath });
}

async function getCollection(chromaClient) {
    return chromaClient.getOrCreateCollection({ name: COLLECTION_NAME });
}

async function generateEmbedding(text) {
    const openai = createOpenAIClient();
    const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
    });

    const vector = response?.data?.[0]?.embedding;
    if (!vector) {
        throw new Error('Failed to generate query embedding.');
    }

    return vector;
}

async function retrieveRelevantDocs(query, maxResults = DEFAULT_RESULT_COUNT) {
    if (!query || !query.trim()) {
        return [];
    }

    try {
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
