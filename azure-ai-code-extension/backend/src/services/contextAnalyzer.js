/**
 * Context Analyzer
 * Examines the incoming code context to determine:
 *   - Which Azure SDK is being used (Blob Storage, Cosmos DB, Identity, etc.)
 *   - The developer's intent (creating a client, uploading, downloading, querying, etc.)
 *   - Current code location / action
 */

// Azure SDK package → friendly name mapping
const SDK_MAP = {
    '@azure/storage-blob': 'blob-storage',
    '@azure/cosmos': 'cosmos-db',
    '@azure/identity': 'identity',
    '@azure/keyvault-secrets': 'keyvault',
    '@azure/service-bus': 'service-bus',
    'Azure.Storage': 'blob-storage',
    'Microsoft.Azure.Cosmos': 'cosmos-db',
};

// Intent keywords → intent label
const INTENT_PATTERNS = [
    { patterns: ['BlobServiceClient', 'CosmosClient', 'SecretClient', 'ServiceBusClient', 'new ', 'create', 'fromConnectionString', 'connect', 'initialize', 'setup'], intent: 'create-client' },
    { patterns: ['upload', 'uploadBlob', 'uploadData', 'uploadStream', 'put', 'send', 'write'], intent: 'upload' },
    { patterns: ['download', 'downloadToBuffer', 'downloadToFile', 'get', 'receive', 'read', 'fetch'], intent: 'download' },
    { patterns: ['listBlobs', 'listContainers', 'list', 'iterate', 'find'], intent: 'list' },
    { patterns: ['delete', 'deleteBlob', 'deleteContainer', 'deleteItem', 'remove'], intent: 'delete' },
    { patterns: ['query', 'queryItems', 'fetchAll', 'readAll', 'search'], intent: 'query' },
    { patterns: ['container', 'getContainerClient', 'createContainer', 'database', 'table', 'queue'], intent: 'container-setup' },
    { patterns: ['credential', 'DefaultAzureCredential', 'ClientSecretCredential', 'auth', 'login'], intent: 'authentication' },
];

/**
 * Analyze the incoming code context.
 * @param {{ language: string, imports: string[], currentLine: string, context: string }} input
 * @returns {{ sdkType: string, intent: string, codeLocation: string }}
 */
exports.analyze = ({ imports = [], currentLine = '', context = '' }) => {
    const sdkType = detectSdk(imports, context, currentLine);
    const intent = detectIntent(currentLine, context);
    const codeLocation = detectCodeLocation(currentLine);

    return { sdkType, intent, codeLocation };
};

// ── Internal helpers ───────────────────────────────────

function detectSdk(imports, context, currentLine) {
    const combined = [...imports, context, currentLine].join(' ');
    for (const [pkg, name] of Object.entries(SDK_MAP)) {
        if (combined.includes(pkg)) return name;
    }
    // Fallback: check for generic Azure keywords
    if (combined.toLowerCase().includes('azure')) return 'azure-generic';
    return 'unknown';
}

function detectIntent(currentLine, context) {
    const combined = `${currentLine} ${context}`;
    for (const { patterns, intent } of INTENT_PATTERNS) {
        if (patterns.some((p) => combined.includes(p))) return intent;
    }
    return 'general';
}

function detectCodeLocation(currentLine) {
    const trimmed = currentLine.trim();
    if (trimmed.startsWith('const ') || trimmed.startsWith('let ') || trimmed.startsWith('var ')) return 'variable-declaration';
    if (trimmed.startsWith('await ')) return 'async-call';
    if (trimmed.startsWith('return ')) return 'return-statement';
    if (trimmed.includes('= ')) return 'assignment';
    if (trimmed.includes('(')) return 'function-call';
    return 'inline';
}
