import * as vscode from 'vscode';
import { EXTENSION_ID, PATH_SEPERATOR } from './const';
  


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

export async function openTextDocument(
    curPath: string,
    filePath: string,
): Promise<[vscode.TextDocument | any, string]> {

    curPath = curPath.substring(0, curPath.lastIndexOf(PATH_SEPERATOR));
    const uri = vscode.Uri.file(curPath + PATH_SEPERATOR + filePath)

    var newDoc: vscode.TextDocument | any = undefined
    var err: string = ""

    await vscode.workspace.openTextDocument(uri)
    .then((includedDoc) => {
        newDoc = includedDoc
    }, (reason) => {
        err = String(reason)
        err = err.includes("cannot open file") ? "[include " + filePath + "] file not found" : err
    })
    if (err != "" || newDoc == undefined) {
        return [undefined, err]
    }

    return [newDoc, ""]
}

export function isSkipLine(line: string) {
    if (line == "") return true
    return !line.startsWith('[')
    // return !(line.match(/^[!#?]/g) == null)
}