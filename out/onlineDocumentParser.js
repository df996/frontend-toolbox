"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApifoxParser = exports.Apipostv8Parser = exports.Apipostv7Parser = exports.SwaggerParser = void 0;
exports.getOnlineDocumentParser = getOnlineDocumentParser;
const axios_1 = require("axios");
const qs = require("qs");
const vscode_1 = require("vscode");
/**
 * swagger 解析器
 */
class SwaggerParser {
    /**
     * 实例化解析器
     * @param url - 在线文档地址
     */
    constructor(url) {
        /**
         * 在线文档类型
         */
        this.type = 'swagger';
        this.url = url;
    }
    /**
     * 获取在线文档请求模型集合
     */
    getRequestModels() {
        throw new Error('Method not implemented.');
    }
    /**
     * 获取在线文档响应模型集合
     */
    getResponseModels() {
        throw new Error('Method not implemented.');
    }
}
exports.SwaggerParser = SwaggerParser;
/**
 * apipost v7 解析器
 */
class Apipostv7Parser {
    /**
     * 实例化解析器
     * @param url - 在线文档地址
     */
    constructor(url) {
        /**
         * 在线文档类型
         */
        this.type = 'apipostv7';
        this.url = url;
    }
    /**
     * 获取在线文档
     */
    getOnlineDocument() {
        const urlSlices = this.url.split('/');
        const url = urlSlices[4];
        const targetId = qs.parse(this.url.split('?')[1])['target_id'];
        const apiUrl = `https://v7-api.apipost.cn/doc/info?url=${url}&target_id=${targetId}`;
        return axios_1.default.get(apiUrl);
    }
    /**
     * 获取在线文档请求模型集合
     */
    async getRequestModels() {
        const resp = await this.getOnlineDocument();
        const original = resp?.data?.data?.request?.body?.raw_para || [];
        return original.map((item) => ({
            prop: item?.key,
            label: item?.description,
            description: item?.description,
            type: item?.field_type,
            defaultValue: item?.value === 'null' ? null : item?.value
        }));
    }
    /**
     * 获取在线文档响应模型集合
     */
    async getResponseModels() {
        const resp = await this.getOnlineDocument();
        const original = resp?.data?.data?.response?.success?.parameter || [];
        const path = vscode_1.workspace.getConfiguration().get('onlineDocumentToElTableApiResultDataPath') + '.';
        const fileds = original.filter((item) => item?.key?.indexOf(path) === 0);
        const result = fileds.map((item) => ({
            prop: item?.key.replace(path, ''),
            label: item?.description,
            description: item?.description,
            type: item?.field_type,
            defaultValue: item?.value === 'null' ? null : item?.value
        }));
        return result;
    }
}
exports.Apipostv7Parser = Apipostv7Parser;
/**
 * apipost v8 解析器
 */
class Apipostv8Parser {
    /**
     * 实例化解析器
     * @param url - 在线文档地址
     */
    constructor(url) {
        /**
         * 在线文档类型
         */
        this.type = 'apipostv8';
        this.url = url;
    }
    /**
     * 获取在线文档
     */
    getOnlineDocument() {
        const urlSlices = this.url.split('/');
        const issue_id = urlSlices[5].split('?')[0];
        const targetId = qs.parse(this.url.split('?')[1])['target_id'];
        const apiUrl = `https://doc.apipost.net/doc/details`;
        return axios_1.default.post(apiUrl, {
            issue_id,
            target_ids: [targetId]
        });
    }
    /**
     * 获取在线文档请求模型集合
     */
    async getRequestModels() {
        const resp = await this.getOnlineDocument();
        const original = resp?.data?.data?.list[0]?.request?.body?.raw_parameter || [];
        return original.map((item) => ({
            prop: item?.key,
            label: item?.description,
            description: item?.description,
            type: item?.field_type,
            defaultValue: item?.value === 'null' ? null : item?.value
        }));
    }
    /**
     * 获取在线文档响应模型集合
     */
    async getResponseModels() {
        const resp = await this.getOnlineDocument();
        let original = resp?.data?.data?.list[0]?.response?.example?.find((item) => item?.expect?.code?.toString() === '200');
        original = original?.raw_parameter || [];
        const path = vscode_1.workspace.getConfiguration().get('onlineDocumentToElTableApiResultDataPath');
        const paths = path?.split('.');
        const fileds = original.filter((item) => item?.key?.indexOf(paths.at(-1) + '.') === 0);
        return fileds.map((item) => ({
            prop: item?.key.replace(paths.at(-1) + '.', ''),
            label: item?.description,
            description: item?.description,
            type: item?.field_type,
            defaultValue: item?.value === 'null' ? null : item?.value
        }));
    }
}
exports.Apipostv8Parser = Apipostv8Parser;
/**
 * apifox 解析器
 */
class ApifoxParser {
    /**
     * 实例化解析器
     * @param url - 在线文档地址
     */
    constructor(url) {
        /**
         * 在线文档类型
         */
        this.type = 'apifox';
        this.url = url;
    }
    getOnlineDocument() {
        const urls = this.url.split('/');
        const sharedId = urls[4]?.replace('shared-', '');
        const apiId = urls[5]?.replace('api-', '');
        const url = `https://www.apifox.cn/api/v1/shared-docs/${sharedId}/http-apis/${apiId}`;
        return axios_1.default.get(url);
    }
    /**
     * 获取接口请求模型
     */
    async getRequestModels() {
        const resp = await this.getOnlineDocument();
        const original = resp?.data?.data?.requestBody?.jsonSchema?.properties;
        const keys = Object.keys(original);
        const result = [];
        for (const key of keys) {
            const model = {
                prop: key,
                label: original[key]?.description,
                description: original[key]?.description,
                type: original[key]?.type
            };
            result.push(model);
        }
        return result;
    }
    /**
     * 获取接口响应模型
     */
    async getResponseModels() {
        const resp = await this.getOnlineDocument();
        let original = resp?.data?.data?.responses?.find((item) => item.code?.toString() === '200')?.jsonSchema?.properties;
        const path = vscode_1.workspace.getConfiguration().get('onlineDocumentToElTableApiResultDataPath');
        const paths = path.split('.');
        if (!original[paths[0]]) {
            return [];
        }
        original = original[paths[0]].properties;
        if (!original[paths[1]]) {
            return [];
        }
        original = original[paths[1]]?.items?.properties;
        const keys = Object.keys(original);
        const result = [];
        for (const key of keys) {
            const model = {
                prop: key,
                label: original[key]?.description,
                description: original[key]?.description,
                type: original[key]?.type
            };
            result.push(model);
        }
        return result;
    }
}
exports.ApifoxParser = ApifoxParser;
/**
 * 获取在线文档解析器
 * @param url - 在线文档地址
 * @returns
 */
function getOnlineDocumentParser(url) {
    if (url.includes('apipost.cn')) {
        return new Apipostv7Parser(url);
    }
    else if (url.includes('apipost.net')) {
        return new Apipostv8Parser(url);
    }
    else if (url.includes('apifox.cn')) {
        return new ApifoxParser(url);
    }
    else {
        return new SwaggerParser(url);
    }
}
//# sourceMappingURL=onlineDocumentParser.js.map