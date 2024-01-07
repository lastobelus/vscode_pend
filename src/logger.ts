import * as vscode from 'vscode';
import * as util from 'util';
import { OutputChannel } from "vscode";

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

    public inspectSymbol(symbol?: vscode.DocumentSymbol) {
        if (!symbol) {
            return `--`;
        }
        return `${symbol.kind}: ${symbol.name} ${this.inspectRange(symbol.range)}`;
    }

    public logSymbol(symbol?: vscode.DocumentSymbol, label: string | null = null) {
        const prefix = label ? `${label}: ` : '';
        this.append(`${prefix}${this.inspectSymbol(symbol)}`);
    }
}
