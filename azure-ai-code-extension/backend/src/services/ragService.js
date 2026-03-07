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

/**
 * Retrieve relevant documentation chunks from the vector database.
 * @param {string} query - The search query
 * @param {Object} options - Retrieval options
 * @param {number} options.maxResults - Maximum number of results to return
 * @param {string} options.sdkType - Azure SDK type to filter by (blob-storage, cosmos-db, etc.)
 * @returns {Promise<string[]>} - Array of relevant document strings
 */
async function retrieveRelevantDocs(query, options = {}) {
    const { maxResults = DEFAULT_RESULT_COUNT, sdkType } = options;
    
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

        // Build query parameters
        const queryParams = {
            queryEmbeddings: [embedding],
            nResults: maxResults,
            include: ['documents', 'metadatas', 'distances'],
        };

        // Add metadata filtering if SDK type is specified
        if (sdkType && sdkType !== 'unknown' && sdkType !== 'azure-generic') {
            // Map SDK types to search patterns for filtering
            const sdkPatterns = {
                'blob-storage': ['storage-blob', 'BlobService', 'blob storage'],
                'cosmos-db': ['cosmos', 'CosmosClient', 'cosmos db'],
                'identity': ['identity', 'credential', 'DefaultAzureCredential'],
                'keyvault': ['keyvault', 'SecretClient', 'key vault'],
                'service-bus': ['service-bus', 'ServiceBusClient']
            };

            const patterns = sdkPatterns[sdkType];
            if (patterns) {
                console.log(`[RAG] Filtering by SDK type: ${sdkType}`);
                // Note: ChromaDB where clauses work with exact metadata matches
                // Since our current metadata uses 'type: documentation', we'll retrieve all
                // and filter by source URLs post-retrieval for now
                // TODO: Re-embed chunks with service-specific metadata for better filtering
            }
        }

        const result = await collection.query(queryParams);

        let docs = result?.documents?.[0] || [];
        const metadatas = result?.metadatas?.[0] || [];

        // Post-retrieval filtering by source URL patterns
        if (sdkType && sdkType !== 'unknown' && sdkType !== 'azure-generic') {
            const sdkPatterns = {
                'blob-storage': ['storage-blob', 'blob'],
                'cosmos-db': ['cosmos'],
                'identity': ['identity'],
                'keyvault': ['keyvault'],
                'service-bus': ['service-bus']
            };

            const patterns = sdkPatterns[sdkType];
            if (patterns) {
                const filteredDocs = [];
                for (let i = 0; i < docs.length; i++) {
                    const doc = docs[i];
                    const metadata = metadatas[i] || {};
                    const source = metadata.source || '';
                    
                    // Check if source contains any of the SDK patterns
                    const matchesPattern = patterns.some(pattern => 
                        source.toLowerCase().includes(pattern.toLowerCase()) ||
                        doc.toLowerCase().includes(pattern.toLowerCase())
                    );
                    
                    if (matchesPattern) {
                        filteredDocs.push(doc);
                    }
                }

                // If filtering resulted in enough docs, use filtered set
                // Otherwise, fall back to unfiltered (to avoid empty results)
                if (filteredDocs.length > 0) {
                    docs = filteredDocs;
                    console.log(`[RAG] Filtered to ${docs.length} ${sdkType}-specific docs`);
                }
            }
        }

        return docs.filter(Boolean).slice(0, maxResults);
    } catch (error) {
        console.error(`[RAG] Retrieval failed: ${error.message}`);
        return [];
    }
}

exports.retrieveRelevantDocs = retrieveRelevantDocs;
