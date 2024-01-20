import * as assert from 'assert';

import * as vscode from 'vscode';
import * as testHelper from './test-helper';

import * as config from '../config';

suite('Config tests', () => {
	test('language overridable config', async () => {
        const chai = await import('chai');
        const expect= chai.expect;


        const typescript_editor = await testHelper.edit('sampleTypescriptWorkspace/example.js');
        const elixir_editor = await testHelper.edit('sampleElixirWorkspace/lib/top_module.ex');

        expect(
            config.getSymbolNameRegex(typescript_editor.document)
        ).to.eql(
            / *([^( ]+)/
        );

        expect(
            config.getSymbolNameRegex(elixir_editor.document)
        ).to.eql(
            /(?:def|defp|defmacro)? *([^( ]+)/
        );
	});
});
