import * as vscode from 'vscode';
import { SymbolLocation } from './symbol-location';
import symbolKindNames from './symbol-kind-names';
import { Logger } from './logger';

const log: Logger = new Logger('Pend', true);

function workspaceConfig(uri: vscode.Uri): vscode.WorkspaceConfiguration {
	return vscode.workspace.getConfiguration('pend', uri);
}

export function getIndent(uri: vscode.Uri): string {
    const config = workspaceConfig(uri);
    log.append(`getIndent: ${config.get<string>("indent")}`);
    return config.get<string>("indent") || "";
}

export function getNewFunctionDefaultLocation(uri: vscode.Uri): SymbolLocation {
    const config = workspaceConfig(uri);
    const locationStr = config.get<string>('newFunction.defaultLocation');
    return locationStr ? SymbolLocation.parse(locationStr) : SymbolLocation.afterFunction;
}

export function getWordSeparators(uri: vscode.Uri): string {
    const config = vscode.workspace.getConfiguration('editor', uri);
    return config.get<string>('wordSeparators') || "";
}

export function getFunctionStartChar(uri: vscode.Uri): string {
    const config = workspaceConfig(uri);
    return config.get<string>('functionStartChar') || "(";
}

export function getSymbolNameRegex(uri: vscode.Uri): RegExp {
    const config = workspaceConfig(uri);
    const nameRegexStr = config.get<string>('symbolNameRegex') || "(.*)";
    return RegExp(nameRegexStr);
}

export function getSymbolKindsCheckedForUniqueness(uri: vscode.Uri): number[] {
    const config = workspaceConfig(uri);
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
