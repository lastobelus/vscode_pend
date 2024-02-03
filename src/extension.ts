// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as util from 'util';

import { Logger } from './logger';
import symbolKindNames from './symbol-kind-names';
import { SymbolLocation } from './symbol-location';
import * as config from './config';
import { FunctionCallSelector } from './function-call-selector';
import { DocumentSymbols } from './document-symbols';
import { PendSidebarProvider } from './providers/sidebar-provider';
import { NewFunctionCommand } from './commands/new-function-command';
import { PendPanel } from "./panels/pend-panel";
import { GotoPendingFunctionCommand } from './commands/goto-pending-function-command';

const log: Logger = new Logger('Pend', true);

interface IMementoExplorerExtension {
	readonly memento: {
		readonly globalState?: vscode.Memento;
		readonly workspaceState?: vscode.Memento;
	};
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	log.append('extension "pend" is now active!');

	const newFunctionDisposable = vscode.commands.registerCommand('pend.newFunction', async (args: any) => {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const location = config.getNewFunctionDefaultLocation(editor.document);
			const newFunction = new NewFunctionCommand(context, editor, args);
			let result = await newFunction.insertNewFunctionAt(location);
			if (result) {
				PendPanel.postMessage({ cmd: 'newFunction', ...result });
			}
		}
	});

	context.subscriptions.push(newFunctionDisposable);

	const gotoPendingFunctionDisposable = vscode.commands.registerCommand('pend.gotoPendingFunction', async (args: any) => {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const gotoPendingFunction = new GotoPendingFunctionCommand(context);
			await gotoPendingFunction.gotoPendingFunction();
		}
	});

	context.subscriptions.push(gotoPendingFunctionDisposable);

	const inspectDisposable = vscode.commands.registerCommand('pend.inspect', async (args: any) => {
		let editor = vscode.window.activeTextEditor;

		const debugSelection = false;
		const logSymbols = true;
		const logUniqueNames = true;

		log.append("New Ok...");
		if (editor) {
			if (debugSelection) {
				let selector = new FunctionCallSelector(editor);
				log.append(`wordSeparators: ${selector.wordSeparators}`);
				log.append("---------------------------------------------");
				selector.leftChar(editor.selection, true);
				log.append("---------------------------------------------");
				selector.rightChar(editor.selection, true);
				log.append("---------------------------------------------");
				await selector.selectWord(true);
			}

			if (logSymbols) {
				const documentSymbols = new DocumentSymbols(editor.document);
				log.logSymbols(await documentSymbols.getSymbols());
			}
			if (logUniqueNames) {
				const documentSymbols = new DocumentSymbols(editor.document);
				log.append("uniqueNames: ");
				log.append(util.inspect(await documentSymbols.uniqueNames()));
			}
		}
	});

	context.subscriptions.push(inspectDisposable);

	const showPendPanelCommand = vscode.commands.registerCommand("pend.showPendPanel", () => {
		PendPanel.render(context.extensionUri);
	});
	context.subscriptions.push(showPendPanelCommand);

	if (context.extensionMode === vscode.ExtensionMode.Development) {
		return {
			memento: {
				globalState: context.globalState,
				workspaceState: context.workspaceState,
			},
		};
	}
}


// This method is called when your extension is deactivated
export function deactivate() { }