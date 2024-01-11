import { log } from 'console';
import * as path from 'path';
import * as vscode from 'vscode';

const DOC_WAIT = 100;
const UI_WAIT = 100;

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function edit(name: string): Promise<vscode.TextEditor> {
    const uri = vscode.Uri.file(
        path.join(__dirname + "/../../src/test/" + name)
    );
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    return editor;
}

export async function whileEditingExample(
    name: string,
    test: (vscode: vscode.TextEditor) => Promise<any>
): Promise<void> {
    const editor = await edit(name);
    await test(editor);
}

export async function waitForResult(test: () => Promise<boolean>): Promise<void> {
    let result: boolean = false;
    let elapsed: number = 0;

    while (!result) {
        try {
            result = await test();
            if (result) {
                break;
            }
        } catch (err) {
            console.log(`waitForApi: ${err}`);
        }
        elapsed += UI_WAIT;
        await sleep(UI_WAIT);
    }
    console.log(`waitForResult: ${elapsed}ms elapsed`);
}

export async function waitForCommandToHaveResult(command: string, args: [any], invalid: any = undefined): Promise<void> {
    await waitForResult(async () => {
        return await vscode.commands.executeCommand(
            "vscode.executeDocumentSymbolProvider",
            ...args
        ) !== invalid;
    });
}