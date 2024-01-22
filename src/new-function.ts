import * as vscode from 'vscode';

import * as changeCase from './change-case';
import { Logger } from './logger';
import symbolKindNames from './symbol-kind-names';
import { SymbolLocation } from './symbol-location';
import * as util from 'util';
import { DocumentSymbols } from './document-symbols';
import * as config from './config';

const log: Logger = new Logger('Pend', true);


function blankFunctionFromSelection(sel: string): string[] {
	return [
		`def ${sel}() do`,
		"  # TODO",
		"end"
	];
}


export async function insertNewFunction(editor: vscode.TextEditor, location: SymbolLocation, args: any) {
    log.append(`args: ${util.inspect(args)}`);
	const document = editor.document;
	if (!document) {
		return;
	}
	const documentSymbols = new DocumentSymbols(document);
	const symbols: vscode.DocumentSymbol[] = await documentSymbols.getSymbols();

	let sel = "<unknown>";
    let selection = editor.selection;
    if (selection.isEmpty) {
        let wordRange = editor.document.getWordRangeAtPosition(selection.active);
        sel = editor.document.getText(wordRange);
    } else {
        sel = editor.document.getText(selection);
    }
    sel = changeCase.snakeCase(sel.trim());
    log.append(`sel: ${sel}`);
    const currentLine = document.lineAt(selection.active.line);
    // log.append('symbols:');
    // log.append(inspectSymbols(symbols, 0));
    const myModule = await documentSymbols.symbolContainingRange(editor.selection, vscode.SymbolKind.Module);
    const topModule = myModule ? await documentSymbols.symbolContainingRange(myModule.range, vscode.SymbolKind.Module) : undefined;
    const myFunction = await documentSymbols.symbolContainingRange(editor.selection, vscode.SymbolKind.Function);
	const containerSymbol = (myFunction || myModule) ? myModule : topModule;
    if (!containerSymbol) {
        log.append('No symbol found');
        return;
    }

    const positionRange = myFunction?.range || (topModule ? currentLine.range : myModule?.range) || currentLine.range;


    log.logSymbol(topModule, 'topModule');
    log.logSymbol(myModule, 'myModule');
    log.logSymbol(myFunction, 'myFunction');
    log.logSymbol(containerSymbol, 'containerSymbol');
    log.logRange(positionRange, 'positionRange');

    const code = blankFunctionFromSelection(sel);
    await documentSymbols.indentAndInsertLinesInSymbol(containerSymbol, positionRange, location, blankFunctionFromSelection(sel + "_" + SymbolLocation.label(location)));
}