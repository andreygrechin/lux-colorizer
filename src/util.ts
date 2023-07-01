import * as vscode from 'vscode';
import { EXTENSION_ID } from './const';
  


export function getExtensionCommands(): any[] {
	const ext = vscode.extensions.getExtension(EXTENSION_ID);
    if (ext == undefined) {
        return []
    }

	const pkgJSON = ext.packageJSON;
	if (!pkgJSON.contributes || !pkgJSON.contributes.commands) {
		return [] 
	}

	const extensionCommands: any[] = pkgJSON.contributes.commands.filter((x: any) => x.command !== 'go.show.commands');
	return extensionCommands;
}

export function isPositionInString(document: vscode.TextDocument, position: vscode.Position): boolean {
	const lineText = document.lineAt(position.line).text;
	const lineTillCurrentPosition = lineText.substr(0, position.character);

	// Count the number of double quotes in the line till current position. Ignore escaped double quotes
	let doubleQuotesCnt = (lineTillCurrentPosition.match(/\"/g) || []).length;
	const escapedDoubleQuotesCnt = (lineTillCurrentPosition.match(/\\\"/g) || []).length;

	doubleQuotesCnt -= escapedDoubleQuotesCnt;
	return doubleQuotesCnt % 2 === 1;
}