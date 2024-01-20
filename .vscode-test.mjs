import { defineConfig } from '@vscode/test-cli';

export default defineConfig([
	{
		label: "infraTests",
		files: 'out/test/example-parser.test.js',
		mocha: {
			timeout: 60000,
		},
	},
	{
		label: "unitTests",
		files: 'out/test/*.test.js',
		mocha: {
			timeout: 60000,
		},
	},
	{
		label: "elixirTests",
		files: 'out/test/elixir/**/*.test.js',
		workspaceFolder: './src/test/sampleElixirWorkspace',
		mocha: {
			timeout: 60000,
		},
	},
	{
		label: "typescriptTests",
		files: 'out/test/typescript/**/*.test.js',
		workspaceFolder: './sampleTypescriptWorkspace',
		mocha: {
			timeout: 60000,
		},
	},

]);
