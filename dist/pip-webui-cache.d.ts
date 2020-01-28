declare module pip.cache {

export interface ICacheConfigService {
    enableLogs: boolean;
    models: CacheModel[];
    prefix: string;
}
export class CacheConfigService implements ICacheConfigService {
    enableLogs: boolean;
    models: CacheModel[];
    prefix: string;
    constructor(enableLogs: boolean, models: CacheModel[], prefix: string);
}
export interface ICacheConfigProvider {
    enableLogs: boolean;
    models: CacheModel[];
    prefix: string;
}


export class CacheCollectionParams {
    offset?: number;
    limit?: number;
}
export class CacheInterceptorOptions {
    maxAge?: number;
}
export class CacheModel {
    name: string;
    options: {
        maxAge: number;
        key?: string;
    };
    interceptors: {
        item?: {
            match: RegExp;
            options?: CacheInterceptorOptions;
            getKey: (groups: any) => any;
        };
        collection?: {
            match: RegExp;
            options?: CacheInterceptorOptions;
            responseModify?: {
                responseToItems: (resp: any) => any[];
                itemsToResponse: (items: any[]) => any;
            };
            getParams?: (params: any) => CacheCollectionParams;
        };
    };
}

export interface ICacheService {
    models: CacheModel[];
    getItem(modelName: string, key: any, options?: CacheInterceptorOptions): Promise<any>;
    getItems(modelName: string, params?: CacheCollectionParams, options?: CacheInterceptorOptions): Promise<any[]>;
    setItem(modelName: string, item: any, options?: {
        removeTotal?: boolean;
    }): Promise<any>;
    setItems(modelName: string, items: any[], payload?: {
        params?: CacheCollectionParams;
        options?: CacheInterceptorOptions;
    }): Promise<any[]>;
    deleteItems(modelName: string, keys: any[]): Promise<any>;
    clear(model?: string | string[]): Promise<any>;
}
export class CacheService implements ICacheService {
    private config;
    private openedDbs;
    constructor(config: ICacheConfigProvider);
    private getDbName(modelName);
    private getDb(model);
    private getModel(modelName);
    readonly models: CacheModel[];
    getItem(modelName: string, key: any, options?: CacheInterceptorOptions): Promise<any>;
    getItems(modelName: string, params?: CacheCollectionParams, options?: CacheInterceptorOptions): Promise<any[]>;
    setItem(modelName: string, item: any, options?: {
        removeTotal?: boolean;
    }): Promise<any>;
    setItems(modelName: string, items: any[], payload?: {
        params?: CacheCollectionParams;
        options?: CacheInterceptorOptions;
    }): Promise<any[]>;
    deleteItems(modelName: string, keys: any[]): Promise<any>;
    clear(model?: string | string[]): Promise<any>;
}
export interface ICacheProvider {
    models: CacheModel[];
    registerModel(model: CacheModel): boolean;
}


}
