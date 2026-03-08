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

const AZURE_KEYWORDS = /azure|blob|cosmos|keyvault|secret|storage|servicebus|eventhub|credential/i;

const AZURE_FILE_NAME = /azure[-.]|\.azure\.|azure-config|azureservice/;

const KEYWORD_SERVICE_MAP: Record<string, string> = {
    "blob": "blob-storage",
    "storage": "blob-storage",
    "cosmos": "cosmos-db",
    "secret": "key-vault",
    "keyvault": "key-vault",
    "credential": "azure-identity",
    "identity": "azure-identity",
    "servicebus": "service-bus",
    "eventhub": "event-hubs",
    "textanalytics": "cognitive-services"
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
    // FORCE ACTIVATION MODE: only enabled by a top-of-file debug marker
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

    // d) keywordMatch
    const keywordMatch = AZURE_KEYWORDS.test(currentLine) || AZURE_KEYWORDS.test(fullText.slice(0, 500));

    // e) fileMatch
    const fileMatch = AZURE_FILE_NAME.test(fileName);

    // f) isAzure (force activation mode bypasses all checks)
    const isAzure = forceActivationMode || detectedServices.length > 0 || keywordMatch || fileMatch;

    // If isAzure is true but no services detected via imports, try mapping from keywords
    if (isAzure && detectedServices.length === 0) {
        for (const [kw, service] of Object.entries(KEYWORD_SERVICE_MAP)) {
            if (currentLine.toLowerCase().includes(kw.toLowerCase())) {
                detectedServices.push(service);
            }
        }
        // Fallback to a broad Azure identity suggestion when no service keyword exists.
        if (detectedServices.length === 0) {
            detectedServices.push("azure-identity");
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
