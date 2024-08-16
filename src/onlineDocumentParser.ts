import axios from 'axios';
import * as qs from 'qs';
import { window, workspace } from 'vscode';

/**
 * api模型
 */
export interface IOnlineDocumentModel {
  prop: string,
  label: string,
  description: string,
  type: string,
  defaultValue: string
}
 
/**
 * 在线文档类型
 */
export type OnlineDocumentType = 'swagger' | 'apipostv7' | 'apipostv8' | 'apifox';

/**
 * 在线文档解析器接口
 */
export interface IOnlineDocumentParser {
  /**
   * 在线文档类型
   */
  readonly type: OnlineDocumentType
  /**
   * 在线文档地址
   */
  readonly url: string
  /**
   * 获取在线文档请求模型集合
   */
  getRequestModels(): Promise<Array<IOnlineDocumentModel> | null>
  /**
   * 获取在线文档响应模型集合
   */
  getResponseModels(): Promise<Array<IOnlineDocumentModel> | null>
}

/**
 * swagger 解析器
 */
export class SwaggerParser implements IOnlineDocumentParser {
  /**
   * 在线文档类型
   */
  readonly type: OnlineDocumentType = 'swagger';
  /**
   * 在线文档地址
   */
  readonly url: string;
  /**
   * 实例化解析器
   * @param url - 在线文档地址
   */
  constructor(url: string) {
    this.url = url;
  }
  /**
   * 获取在线文档请求模型集合
   */
  getRequestModels(): Promise<Array<IOnlineDocumentModel> | null> {
    throw new Error('Method not implemented.');
  }
  /**
   * 获取在线文档响应模型集合
   */
  getResponseModels(): Promise<Array<IOnlineDocumentModel> | null> {
    throw new Error('Method not implemented.');
  }
}

/**
 * apipost v7 解析器
 */
export class Apipostv7Parser implements IOnlineDocumentParser {
  /**
   * 在线文档类型
   */
  readonly type: OnlineDocumentType = 'apipostv7';
  /**
   * 在线文档地址
   */
  readonly url: string;
  /**
   * 实例化解析器
   * @param url - 在线文档地址
   */
  constructor(url: string) {
    this.url = url;
  }
  /**
   * 获取在线文档
   */
  getOnlineDocument(): Promise<any> {
    const urlSlices = this.url.split('/');
    const url = urlSlices[4];
    const targetId = qs.parse(this.url.split('?')[1])['target_id'];
    const apiUrl = `https://v7-api.apipost.cn/doc/info?url=${url}&target_id=${targetId}`;
    return axios.get(apiUrl);
  }
  /**
   * 获取在线文档请求模型集合
   */
  async getRequestModels(): Promise<Array<IOnlineDocumentModel> | null> {
    const resp = await this.getOnlineDocument();
    const original = resp?.data?.data?.request?.body?.raw_para || [];
    return original.map((item: any) => ({
      prop: item?.key,
      label: item?.description,
      description: item?.description,
      type: item?.field_type,
      defaultValue: item?.value === 'null' ? null : item?.value
    } as IOnlineDocumentModel));
  }
  /**
   * 获取在线文档响应模型集合
   */
  async getResponseModels(): Promise<Array<IOnlineDocumentModel> | null> {
    const resp = await this.getOnlineDocument();
    const original = resp?.data?.data?.response?.success?.parameter || [];
    const path = workspace.getConfiguration().get('onlineDocumentToElTableApiResultDataPath') + '.';
    const fileds = original.filter((item: { key: unknown[]; }) => item?.key?.indexOf(path) === 0);
    const result = fileds.map((item: any) => ({
        prop: item?.key.replace(path, ''),
        label: item?.description,
        description: item?.description,
        type: item?.field_type,
        defaultValue: item?.value === 'null' ? null : item?.value
    } as IOnlineDocumentModel));
    return result;
  }
}

/**
 * apipost v8 解析器
 */
