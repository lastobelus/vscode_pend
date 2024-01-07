import * as vscode from 'vscode';
import { SymbolLocation } from './symbol-location';
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


