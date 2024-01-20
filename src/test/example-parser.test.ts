import * as testHelper from './test-helper';
import * as assert from 'assert';
import * as util from 'util';

import * as vscode from 'vscode';

import { Logger } from '../logger';
import * as exampleParser from './example-parser';

const log: Logger = new Logger('Pend', true);

suite('Example parser tests', () => {
	test('parses example file correctly', async () => {
        const chai = await import('chai');
        const expect= chai.expect;
        
        const expectedResults = [
            {
                name: 'cursor right of word with empty selection',
                selects: null,
                cursor: new vscode.Position(6, 17)
            },
            {
                name: 'cursor in word with empty selection',
                selects: null,
                cursor: new vscode.Position(11, 11)
            },
            {
                name: 'cursor right of word with word selected',
                selects: 'new_function',
                cursor: new vscode.Position(16, 17)
            },
            {
                name: 'cursor right of word inside a function call',
                selects: null,
                cursor: new vscode.Position(21, 38)
            },
            {
                name: 'Example: signature with word selected with cursor left',
                selects: 'new_function',
                cursor: new vscode.Position(26, 26)
            },
        ];

        await testHelper.whileEditingExample('fixtures/example-parser-test.txt', async editor => {
            const text = editor.document.getText();
            const parsed = exampleParser.parseExamples(text, "#", "  ");
    
            expect(parsed.length).to.equal(5);
    
            parsed.forEach(async (result, index) => {
                expect(result.name).to.equal(expectedResults[index].name);
                if (result.selectionStart) {
                    if(result.selectionEnd){

                        editor.selections = [new vscode.Selection(
                            result.selectionStart,
                            result.selectionEnd,
                             )];

                        const selected = editor.document.getText(editor.selection);

                        // console.log(`selected: ${selected}`);
                        // console.log(`selection: ${log.inspectSelection(editor.selection)}`);
                        
                        expect(selected).to.eql(expectedResults[index].selects);

                    } else {
                        assert.fail(`Example ${index} has a selectionStart but selectionEnd is null`);
                    }
                }
                expect(result.cursor).to.deep.equal(expectedResults[index].cursor);
          });
        });

	});
});
