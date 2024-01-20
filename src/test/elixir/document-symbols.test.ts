import * as testHelper from '../test-helper';
import * as assert from 'assert';
import * as util from 'util';

import * as vscode from 'vscode';
import { DocumentSymbols } from '../../document-symbols';

const elixirLSExtensionId = 'jakebecker.elixir-ls';

suite('Elixir Document Symbol Tests', async () => {
    setup(async () => {
        console.log("Test Setup");

        if (!vscode.extensions.getExtension(elixirLSExtensionId)) {
            await testHelper.sleep(1000);

            await vscode.commands.executeCommand("workbench.extensions.installExtension", elixirLSExtensionId);
            while (!(vscode.extensions.getExtension(elixirLSExtensionId))) {
                console.log("Waiting for Elixir LS to be installed");
                await testHelper.sleep(30);
            }
        }
        const elixirLS = vscode.extensions.getExtension(elixirLSExtensionId);
        await elixirLS?.activate();
    });

    teardown(() => {
    });

    test('Finds unique function and module names', async () => {
        const chai = await import('chai');
        const expect= chai.expect;

        await testHelper.whileEditingExample('sampleElixirWorkspace/lib/top_module.ex', async editor => {
            console.log(`uri: ${editor.document.uri}`);
            await testHelper.waitForCommandToHaveResult(
                "vscode.executeDocumentSymbolProvider", [editor.document.uri], undefined);

            const documentSymbols = new DocumentSymbols(editor.document);
            const names = await documentSymbols.uniqueNames();
            console.log(`names: ${util.inspect(names)}`);
            expect(names).to.eql(new Set([
                'TopModule', 'InnerModule',
                'first_top_function', 'last_top_function',
                'first_inner_function', 'second_inner_function', 'last_inner_function'
            ]));
        });
    });
});
