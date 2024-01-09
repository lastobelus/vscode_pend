import * as vscode from 'vscode';
import * as util from 'util';
import { OutputChannel } from "vscode";
import symbolKindNames from './symbol-kind-names';

export class Logger {
    private outputChannel?: OutputChannel;

    constructor(extensionOuputName: string, private useConsole = true) {
        if (!useConsole) {
            this.outputChannel = vscode.window.createOutputChannel(extensionOuputName);
            this.outputChannel.show();
        }
    }

    public append(o: any) {
        const prefix = `[${new Date().toLocaleString()}]`;

        if (o.constructor === Array) {
            o.forEach(item => this.append(item));
        }
        else {
            if (this.useConsole) {
                console.log(prefix, o);
            }
            else if (this.outputChannel) {
                this.outputChannel.append(prefix + ' ');
                const isObject = (typeof o === 'object' && o !== null);
                this.outputChannel.appendLine(isObject ? util.inspect(o) : o);
            }
        }
    }

    public inspectRange(range?: vscode.Range) {
        if (!range) {
            return `--`;
        }
        return `(${range.start.line}:${range.start.character}-->${range.end.line}:${range.end.character})`;
    }

    public logRange(range?: vscode.Range, label: string | null = null) {
        const prefix = label ? `${label}: ` : '';
        this.append(prefix + this.inspectRange(range));
    }
    
    public inspectPosition(position?: vscode.Position) {
        if (!position) {
            return `--`;
        }
        return `(${position.line}:${position.character})`;
    }

    public logPosition(range?: vscode.Position, label: string | null = null) {
        const prefix = label ? `${label}: ` : '';
        this.append(prefix + this.inspectPosition(range));
    }

    public inspectSymbol(symbol?: vscode.DocumentSymbol) {
        if (!symbol) {
            return `--`;
        }
        const kind = symbolKindNames[symbol.kind] || "<unknown>";
        return `${kind.padStart(22, " ")}: ${symbol.name} r:${this.inspectRange(symbol.range)}`;
    }

    public logSymbol(symbol?: vscode.DocumentSymbol, label: string | null = null) {
        const prefix = label ? `${label}: ` : '';
        this.append(`${prefix}${this.inspectSymbol(symbol)}`);
    }

    public logSymbols(symbols: vscode.DocumentSymbol[], label: string | null = null) {
        const prefix = label ? `${label}: ` : '';
        symbols.forEach(symbol => {
            this.logSymbol(symbol);
            this.logSymbols(symbol.children);
        });
    }
    
    public inspectSelection(document: vscode.TextDocument, selection?: vscode.Selection) {
        if (!selection) {
            return `--`;
        }
        return `(${selection.start.line}:${selection.start.character}-->${selection.end.line}:${selection.end.character}) active: ${this.inspectPosition(selection.active)} anchor: ${ this.inspectPosition(selection.anchor) }`;
    }

    public logSelection(document: vscode.TextDocument, selection?: vscode.Selection, label: string | null = null) {
        const prefix = label ? `${label}: ` : '';
        this.append(`${prefix}${this.inspectSelection(document, selection)}`);
    }   
}
