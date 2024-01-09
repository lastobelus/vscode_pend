import * as vscode from 'vscode';
import * as util from 'util';

import * as changeCase from './change-case';
import { Logger } from './logger';
import symbolKindNames from './symbol-kind-names';
import { SymbolLocation } from './symbol-location';
import * as config from './config';

const log: Logger = new Logger('Pend', true);

export class DocumentSymbols {
    document: vscode.TextDocument;
    symbolsCache: vscode.DocumentSymbol[] | null;
    uniqueNamesCache: string[] | null;

    constructor(document: vscode.TextDocument) {
        this.document = document;
        this.symbolsCache = null;
        this.uniqueNamesCache = null;
    }

    public async getSymbols(): Promise<vscode.DocumentSymbol[]> {
        if (this.symbolsCache) {
            return this.symbolsCache;
        }

        const symbols = await vscode.commands.executeCommand(
            "vscode.executeDocumentSymbolProvider",
            this.document.uri
        ) as vscode.DocumentSymbol[];

        this.symbolsCache = symbols;
        return symbols;
    }

    public async uniqueNames(symbols?:vscode.DocumentSymbol[], cache?: string[]): Promise<string[]> {
        if (!this.uniqueNamesCache) {
            this.uniqueNamesCache = this.cacheUniqueNames(await this.getSymbols(), []);
        }
        return this.uniqueNamesCache;
    }

    private cacheUniqueNames(symbols: vscode.DocumentSymbol[], names: string[] = []): string[] {
        for (const symbol of symbols) {
            const name = this.validSymbolForUniqueCheck(symbol);

            if (name) {
                names.push(name);
            }
            if (symbol.children) {
                this.cacheUniqueNames(symbol.children, names);
            }
        }
        return names;
    }

    private validSymbolForUniqueCheck(symbol: vscode.DocumentSymbol): string | null {
        const kinds = config.getSymbolKindsCheckedForUniqueness(this.document.uri);
        if (kinds.indexOf(symbol.kind) === -1) {
            return null;
        }
        const nameRegex = config.getSymbolNameRegex(this.document.uri);
        const matches = symbol.name.match(nameRegex);
        if (matches && matches.length > 0) {
            return matches[1];
        } else {
            return null;
        }
    }

    public async symbolContainingRange(range: vscode.Range, kind?: vscode.SymbolKind): Promise<vscode.DocumentSymbol | undefined> {
        const symbols = await this.getSymbols();
        return this._symbolContainingRange(symbols, range, kind);
    }

    private _symbolContainingRange(symbols: vscode.DocumentSymbol[], range: vscode.Range, kind?: vscode.SymbolKind): vscode.DocumentSymbol | undefined {
        for (const symbol of symbols) {
            if (symbol.range.contains(range)) {
                if (symbol.children) {
                    const child = this._symbolContainingRange(symbol.children, range, kind);
                    if (child) {
                        return child;
                    }
                }
                if (kind === undefined || symbol.kind === kind) {
                    return symbol;
                }
            }
            if (symbol.children) {
                const child = this._symbolContainingRange(symbol.children, range, kind);
                if (child) {
                    return child;
                }
            }
        }
        return undefined;
    }

    private firstFunctionInSymbol(symbol: vscode.DocumentSymbol): vscode.DocumentSymbol | undefined {
        if (symbol.children) {
            return symbol.children.find((child) => {
                return child.kind === vscode.SymbolKind.Function;
            });
        }
        return undefined;
    }

    private lastFunctionInSymbol(symbol: vscode.DocumentSymbol): vscode.DocumentSymbol | undefined {
        if (symbol.children) {
            return symbol.children.findLast((child) => {
                return child.kind === vscode.SymbolKind.Function;
            });
        }
        return undefined;
    }

    public async inspectSymbols() {
        const symbols = await this.getSymbols();
        return this._inspectSymbols(symbols, 0);
    }

    private async _inspectSymbols(symbols: vscode.DocumentSymbol[], depth: number): Promise<string> {
        let result = '';
        for (const symbol of symbols) {
            const indent = new Array(depth + 1).join('  ');
            result += `${indent}${symbol.name} (${symbolKindNames[symbol.kind]})\n`;
            if (symbol.detail) {
                result += `${indent}  ${symbol.detail}`;
            }
            result += `${indent}  range: ${util.inspect(symbol.range)}\n`;
            result += `${indent}  selection range: ${util.inspect(symbol.selectionRange)}\n`;
            result += '--------------------\n';
            if (symbol.children) {
                result += this._inspectSymbols(symbol.children, depth + 1);
            }
        }
        return result;
    }

    public indentAndInsertLinesInSymbol(symbol: vscode.DocumentSymbol, positionRange: vscode.Range, location: SymbolLocation, codeLines: string[]): Thenable<boolean> {
        const edit = new vscode.WorkspaceEdit();
        const uri = this.document.uri;

        const { position, code } = this.prepareCodeForInsertionAtSymbolLocation(symbol, positionRange, location, codeLines);
        log.append(`inserting at position: ${util.inspect(position)}`);
        edit.insert(uri, position, code);
        return vscode.workspace.applyEdit(edit);
    }

    public firstLineInRange(range: vscode.Range): string {
        return this.document.lineAt(range.start.line).text;
    }

    public indentOfSymbol(symbol: vscode.DocumentSymbol): string {
        const firstLine = this.firstLineInRange(symbol.range);
        return firstLine.match(/^(\s*)/)?.[0] ?? '';
    }

    public indentSized(size: number): string {
        return new Array(size).fill(' ').join('');
    }

    public prepareCodeForInsertionAtSymbolLocation(symbol: vscode.DocumentSymbol, positionRange: vscode.Range, location: SymbolLocation, lines: string[]): { position: vscode.Position, code: string } {
        const indent = this.indentOfSymbol(symbol) + config.getIndent(this.document.uri);
        let position: vscode.Position;
        let prefix = '';
        let suffix = '';
        switch (location) {
            case SymbolLocation.beforeFunction:
                position = new vscode.Position(positionRange.start.line, 0);
                suffix = '\n\n';
                break;

            case SymbolLocation.beginningOfModule:
                const firstFunction = this.firstFunctionInSymbol(symbol);
                log.logSymbol(firstFunction, 'first function');
                if (firstFunction) {
                    position = new vscode.Position(firstFunction.range.start.line, 0);
                } else {
                    position = new vscode.Position(positionRange.start.line, 0);
                }
                suffix = '\n\n';
                break;

            case SymbolLocation.endOfModule:
                const lastFunction = this.lastFunctionInSymbol(symbol);
                log.logSymbol(lastFunction, 'last function');
                if (lastFunction) {
                    position = new vscode.Position(lastFunction.range.end.line + 1, 0);
                } else {
                    position = new vscode.Position(positionRange.start.line + 1, 0);
                }
                prefix = '\n';
                suffix = '\n';
                break;

            case SymbolLocation.afterFunction:
                position = new vscode.Position(positionRange.end.line + 1, 0);
                prefix = '\n';
                suffix = '\n';
                break;
        }

        return {
            position: position,
            code: prefix + lines.map(line => indent + line).join('\n') + suffix
        };
    }

    public async nameExists(name:string): Promise<boolean> {
        const uniqueNames = await this.uniqueNames();
        return uniqueNames.some(uniqueName => uniqueName === name);
    }

}


