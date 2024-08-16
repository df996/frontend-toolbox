"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = require("vscode");
const commands_1 = require("./commands");
function activate(context) {
    vscode.commands.registerCommand(commands_1.Commands.onlineDocumentToElTable, commands_1.toolBoxCommands[commands_1.Commands.onlineDocumentToElTable]);
    vscode.commands.registerCommand(commands_1.Commands.onlineDocumentToElForm, commands_1.toolBoxCommands[commands_1.Commands.onlineDocumentToElForm]);
}
//# sourceMappingURL=extension.js.map