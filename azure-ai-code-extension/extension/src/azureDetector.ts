// PHASE 1 — AZURE DETECTOR

export const AZURE_SDK_MAP: Record<string, string> = {
    // JS/TS imports
    "@azure/storage-blob": "blob-storage",
    "@azure/cosmos": "cosmos-db",
    "@azure/keyvault-secrets": "key-vault",
    "@azure/keyvault-keys": "key-vault",
    "@azure/identity": "azure-identity",
    "@azure/service-bus": "service-bus",
    "@azure/event-hubs": "event-hubs",
    "@azure/ai-text-analytics": "cognitive-services",
    "@azure/communication-sms": "communication-services",
    "@azure/search-documents": "cognitive-search",

    // C# usings
    "Azure.Storage.Blobs": "blob-storage",
    "Azure.Cosmos": "cosmos-db",
    "Azure.Security.KeyVault.Secrets": "key-vault",
    "Azure.Identity": "azure-identity",
    "Microsoft.Azure.ServiceBus": "service-bus",
    "Microsoft.Azure.EventHubs": "event-hubs"
};

const AZURE_KEYWORDS = /azure|blobclient|cosmosclient|keyvault|storageaccount|serviceBus|eventhub|DefaultAzureCredential|BlobServiceClient|CosmosClient|SecretClient/i;

const AZURE_FILE_NAME = /azure[-.]|\.azure\.|azure-config|azureservice/;

export interface DetectionResult {
    isAzure: boolean;
    detectedServices: string[];
    detectedImports: string[];
}

export function detectAzure(
    fullText: string,
    currentLine: string,
    fileName: string
): DetectionResult {
    // a) Find JS/TS imports
    const tsImportRegex = /from\s+['"](@azure\/[^'"]+)['"]/g;
    const tsImports = Array.from(fullText.matchAll(tsImportRegex)).map(m => m[1]);

    // b) Find C# usings
    const csUsingRegex = /using\s+(Azure\.[^\s;]+|Microsoft\.Azure\.[^\s;]+)/g;
    const csUsings = Array.from(fullText.matchAll(csUsingRegex)).map(m => m[1]);

    const detectedImports = [...tsImports, ...csUsings];

    // c) Map all found strings through AZURE_SDK_MAP
    const detectedServices = Array.from(new Set(
        detectedImports
            .map(imp => AZURE_SDK_MAP[imp])
            .filter((service): service is string => !!service)
    ));

    // d) keywordMatch
    const keywordMatch = AZURE_KEYWORDS.test(currentLine) || AZURE_KEYWORDS.test(fullText.slice(0, 500));

    // e) fileMatch
    const fileMatch = AZURE_FILE_NAME.test(fileName);

    // f) isAzure
    const isAzure = detectedServices.length > 0 || keywordMatch || fileMatch;

    // g) Return result
    return {
        isAzure,
        detectedServices,
        detectedImports
    };
}
