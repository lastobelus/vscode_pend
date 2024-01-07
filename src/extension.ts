// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as util from 'util';

import { Logger } from './logger';
import symbolKindNames from './symbol-kind-names';
import * as pend from './new-function';
import { SymbolLocation } from './symbol-location';
import * as config from './config';

const log: Logger = new Logger('Pend', false);



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	log.append('extension "pend" is now active!');

	let disposable = vscode.commands.registerCommand('pend.newFunction', async (args: any) => {
		let editor = vscode.window.activeTextEditor;
		if (editor) {
			let location = config.getNewFunctionDefaultLocation(editor.document.uri);
			if (args) {
				location = SymbolLocation.parse(args);
			}
			await pend.insertNewFunction(editor, location, args);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }