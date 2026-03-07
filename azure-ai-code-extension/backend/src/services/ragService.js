/**
 * RAG Service (Stub)
 *
 * This module is a placeholder for the Retrieval-Augmented Generation pipeline.
 * Another backend developer will implement the actual vector search / document
 * retrieval logic here.
 *
 * TODO: Replace the stub with real RAG retrieval (e.g. Pinecone, Weaviate,
 *       Azure AI Search, or a local FAISS index).
 */

// Placeholder documentation snippets keyed by SDK type
const STUB_DOCS = {
    'blob-storage': `
Azure Blob Storage SDK – Quick Reference:
• BlobServiceClient.fromConnectionString(connStr) – create a client
• blobServiceClient.getContainerClient(name) – get a container ref
• containerClient.uploadBlockBlob(blobName, data, length) – upload a blob
• containerClient.listBlobsFlat() – list blobs in a container
• blockBlobClient.downloadToBuffer() – download blob content
    `.trim(),

    'cosmos-db': `
Azure Cosmos DB SDK – Quick Reference:
• new CosmosClient({ endpoint, key }) – create a client
• client.database(dbId).container(containerId) – get a container ref
• container.items.create(item) – insert a document
• container.items.query(querySpec).fetchAll() – query documents
• container.item(id, partitionKey).read() – read a single document
    `.trim(),

    'identity': `
Azure Identity SDK – Quick Reference:
• new DefaultAzureCredential() – automatic credential chain
• new ClientSecretCredential(tenantId, clientId, clientSecret) – service principal
• new ManagedIdentityCredential() – for Azure-hosted apps
    `.trim(),
};

/**
 * Retrieve relevant Azure SDK documentation based on the detected SDK and intent.
 * @param {string} sdkType — e.g. 'blob-storage', 'cosmos-db'
 * @param {string} intent — e.g. 'create-client', 'upload', 'query'
 * @returns {Promise<string>} — relevant documentation text
 */
exports.retrieveDocumentation = async (sdkType, intent) => {
    // TODO: Replace with actual RAG retrieval logic
    //   1. Convert sdkType + intent into a query embedding
    //   2. Search vector store for relevant documentation chunks
    //   3. Return the top-k results concatenated

    console.log(`[RAG-STUB] Retrieving docs for SDK: ${sdkType}, Intent: ${intent}`);

    return STUB_DOCS[sdkType] || STUB_DOCS['blob-storage'];
};
