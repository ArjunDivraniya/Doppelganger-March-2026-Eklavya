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

const AZURE_KEYWORDS = [
    "azure",
    "blob",
    "cosmos",
    "keyvault",
    "secret",
    "storage",
    "servicebus",
    "eventhub",
    "credential",
    "client",
    "bus",
    "identity",
    "vault",
    "table",
    "queue",
    "auth"
];

const AZURE_FILE_NAME = /azure[-.]|\.azure\.|azure-config|azureservice/;

const KEYWORD_SERVICE_MAP: Record<string, string> = {
    "blob": "blob-storage",
    "storage": "blob-storage",
    "cosmos": "cosmos-db",
    "secret": "key-vault",
    "keyvault": "key-vault",
    "vault": "key-vault",
    "credential": "azure-identity",
    "identity": "azure-identity",
    "auth": "azure-identity",
    "servicebus": "service-bus",
    "bus": "service-bus",
    "eventhub": "event-hubs",
    "textanalytics": "cognitive-services",
    "table": "storage-table",
    "queue": "storage-queue"
};

const FORCE_ACTIVATION_MARKER = "// @azure-debug";

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
    const lowerCurrentLine = currentLine.toLowerCase();
    const lowerFullText = fullText.toLowerCase();
    const lowerFileName = fileName.toLowerCase();

    // Force activation mode: enabled by a top-of-file debug marker.
    const firstLines = fullText.split("\n").slice(0, 10).join("\n");
    const forceActivationMode = firstLines.includes(FORCE_ACTIVATION_MARKER);

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

    // Keyword-first detection, case-insensitive on current line and full text.
    const keywordHitsCurrentLine = AZURE_KEYWORDS.filter(keyword => lowerCurrentLine.includes(keyword));
    const keywordHitsFullText = AZURE_KEYWORDS.filter(keyword => lowerFullText.includes(keyword));
    const keywordMatch = keywordHitsCurrentLine.length > 0 || keywordHitsFullText.length > 0;

    // Force trigger for JS/TS files even before imports are added.
    const isJsOrTsFile = /\.(ts|tsx|js|jsx)$/.test(lowerFileName);
    const forcedWords = ["blob", "cosmos", "client", "storage", "secret", "vault"];
    const forceTrigger = isJsOrTsFile && forcedWords.some(word => lowerCurrentLine.includes(word));

    // e) fileMatch
    const fileMatch = AZURE_FILE_NAME.test(lowerFileName);

    // Imports are no longer required to activate Azure pipeline.
    const isAzure = forceActivationMode || forceTrigger || detectedServices.length > 0 || keywordMatch || fileMatch;


    // If Azure context is detected but imports are missing, derive services from keywords.
    if (isAzure && detectedServices.length === 0) {
        for (const [kw, service] of Object.entries(KEYWORD_SERVICE_MAP)) {
            if (lowerCurrentLine.includes(kw.toLowerCase()) || lowerFullText.includes(kw.toLowerCase())) {
                detectedServices.push(service);
            }
        }

        // Keep payload non-empty when any Azure keyword exists.
        if (detectedServices.length === 0) {
            detectedServices.push("generic-azure");
        }
    }

    const uniqueServices = Array.from(new Set(detectedServices));

    // g) Return result
    return {
        isAzure,
        detectedServices: uniqueServices,
        detectedImports
    };
}
