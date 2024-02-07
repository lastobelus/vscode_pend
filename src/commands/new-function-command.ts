
import * as vscode from 'vscode';

import * as changeCase from '../change-case';
import * as hash from '../utilities/cyrb53';
import { Logger } from '../logger';
import * as util from 'util';

import * as config from '../config';
import { DocumentSymbols } from '../document-symbols';
import { PendingFunctionData, PendingFunctionBookmark } from '../storage/pending-function-data';
import symbolKindNames from '../symbol-kind-names';
import { SymbolLocation } from '../symbol-location';

const log: Logger = new Logger('Pend', true);

interface SymbolInsertionRange {
    symbol: vscode.DocumentSymbol;
    range: vscode.Range;
}

export class NewFunctionCommand {
    context: vscode.ExtensionContext;
    editor: vscode.TextEditor;
    document: vscode.TextDocument;
    args: any;
    storage: PendingFunctionData;
    symbols: DocumentSymbols;

    constructor(context: vscode.ExtensionContext, editor: vscode.TextEditor, args: any = undefined) {
        this.editor = editor;
        this.document = editor.document;
        this.context = context;
        this.args = args;
        this.storage = new PendingFunctionData(context);
        this.symbols = new DocumentSymbols(this.document);
    }

    async insertNewFunctionAt(location: SymbolLocation, args: any = undefined) {
        log.append(`args: ${util.inspect(args)}`);
        if (!this.document) {
            return;
        }
        const name = this.nameForSelection();
        const context = this.document.lineAt(this.editor.selection.active.line);
        const myModule = await this.symbols.symbolContainingRange(
            this.editor.selection, vscode.SymbolKind.Module
        );
        const topModule = myModule ? await this.symbols.symbolContainingRange(
            myModule.range, vscode.SymbolKind.Module
        ) : undefined;
        const myFunction = await this.symbols.symbolContainingRange(
            this.editor.selection, vscode.SymbolKind.Function
        );
        const containerSymbol = (myFunction || myModule) ? myModule : topModule;
        if (!containerSymbol) {
            log.append('No symbol found');
            return;
        }


        const insertionLocation = await this.containerSymbol();


        if (insertionLocation) {
            this.handleInsertion(name, location, insertionLocation);
            this.handleStoreBookmark(
                name,
                insertionLocation,
                context.text,
                context.range
                );
        }

        return {name: name};
    }

    private async containerSymbol(): Promise<SymbolInsertionRange | undefined> {
        const documentSymbols = new DocumentSymbols(this.document);
        const symbols: vscode.DocumentSymbol[] = await documentSymbols.getSymbols();
        const myModule = await documentSymbols.symbolContainingRange(
            this.editor.selection, vscode.SymbolKind.Module
        );
        const topModule = myModule ? await documentSymbols.symbolContainingRange(
            myModule.range, vscode.SymbolKind.Module
        ) : undefined;
        const myFunction = await documentSymbols.symbolContainingRange(
            this.editor.selection, vscode.SymbolKind.Function
        );
        const containerSymbol = (myFunction || myModule) ? myModule : topModule;
        if (!containerSymbol) {
            // TODO: friendly error handling
            log.append('No symbol found');
            return;
        } else {
            const currentLine = this.document.lineAt(this.editor.selection.active.line);
            const range = myFunction?.range ||
                (topModule ? currentLine.range : myModule?.range) ||
                currentLine.range;

            return { symbol: containerSymbol, range };
        }
    }

    private nameForSelection(): string {
        let name = "<unknown>";
        const selection = this.editor.selection;
        if (selection.isEmpty) {
            let wordRange = this.editor.document.getWordRangeAtPosition(selection.active);
            name = this.editor.document.getText(wordRange);
        } else {
            name = this.editor.document.getText(selection);
        }
        name = changeCase.snakeCase(name.trim());
        return name;
    }

    private async getSymbols(): Promise<vscode.DocumentSymbol[]> {
        const documentSymbols = new DocumentSymbols(this.document);
        const symbols: vscode.DocumentSymbol[] = await documentSymbols.getSymbols();
        return symbols;
    }

    private blankFunctionWithName(sel: string): string[] {
        return [
            `def ${sel}() do`,
            "  # TODO",
            "end"
        ];
    }

    private async handleInsertion(name: string, location: SymbolLocation, { symbol, range }: SymbolInsertionRange) {
        const code = this.blankFunctionWithName(name);
        await this.symbols.indentAndInsertLinesInSymbol(
            symbol, 
            range,
            location,
            code
        );
    }

    private async handleStoreBookmark(
        name: string, 
        { symbol, range }: SymbolInsertionRange,
        context: string,
        contextRange: vscode.Range) {
        this.storage.addPendingFunction(
            new PendingFunctionBookmark(
                name,
                this.document.uri,
                range,
                context,
                this.document.uri,
                contextRange,
            )
        );
    }
}

