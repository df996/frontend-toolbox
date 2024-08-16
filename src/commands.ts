import { getOnlineDocumentParser } from './onlineDocumentParser';
import { Position, window } from 'vscode';

/**
 * 命令集合枚举
 */
export enum Commands {
  /**
   * 在线文档转element table
   */
  onlineDocumentToElTable = 'online.document.to.el.table',
  /**
   * 在线文档转element form
   */
  onlineDocumentToElForm = 'online.document.to.el.form'
}

export const toolBoxCommands = {
  //#region 在线文档转element table
  [Commands.onlineDocumentToElTable]: async () => {
    const url = await window.showInputBox({ prompt: '请输入在线文档地址' });
    if (!url) {
      return;
    }

    const parser = getOnlineDocumentParser(url);
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
    window.activeTextEditor?.edit(ctx => {
      const position = window.activeTextEditor?.selection.active || new Position(0, 0);
      ctx.insert(position, code);
    });
  },
  //#endregion

  //#region 在线文档转element form
  [Commands.onlineDocumentToElForm]: async () => {
    const url = await window.showInputBox({ prompt: '请输入在线文档地址' });
    if (!url) {
      return;
    }

    const parser = getOnlineDocumentParser(url);
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
    window.activeTextEditor?.edit(ctx => {
      const position = window.activeTextEditor?.selection.active || new Position(0, 0);
      ctx.insert(position, code);
    });
  }
  //#endregion
};
