import * as vscode from 'vscode';
import { Commands, toolBoxCommands } from './commands'

export function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand(Commands.onlineDocumentToElTable, toolBoxCommands[Commands.onlineDocumentToElTable])
	vscode.commands.registerCommand(Commands.onlineDocumentToElForm, toolBoxCommands[Commands.onlineDocumentToElForm])
}