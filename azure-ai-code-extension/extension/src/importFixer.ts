import * as vscode from "vscode";
import { AZURE_IMPORT_MAP } from "./importInjector";

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

        if (this.hasExistingImport(document, symbol, pkg)) {
            fix.disabled = {
                reason: `Import for ${symbol} from ${pkg} already exists`
            };
            return fix;
        }

        const insertionLine = this.findImportInsertionLine(document);
        fix.edit.insert(document.uri, new vscode.Position(insertionLine, 0), importStatement);

        return fix;
    }

    private hasExistingImport(document: vscode.TextDocument, symbol: string, pkg: string): boolean {
        const text = document.getText();
        const escapedPkg = pkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const hasEsImport = new RegExp(`import\\s*\\{[^}]*\\b${symbol}\\b[^}]*\\}\\s*from\\s*[\"']${escapedPkg}[\"']`, "m").test(text);
        const hasRequireImport = new RegExp(`const\\s*\\{[^}]*\\b${symbol}\\b[^}]*\\}\\s*=\\s*require\\(\\s*[\"']${escapedPkg}[\"']\\s*\\)`, "m").test(text);
        return hasEsImport || hasRequireImport;
    }

    private findImportInsertionLine(document: vscode.TextDocument): number {
        let insertionLine = 0;
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i).text.trim();
            if (
                line.startsWith("import ") ||
                line.startsWith("const ") && line.includes("= require(") ||
                line.length === 0
            ) {
                insertionLine = i + 1;
                continue;
            }
            break;
        }
        return insertionLine;
    }
}
