import * as vscode from "vscode";

// Map recognizing common Azure SDK symbols and their respective npm packages.
export const AZURE_IMPORT_MAP: Record<string, { pkg: string, isDefault?: boolean }> = {
    BlobServiceClient: { pkg: "@azure/storage-blob" },
    ContainerClient: { pkg: "@azure/storage-blob" },
    BlockBlobClient: { pkg: "@azure/storage-blob" },
    CosmosClient: { pkg: "@azure/cosmos" },
    SecretClient: { pkg: "@azure/keyvault-secrets" },
    DefaultAzureCredential: { pkg: "@azure/identity" },
    ServiceBusClient: { pkg: "@azure/service-bus" },
    EventHubProducerClient: { pkg: "@azure/event-hubs" },
    TextAnalyticsClient: { pkg: "@azure/ai-text-analytics" }
};

/**
 * Scans a code suggestion for known Azure symbols and injects the corresponding imports
 * at the top of the document if they are not already present.
 */
export async function injectMissingImports(document: vscode.TextDocument, suggestion: string) {
    const fullText = document.getText();
    const usesRequire = fullText.includes("require(");
    const edit = new vscode.WorkspaceEdit();
    let hasEdits = false;
    let importLines = "";

    for (const [symbol, info] of Object.entries(AZURE_IMPORT_MAP)) {
        // If the symbol is in the injected suggestion
        if (suggestion.includes(symbol)) {
            // Check if it's already imported
            const isImported = fullText.includes(`{ ${symbol} }`) ||
                fullText.includes(`{${symbol}}`) ||
                fullText.includes(` ${symbol} `) && fullText.includes(info.pkg);

            if (!isImported) {
                hasEdits = true;
                if (usesRequire) {
                    importLines += `const { ${symbol} } = require('${info.pkg}');\n`;
                } else {
                    importLines += `import { ${symbol} } from "${info.pkg}";\n`;
                }
            }
        }
    }

    if (hasEdits) {
        // Add the new imports at the very beginning of the file
        edit.insert(document.uri, new vscode.Position(0, 0), importLines);
        await vscode.workspace.applyEdit(edit);
        console.log(`[importInjector] Automatically injected imports:\n${importLines.trim()}`);
    }
}
