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

const SERVICE_ALIASES: Record<string, string[]> = {
    "blob-storage": ["blob", "storage", "blobserviceclient"],
    "cosmos-db": ["cosmos", "cosmosclient"],
    "key-vault": ["keyvault", "secret", "secretclient", "vault"],
    "azure-identity": ["credential", "defaultazurecredential", "identity"],
    "service-bus": ["servicebus", "service bus", "servicebusclient"],
    "event-hubs": ["eventhub", "event hub", "eventhubproducerclient"],
    "cognitive-services": ["textanalytics", "text analytics", "analytics"]
};

export function getMockSuggestion(
    detectedServices: string[],
    currentLine: string,
    previousCode: string = ""
): string | null {
    const currentLineLower = currentLine.toLowerCase();
    const previousCodeLower = previousCode.toLowerCase();
    const candidateServices = new Set(detectedServices);

    /**
     * Helper to check if a suggestion (roughly) already exists in the code.
     * Normalizes by removing whitespace and comments to avoid being fooled by formatting.
     */
    const isCodeAlreadyPresent = (suggestion: string): boolean => {
        const normalize = (s: string) => s.replace(/\s+/g, "").replace(/\/\/.*$/gm, "").toLowerCase();
        const normSug = normalize(suggestion);
        if (!normSug) return false;
        return normalize(previousCode).includes(normSug);
    };

    // Recover from sparse detection by inferring service from what the developer typed.
    for (const [service, aliases] of Object.entries(SERVICE_ALIASES)) {
        if (aliases.some((alias) => currentLineLower.includes(alias.toLowerCase()))) {
            candidateServices.add(service);
        }
    }

    for (const service of Array.from(candidateServices)) {
        // 1. Try specific keyword matches first (e.g., "blob-storage:upload")
        // We iterate through all keys to find matches for the current service.
        const specificMatches = Object.keys(MOCK_SUGGESTIONS).filter(k => k.startsWith(service + ":"));

        for (const key of specificMatches) {
            const keyword = key.split(":")[1];
            if (currentLineLower.includes(keyword.toLowerCase())) {
                const suggestion = MOCK_SUGGESTIONS[key];
                if (!isCodeAlreadyPresent(suggestion)) {
                    return suggestion;
                }
            }
        }

        // 2. Continuous flow logic: If generic service is detected, suggest the next sensible thing.
        // For blob storage, if they have the client, suggest container, etc.
        if (service === "blob-storage") {
            const flow = [
                MOCK_SUGGESTIONS["blob-storage:BlobServiceClient"],
                MOCK_SUGGESTIONS["blob-storage:upload"],
                MOCK_SUGGESTIONS["blob-storage:download"]
            ];
            for (const step of flow) {
                if (step && !isCodeAlreadyPresent(step)) {
                    return step;
                }
            }
        }

        // 3. Fallback to service-only key (generic setup)
        const genericSuggestion = MOCK_SUGGESTIONS[service];
        if (genericSuggestion && !isCodeAlreadyPresent(genericSuggestion)) {
            return genericSuggestion;
        }
    }
    return null;
}