export class Apipostv8Parser implements IOnlineDocumentParser {
  /**
   * 在线文档类型
   */
  readonly type: OnlineDocumentType = 'apipostv8';
  /**
   * 在线文档地址
   */
  readonly url: string;
  /**
   * 实例化解析器
   * @param url - 在线文档地址
   */
  constructor(url: string) {
    this.url = url;
  }
  /**
   * 获取在线文档
   */
  getOnlineDocument(): Promise<any> {
    const urlSlices = this.url.split('/');
    const issue_id = urlSlices[5].split('?')[0];
    const targetId = qs.parse(this.url.split('?')[1])['target_id'];
    const apiUrl = `https://doc.apipost.net/doc/details`;
    return axios.post(apiUrl, {
      issue_id,
      target_ids: [targetId]
    });
  }
  /**
   * 获取在线文档请求模型集合
   */
  async getRequestModels(): Promise<Array<IOnlineDocumentModel> | null> {
    const resp = await this.getOnlineDocument();
    const original = resp?.data?.data?.list[0]?.request?.body?.raw_parameter || [];
    return original.map((item: any) => ({
      prop: item?.key,
      label: item?.description,
      description: item?.description,
      type: item?.field_type,
      defaultValue: item?.value === 'null' ? null : item?.value
    } as IOnlineDocumentModel));
  }
  /**
   * 获取在线文档响应模型集合
   */
  async getResponseModels(): Promise<Array<IOnlineDocumentModel> | null> {
    const resp = await this.getOnlineDocument();
    let original = resp?.data?.data?.list[0]?.response?.example?.find((item: any) => item?.expect?.code?.toString() === '200');
    original = original?.raw_parameter || [];
    const path = workspace.getConfiguration().get('onlineDocumentToElTableApiResultDataPath') as string;
    const paths = path?.split('.');
    const fileds = original.filter((item: { key: unknown[]; }) => item?.key?.indexOf(paths.at(-1) + '.') === 0);
    return fileds.map((item: any) => ({
      prop: item?.key.replace(paths.at(-1) + '.', ''),
      label: item?.description,
      description: item?.description,
      type: item?.field_type,
      defaultValue: item?.value === 'null' ? null : item?.value
    } as IOnlineDocumentModel));
  }
}

/**
 * apifox 解析器
 */
export class ApifoxParser implements IOnlineDocumentParser {
  /**
   * 在线文档类型
   */
  readonly type: OnlineDocumentType = 'apifox';
  /**
   * 在线文档地址
   */
  readonly url: string;
  /**
   * 实例化解析器
   * @param url - 在线文档地址
   */
  constructor (url: string) {
    this.url = url;
  }
  getOnlineDocument(): Promise<any> {
    const urls = this.url.split('/');
    const sharedId = urls[4]?.replace('shared-', '');
    const apiId = urls[5]?.replace('api-', '');
    const url = `https://www.apifox.cn/api/v1/shared-docs/${sharedId}/http-apis/${apiId}`;
    return axios.get(url);
  }
  /**
   * 获取接口请求模型
   */
  async getRequestModels(): Promise<Array<IOnlineDocumentModel> | null> {
    const resp = await this.getOnlineDocument();
    const original = resp?.data?.data?.requestBody?.jsonSchema?.properties;
    const keys = Object.keys(original);
    const result = [];
    for(const key of keys) {
      const model = {
        prop: key,
        label: original[key]?.description,
        description: original[key]?.description,
        type: original[key]?.type
      } as IOnlineDocumentModel;
      result.push(model);
    }
    return result;
  }
  /**
   * 获取接口响应模型
   */
  async getResponseModels(): Promise<Array<IOnlineDocumentModel> | null> {
    const resp = await this.getOnlineDocument();
    let original = resp?.data?.data?.responses?.find((item: any) => item.code?.toString() === '200')?.jsonSchema?.properties;
    const path = workspace.getConfiguration().get('onlineDocumentToElTableApiResultDataPath') as string;
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
    for(const key of keys) {
      const model = {
        prop: key,
        label: original[key]?.description,
        description: original[key]?.description,
        type: original[key]?.type
      } as IOnlineDocumentModel;
      result.push(model);
    }
    return result;
  }
}

/**
 * 获取在线文档解析器
 * @param url - 在线文档地址
 * @returns 
 */
export function getOnlineDocumentParser(url: string): IOnlineDocumentParser | null {
  if (url.includes('apipost.cn')) {
    return new Apipostv7Parser(url);
  } else if (url.includes('apipost.net')) {
    return new Apipostv8Parser(url);
  } else if (url.includes('apifox.cn')) {
    return new ApifoxParser(url);
  } else {
    return new SwaggerParser(url);
  }
}