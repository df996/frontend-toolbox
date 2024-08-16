"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolBoxCommands = exports.Commands = void 0;
const onlineDocumentParser_1 = require("./onlineDocumentParser");
const vscode_1 = require("vscode");
/**
 * 命令集合枚举
 */
var Commands;
(function (Commands) {
    /**
     * 在线文档转element table
     */
    Commands["onlineDocumentToElTable"] = "online.document.to.el.table";
    /**
     * 在线文档转element form
     */
    Commands["onlineDocumentToElForm"] = "online.document.to.el.form";
})(Commands || (exports.Commands = Commands = {}));
exports.toolBoxCommands = {
    //#region 在线文档转element table
    [Commands.onlineDocumentToElTable]: async () => {
        const url = await vscode_1.window.showInputBox({ prompt: '请输入在线文档地址' });
        if (!url) {
            return;
        }
        const parser = (0, onlineDocumentParser_1.getOnlineDocumentParser)(url);
        if (!parser) {
            return;
        }
        const models = await parser.getResponseModels();
        if (!models) {
            return;
        }
        let code = '<el-table>\n';
        models.forEach(model => {
            code += `  <el-table-column label="${model.label}" prop="${model.prop}"></el-table-column>\n`;
        });
        code += '</el-table>\n';
        vscode_1.window.activeTextEditor?.edit(ctx => {
            const position = vscode_1.window.activeTextEditor?.selection.active || new vscode_1.Position(0, 0);
            ctx.insert(position, code);
        });
    },
    //#endregion
    //#region 在线文档转element form
    [Commands.onlineDocumentToElForm]: async () => {
        const url = await vscode_1.window.showInputBox({ prompt: '请输入在线文档地址' });
        if (!url) {
            return;
        }
        const parser = (0, onlineDocumentParser_1.getOnlineDocumentParser)(url);
        if (!parser) {
            return;
        }
        const models = await parser.getRequestModels();
        if (!models) {
            return;
        }
        let code = '<el-form>\n';
        models.forEach(model => {
            code += `  <el-form-item label="${model.label}" prop="${model.prop}"></el-form-item>\n`;
        });
        code += '</el-form>\n';
        vscode_1.window.activeTextEditor?.edit(ctx => {
            const position = vscode_1.window.activeTextEditor?.selection.active || new vscode_1.Position(0, 0);
            ctx.insert(position, code);
        });
    }
    //#endregion
};
//# sourceMappingURL=commands.js.map