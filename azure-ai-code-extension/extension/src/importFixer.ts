import * as vscode from "vscode";

// Map recognizing common Azure SDK symbols and their respective npm packages.
const AZURE_IMPORT_MAP: Record<string, { pkg: string, isDefault?: boolean }> = {
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

export class AzureImportFixer implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.CodeAction[] {
        const actions: vscode.CodeAction[] = [];

        // Look at the diagnostics (red squiggles) in the current context
        for (const diagnostic of context.diagnostics) {
            // Usually missing imports show up as "Cannot find name 'X'" (ts(2552) or ts(2304))
            const wordRange = document.getWordRangeAtPosition(diagnostic.range.start);
            if (!wordRange) continue;

            const missingSymbol = document.getText(wordRange);

            const importInfo = AZURE_IMPORT_MAP[missingSymbol];
            if (importInfo) {
                // We found a match in our Azure SDK map!
                const action = this.createFix(document, missingSymbol, importInfo.pkg);
                action.diagnostics = [diagnostic];
                action.isPreferred = true;
                actions.push(action);
            }
        }

        return actions;
    }

    private createFix(document: vscode.TextDocument, symbol: string, pkg: string): vscode.CodeAction {
        const fix = new vscode.CodeAction(`Add Azure import: ${symbol} from '${pkg}'`, vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();

        // Check if the current file uses requires or imports
        const usesRequire = document.getText().includes("require(");

        let importStatement = "";
        if (usesRequire) {
            importStatement = `const { ${symbol} } = require('${pkg}');\n`;
        } else {
            importStatement = `import { ${symbol} } from "${pkg}";\n`;
        }

        // Add the import to the top of the file (line 0)
        fix.edit.insert(document.uri, new vscode.Position(0, 0), importStatement);

        return fix;
    }
}
