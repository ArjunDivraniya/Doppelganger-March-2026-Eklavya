// MOCK DATA — Temporary backend replacement (swap out when API is ready)

export const MOCK_SUGGESTIONS: Record<string, string> = {
    "blob-storage:BlobServiceClient": `// [AzureAI Suggest]
const blobServiceClient = new BlobServiceClient(
  \`https://\${accountName}.blob.core.windows.net\`,
  new DefaultAzureCredential()
);`,

    "blob-storage:upload": `// [AzureAI Suggest]
const containerClient = blobServiceClient.getContainerClient(containerName);
const blockBlobClient = containerClient.getBlockBlobClient(blobName);
const uploadBlobResponse = await blockBlobClient.upload(content, content.length);
console.log("Upload block blob success:", uploadBlobResponse.requestId);`,

    "blob-storage:download": `const blobClient = containerClient.getBlobClient(blobName);
const downloadResponse = await blobClient.download(0);
const downloaded = await streamToBuffer(downloadResponse.readableStreamBody!);`,

    "cosmos-db:CosmosClient": `const client = new CosmosClient({ endpoint, key });
const { database } = await client.databases.createIfNotExists({ id: databaseId });
const { container } = await database.containers.createIfNotExists({ id: containerId });`,

    "cosmos-db:query": `const querySpec = { query: "SELECT * FROM c WHERE c.id = @id", parameters: [{ name: "@id", value: itemId }] };
const { resources: items } = await container.items.query(querySpec).fetchAll();`,

    "key-vault:SecretClient": `const credential = new DefaultAzureCredential();
const client = new SecretClient(vaultUrl, credential);
const secret = await client.getSecret(secretName);
console.log("Secret value:", secret.value);`,

    "azure-identity:DefaultAzureCredential": `const credential = new DefaultAzureCredential();
// Automatically tries: Environment Variables → Managed Identity → VS Code → Azure CLI
// Use this instead of connection strings for production security.`,

    "service-bus:ServiceBusClient": `const sbClient = new ServiceBusClient(connectionString);
const sender = sbClient.createSender(queueName);
await sender.sendMessages({ body: "Hello Azure Service Bus!" });
await sender.close();
await sbClient.close();`,

    "event-hubs:EventHubProducerClient": `const producer = new EventHubProducerClient(connectionString, eventHubName);
const batch = await producer.createBatch();
batch.tryAdd({ body: "First event" });
await producer.sendBatch(batch);
await producer.close();`,

    "cognitive-services:TextAnalyticsClient": `const client = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));
const sentimentResult = await client.analyzeSentiment(["I love Azure!"]);
sentimentResult.forEach(doc => console.log("Sentiment:", doc.sentiment));`,

    // Default fallbacks (service-only keys)
    "blob-storage": `// Default Blob Storage setup
const blobServiceClient = new BlobServiceClient(endpoint, new DefaultAzureCredential());`,
    "cosmos-db": `// Default Cosmos DB setup
const client = new CosmosClient({ endpoint, key });`,
    "key-vault": `// Default Key Vault setup
const client = new SecretClient(vaultUrl, new DefaultAzureCredential());`,
    "azure-identity": `// Default Azure Identity
const credential = new DefaultAzureCredential();`,
    "service-bus": `// Default Service Bus
const sbClient = new ServiceBusClient(connectionString);`,
    "event-hubs": `// Default Event Hubs
const producer = new EventHubProducerClient(connectionString, eventHubName);`,
};

export function getMockSuggestion(
    detectedServices: string[],
    currentLine: string
): string | null {
    const currentLineLower = currentLine.toLowerCase();

    for (const service of detectedServices) {
        // Try keyword match first (CASE-INSENSITIVE)
        for (const key in MOCK_SUGGESTIONS) {
            if (key.startsWith(service + ":")) {
                const keyword = key.split(":")[1];
                // Case-insensitive match: check if keyword appears in currentLine
                if (currentLineLower.includes(keyword.toLowerCase())) {
                    return MOCK_SUGGESTIONS[key];
                }
            }
        }
        // Fallback to service-only key (handles generic service names like 'blob' or 'cosmos')
        if (MOCK_SUGGESTIONS[service]) {
            return MOCK_SUGGESTIONS[service];
        }
    }
    return null;
}
