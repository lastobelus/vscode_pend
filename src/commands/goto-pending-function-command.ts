import * as vscode from 'vscode';
import { PendingFunctionData, PendingFunctionBookmark } from '../storage/pending-function-data';

class BookmarkItem implements vscode.QuickPickItem {
    label: string;
    description: string;
    pendingFunction: PendingFunctionBookmark;

    constructor(pendingFunction: PendingFunctionBookmark) {
        this.label = pendingFunction.name;
        this.description = pendingFunction.context;
        this.pendingFunction = pendingFunction;
    }
}

export class GotoPendingFunctionCommand { 
    context: vscode.ExtensionContext;
    storage: PendingFunctionData; 

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.storage = new PendingFunctionData(context);
    }

    async pickPendingFunction() {
        const pendingFunctions = await this.storage.getPendingFunctions();
        const items = pendingFunctions.map((pendingFunction) => {
            return {
                label: pendingFunction.name,
                // description: pendingFunction.context,
                pendingFunction: pendingFunction
            };
        });
        return vscode.window.showQuickPick(items, {
            onDidSelectItem: (item: BookmarkItem) => {
                vscode.window.showInformationMessage(`Goto ${item.label}`);
            }
        });
    }

    async gotoPendingFunction() {
        const item = await this.pickPendingFunction();
        if (item) {
            const pendingFunction = item.pendingFunction;
            const location = pendingFunction.location;
            await vscode.commands.executeCommand('vscode.open', location.uri, {
                selection: location.range
            });
        }
    }

}