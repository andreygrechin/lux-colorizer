
/*---------------------------------------------------------
 * This code based from
 * https://github.com/microsoft/vscode-go/blob/master/src/goDeclaration.ts
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import { getCustomVariable, getVariableInString, isSkipLine, openTextDocument } from './util';
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
            regs.push(getRegexFindVariable(wordType.value))
            regs.push(new RegExp("^\\[macro\\s+[\\w-_\\s]+"
                                 + wordType.value
                                 + "[\\s\\]]"))
            regs.push(new RegExp("^\\[loop\\s+" + wordType.value + "\\s+"))
            break
        case "macro":
            regs.push(new RegExp("^\\[(?:macro)\\s+"
                                 + wordType.value
                                 + "[\\s\\]]"))
            break
        case "file":
            const result = await readFileFromPath(wordType.value, document)

            const newDoc = result[0]
            const err = result[1]
        
            if (err != "" || newDoc == undefined) {
                throw err
            }
            const defInfo: GoDefinitionInformation = {
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

    return find_declaretion(document,
                            document.lineCount - 1,
                            wordType.value,
                            regs)
}

// TODO: check loop file including
// TODO: file in [include xxx] need to check in custom variable
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

        if (/^\[include (.+)\]/g.exec(lineTextTrimed) != null) {
            var result = await readFileFromPath(lineTextTrimed, document)
            var newDoc= result[0]
            var err = result[1]

            if (err == "" && newDoc != undefined) {
                var includeResult = await find_declaretion(newDoc,
                                                           newDoc.lineCount - 1,
                                                           word,
                                                           regs)
                if (includeResult != null) {
                    return includeResult
                }
            } else {
                throw err
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
    const reFilePath = new RegExp("\\[include\\s+")
    if (lineText.match(reFilePath)) {
        wType.type = "file"
        wType.value = lineText
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

async function readFileFromPath(
    line: string,
    document: vscode.TextDocument,
): Promise<[vscode.TextDocument | any, string]> {
    // for now expecting 1 variable in include statement only
    const rVar = getVariableInString(line)
    const varName = rVar[0]
    const varRaw = rVar[1]
    var filePath = getPathFromInclude(line)
    if (filePath == undefined) {
        throw "Invalid file path"
    }

    if (varName != undefined && varRaw != undefined) {
        var cusVar = getCustomVariable(varName)

        if (cusVar == undefined) {
            throw "No custom variable for " + varName

            // TODO: handle no custom variable defined, check in orther included files

            // const ERR_NOT_FOUND = "Variable " + varName + " not found"

            // const declareReuslt =
            //     await find_declaretion(document,
            //                         document.lineCount - 1,
            //                         varName,
            //                         new Array<RegExp>(
            //                             getRegexFindVariable(varName)))
            // console.log("declaretion", declareReuslt);

            // if (declareReuslt == undefined) {
            //     throw ERR_NOT_FOUND
            // }
            // const declareDoc = await openTextDocument(declareReuslt.file, "")
            // const declareTextDoc = declareDoc[0]
            // const errDoc = declareDoc[1]

            // if (errDoc != "" || declareTextDoc == undefined) {
            //     throw errDoc
            // }
            // const declareLineText = declareTextDoc.document
            //                                         .lineAt(declareReuslt.line)
            //                                         .text
            //                                         .strip()
            // const value = getValueFromDeclaretion(declareLineText)
            // if (value == undefined) {
            //     throw ERR_NOT_FOUND
            // }
            // cusVar = value[1]
        }

        filePath = filePath.replace(varRaw, cusVar)
    }

    return await openTextDocument(filePath)
}

function getRegexFindVariable(word: string): RegExp {
    return new RegExp("^\\[(?:global|local|my)\\s+" + word + "\\s*=")
}

function getValueFromDeclaretion(text: string): string | undefined {
    const reGetDeclareValue = /\[\w+\s+[-_\w]+\s*=\s*([^\]]+)\]/g
    const r = reGetDeclareValue.exec(text)
    return (r == null) ? undefined : r[1]
}

function getPathFromInclude(text: string): string | undefined {
    const reGetIncludePath = /\[include\s+([^\]\s]+)\s*\]/g
    const r = reGetIncludePath.exec(text)
    return (r == null) ? undefined : r[1]
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
                const pos = new vscode.Position(definitionInfo.line,
                                                definitionInfo.column);
                return new vscode.Location(definitionResource, pos);
            },
            (err) => {
                vscode.window.showErrorMessage(err);
                return Promise.reject(err);
            }
        );
    }
}