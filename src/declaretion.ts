
/*---------------------------------------------------------
 * This code based from
 * https://github.com/microsoft/vscode-go/blob/master/src/goDeclaration.ts
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import { isPositionInString, isSkipLine, openTextDocument } from './util';
import { COMMENT, PATH_SEPERATOR } from './const';

export interface GoDefinitionInformation {
    file: string;
    line: number;
    column: number;
    declarationlines: string[];
    name: string;
}

interface WordType {
    type: "variable" | "macro" | "file" | undefined
    value: string
}

async function definitionLocation(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
): Promise<GoDefinitionInformation | null> {
    const wordType = getWordFromPosition(document, position);
    if (wordType == undefined) {
        return Promise.resolve(null)
    }

    // multiple regex to find different case
    var regs = new Array<RegExp>()

    switch (wordType.type) {
        case "variable":
            regs.push(new RegExp("^\\[(?:global|local|my)\\s+" + wordType.value + "\\s*="))
            regs.push(new RegExp("^\\[macro\\s+[\\w-_\\s]+" + wordType.value + "[\\s\\]]"))
            regs.push(new RegExp("^\\[loop\\s+" + wordType.value + "\\s+"))
            break
        case "macro":
            regs.push(new RegExp("^\\[(?:macro)\\s+" + wordType.value + "[\\s\\]]"))
            break
        case "file":
            var result = await openTextDocument(document.uri.path, wordType.value)
            var newDoc = result[0]
            var err = result[1]
            
            if (err != "" || newDoc == undefined) {
                throw err
            }
            var defInfo: GoDefinitionInformation = {
                column: 0,
                line: 0,
                file: newDoc.uri.path,
                name: "",
                declarationlines: [],
            }
            return defInfo
            

        default:
            return Promise.resolve(null)
    }

    return find_declaretion(document, document.lineCount - 1, wordType.value, regs)
}

async function find_declaretion(
    document: vscode.TextDocument,
    line: number,
    word: string,
    regs: RegExp[],
): Promise<GoDefinitionInformation | null> {
    var defInfo: GoDefinitionInformation = {
        column: -1,
        line: -1,
        file: "",
        name: "",
        declarationlines: [],
    }

    // file line start from 0
    for (let i = line; i > -1; i--) {
        const lineText = document.lineAt(i).text
        const lineTextTrimed = lineText.trim()

        if (isSkipLine(lineTextTrimed)) {
            continue
        }
        
        const included = /^\[include (.+)\]/g.exec(lineTextTrimed)
        if (included != null) {
            var result = await openTextDocument(document.uri.path, included[1])
            var newDoc= result[0]
            var err = result[1]

            if (err != "" || newDoc == undefined) {
                throw err
            }
            
            var includeResult = await find_declaretion(newDoc, newDoc.lineCount - 1, word, regs)
            if (includeResult != null) {
                return includeResult
            }
        }

        for (let regIdx = 0; regIdx < regs.length; regIdx++) {
            if (lineTextTrimed.match(regs[regIdx])) {
                defInfo.line = i
                defInfo.column = lineText.indexOf(word)
                defInfo.file = document.fileName
                return defInfo
            }
        }

    }

    return Promise.resolve(null)
}

function getWordFromPosition(
    document: vscode.TextDocument,
    position: vscode.Position
): WordType | undefined {
    const wordRange = document.getWordRangeAtPosition(position, /[-_\.\/\w]+/g)
    const lineText = document.lineAt(position.line).text.trim()
    const word = wordRange ? document.getText(wordRange) : ''
    if (
        !wordRange ||
        lineText.startsWith(COMMENT) ||
        // isPositionInString(document, position) ||
        word.match(/^\d+.?\d+$/)
    ) {
        return undefined
    }

    var wType: WordType = {type: undefined, value: word}
    
    // check is file path
    const reFilePath = new RegExp("\\[include\\s+" + word + "\\s*\\]")
    if (lineText.match(reFilePath)) {
        wType.type = "file"
        return wType
    }

    // check is variable
    if (lineText.includes('$' + word)) {
        wType.type = "variable"
        return wType
    }
    if (lineText.includes('${' + word + '}')) {
        wType.type = "variable"
        return wType
    }

    // check macro
    const reMacro = new RegExp("\\[invoke\\s+" + word) 

    if (lineText.match(reMacro)) {
        wType.type = "macro"
        return wType
    }

    return undefined
}



export class LuxDefinitionProvider implements vscode.DefinitionProvider {
    public provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Thenable<vscode.Location> {
        return definitionLocation(document, position, token).then(
            (definitionInfo) => {
                if (definitionInfo == null || definitionInfo.file == null) {
                    return Promise.reject("invalid");
                }
                const definitionResource = vscode.Uri.file(definitionInfo.file);
                const pos = new vscode.Position(definitionInfo.line, definitionInfo.column);
                return new vscode.Location(definitionResource, pos);
            },
            (err) => {
                vscode.window.showErrorMessage(err);
                return Promise.reject(err);
            }
        );
    }
}