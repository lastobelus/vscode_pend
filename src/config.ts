import * as vscode from 'vscode';
import { SymbolLocation } from './symbol-location';
import symbolKindNames from './symbol-kind-names';
import { Logger } from './logger';

const log: Logger = new Logger('Pend', true);

function workspaceConfig(uri: vscode.Uri, languageId?: string): vscode.WorkspaceConfiguration {
    if (languageId) {
        return vscode.workspace.getConfiguration('pend', { languageId: languageId, uri: uri });
    }else {
        return vscode.workspace.getConfiguration('pend', uri);
    }
}

export function getIndent(document: vscode.TextDocument): string {
    const config = workspaceConfig(document.uri, document.languageId);
    log.append(`getIndent: ${config.get<string>("indent")}`);
    return config.get<string>("indent") || "";
}

export function getNewFunctionDefaultLocation(document: vscode.TextDocument): SymbolLocation {
    const config = workspaceConfig(document.uri, document.languageId);
    const locationStr = config.get<string>('newFunction.defaultLocation');
    return locationStr ? SymbolLocation.parse(locationStr) : SymbolLocation.afterFunction;
}

export function getWordSeparators(document: vscode.TextDocument): string {
    const config = vscode.workspace.getConfiguration('editor', { languageId: document.languageId, uri: document.uri });
    return config.get<string>('wordSeparators') || "";
}

export function getFunctionStartChar(document: vscode.TextDocument): string {
    const config = workspaceConfig(document.uri, document.languageId);
    return config.get<string>('functionStartChar') || "(";
}

export function getSymbolNameRegex(document: vscode.TextDocument): RegExp {
    const config = workspaceConfig(document.uri, document.languageId);
    const nameRegexStr = config.get<string>('symbolNameRegex') || "(.*)";
    return RegExp(nameRegexStr);
}

export function getSymbolKindsCheckedForUniqueness(document: vscode.TextDocument): number[] {
    const config = workspaceConfig(document.uri, document.languageId);
    const kinds = config.get<string[]>('symbolKindsCheckedForUniqueness') || ["function", "class", "method", "module"];
    return kinds.reduce((acc, kind) => {
        const enumValue = symbolKindNames.indexOf(kind);
        if (enumValue === -1) {
            log.append(`pend.getSymbolKindsCheckedForUniqueness: ${kind} is not a valid symbol kind.`);
        } else {
            acc.push(enumValue);
        }
        return acc;
    }, <number[]>[]);
}
