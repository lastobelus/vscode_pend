import * as util from 'util';
import * as vscode from 'vscode';

export type Example = {
    name: string;
    cursor: vscode.Position | null;
    selectionStart: vscode.Position | null;
    selectionEnd: vscode.Position | null;
    expected: string;
};


export function parseExamples(code: string, commentChar: string, indentChar: string): Example[] {
    const examples: Example[] = [];
    const lines = code.split('\n');
    const startRegex = new RegExp(`^(?:${indentChar})*(?:${commentChar}\\s*)+Example:\\s*(.*)$`);
    // const commentRegex = new RegExp(`^(?:${indentChar})*(?:${commentChar}\\s*)+(?<content>.*)$`, 'dg');
    const commentRegex = new RegExp(`^(?:${indentChar})*(?:${commentChar}\\s*)*(?<content>.*)$`, 'dg');



    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const exampleMatch = startRegex.exec(line);
        if (exampleMatch) {
            // Found start of example
            const name = exampleMatch[1];

            const codeLineMatch = commentRegex.exec(lines[i + 1]);
            const codeLineNum = i + 2;            
            const codeContent = codeLineMatch?.indices?.groups?.content;
            const codeLineStart = codeContent ? codeContent[0] + 1 : 1;

            // Get cursor line
            const cursorLine = lines[i + 2];

            // Parse cursor line to get cursor and selection
            const cursorPos = getCursorPos(cursorLine, codeLineNum);

            // Get expected output
            const expectedMatch = lines[i + 3].match(commentRegex);
            const expected = expectedMatch ? expectedMatch[1] : '';

            const selectionEnd = getSelectionEnd(cursorLine, codeLineNum);
            const selectionStart = selectionEnd ? getSelectionStart(cursorLine, codeLineNum, codeLineStart) : null;
            // Add example
            examples.push({
                name,
                cursor: cursorPos,
                selectionStart: selectionStart,
                selectionEnd: selectionEnd,
                expected
            });

            // Skip over example
            i += 3;
        }
    }

    return examples;
}

function getCursorPos(cursorLine: string, codeLineNum: number) {
    const caretPos = cursorLine.indexOf('^');
    const barPos = cursorLine.indexOf('|');

    if (barPos !== -1) {
        return new vscode.Position(codeLineNum, barPos + 1);
    }

    if (caretPos !== -1) {
        return new vscode.Position(codeLineNum, caretPos + 1);
    }

    // No caret or bar, return first character
    return new vscode.Position(codeLineNum, 0);
}

function getSelectionStart(cursorLine: string, codeLineNum: number, codeLineStart: number) {
    const barPos = cursorLine.indexOf('|');
    if (barPos !== -1) {
        return new vscode.Position(codeLineNum, barPos + 1);
    }

    const startPos = cursorLine.indexOf('[');
    if (startPos === -1) {
        return new vscode.Position(codeLineNum, codeLineStart);
    }

    return new vscode.Position(codeLineNum, startPos + 1);
}

function getSelectionEnd(cursorLine: string, codeLineNum: number) {
    const endPos = cursorLine.indexOf(']');
    if (endPos === -1) {
        return null;
    }

    return new vscode.Position(codeLineNum, endPos + 1);
}
