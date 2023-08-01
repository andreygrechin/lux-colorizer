// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { LUX_MODE } from './const';
import { LuxDefinitionProvider } from './declaretion';

function registerUsualProviders(ctx: vscode.ExtensionContext) {
	ctx.subscriptions.push(vscode.languages.registerDefinitionProvider(LUX_MODE, new LuxDefinitionProvider()));
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(ctx: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "lux-colorizer" is now active!');
	registerUsualProviders(ctx);
}

// This method is called when your extension is deactivated
export function deactivate() {}
