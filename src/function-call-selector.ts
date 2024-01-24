import * as vscode from 'vscode';
import * as util from 'util';

import * as changeCase from './change-case';
import { Logger } from './logger';
import symbolKindNames from './symbol-kind-names';
import { SymbolLocation } from './symbol-location';
import { workerData } from 'worker_threads';
import * as config from './config';

const log: Logger = new Logger('Pend', true);

class PendingFunction {
    name: string;
    params: string[];
    
    constructor() {
        this.name = "";
        this.params = [];
    }
}

export class FunctionCallSelector {
    editor: vscode.TextEditor;
    wordSeparators: string;
    functionStartChar: string;

    constructor(editor: vscode.TextEditor) {
        this.editor = editor;
        this.wordSeparators = config.getWordSeparators(this.editor.document) + " \n\t";
        this.functionStartChar = config.getFunctionStartChar(this.editor.document);
    }

    async select() {
        let pendingFunction = new PendingFunction();
        const selection = this.editor.selection;
        if (this.editor.selection.isEmpty) {
            if (this.isWordChar(this.leftChar(selection))) {
                this.selectWord();
                pendingFunction.name = this.editor.document.getText(selection);
                if (this.rightChar() === this.functionStartChar) {
                    this.selectSignature();
                    pendingFunction.params = this.parseParams();
                }
            } else if (this.leftChar(selection) === ')') {
                this.cursorLeft();
            //     while leftChar(selection) != '('
            //       smart.select.expand
            //     parse_args(selection)
            //     cursor left
            //     while wordChar(leftChar(selection))
            //       smart.select.expand
            //     => selection is name
            }
        } else {
            // if selection.length > 1
            //   if selection contains "("
            //     error unless selection starts with word
            //     use starting word as name; parse_args(contents of outermost())
            //   else
            //     use selection as name
            //     if next char `('
            //       select_signature
            //     else
            //       empty signature
        }

        // select_signature:
        //   cursor past (, and smart.select.expand
        //   unless next_char == )
        //      smart.select.expand again
        //
        // parse_args(text):
        //   split on commas
        //

    }

    parseParams(): string[] {
        return [];
    }

    leftChar(selection?: vscode.Selection, verbose = false): string {
        selection || (selection = this.editor.selection);
        const document = this.editor.document;
        const range = new vscode.Range(selection.start.translate({ characterDelta: -1 }), selection.start);
        const char = document.getText(range);
        if (verbose) { log.append("leftChar: "); log.logSelection(selection, "  selection:"); log.logRange(range, "  range:"); log.append("  char: " + char); }
        return char;
    }

    rightChar(selection?: vscode.Selection, verbose = false): string {
        selection || (selection = this.editor.selection);
        const document = this.editor.document;
        const range = new vscode.Range(selection.end, selection.end.translate({ characterDelta: 1 }));
        const char = document.getText(range);
        if (verbose) { log.append("rightChar: "); log.logSelection(selection, "  selection:"); log.logRange(range, "  range:"); log.append("  char: " + char); }
        return char;
    }

    isWordChar(char: string): boolean {
        return this.wordSeparators.indexOf(char) < 0;
    }

    async selectWord(verbose:boolean = false) {
        if (verbose) { log.append("selectWord: "); log.logSelection(this.editor.selection, "before selectWord"); }
        let x = 10;
        while ((this.isWordChar(this.leftChar(this.editor.selection)) || this.isWordChar(this.rightChar(this.editor.selection))) && x > 0) {
            x--;
            log.append(`expanding selection. left: ${this.leftChar(this.editor.selection)}, right: ${this.rightChar(this.editor.selection)}`);
            await vscode.commands.executeCommand("editor.action.smartSelect.expand");
            // vscode.commands.executeCommand('editor.action.addSelectionToNextFindMatch');
        }
        if (verbose) { log.logSelection(this.editor.selection, "after selectWord"); }
    }

    async selectSignature(){

    }
    
    async cursorLeft() {
        await vscode.commands.executeCommand("cursorMove", { to: "left", by: "character", select: false });
    }

}
