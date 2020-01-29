declare module pip.cache {

export interface ICacheConfigService {
    enabled: boolean;
    enableLogs: boolean;
    models: PipCacheModel[];
    prefix: string;
}
export class CacheConfigService implements ICacheConfigService {
    enabled: boolean;
    enableLogs: boolean;
    models: PipCacheModel[];
    prefix: string;
    constructor(enabled: boolean, enableLogs: boolean, models: PipCacheModel[], prefix: string);
}
export interface ICacheConfigProvider {
    enableLogs: boolean;
    models: PipCacheModel[];
    prefix: string;
}


export class PipCachePaginationParams {
    offset?: number;
    limit?: number;
}
export function extractPaginationDefault(params: any): [PipCachePaginationParams, any];
export class PipCacheInterceptorOptions {
    maxAge?: number;
}
export class PipCacheInterceptorSettings {
    match: RegExp;
    options?: PipCacheInterceptorOptions;
}
export class PipCacheInterceptorItemSettings extends PipCacheInterceptorSettings {
    getKey: (groups: any) => any;
}
export class PipCacheInterceptorCollectionSettings extends PipCacheInterceptorSettings {
    responseModify?: {
        responseToItems: (resp: any) => any[];
        itemsToResponse: (items: any[]) => any;
    };
}
export class PipCacheModel {
    name: string;
    options: {
        maxAge: number;
        key?: string;
    };
    interceptors: {
        item?: PipCacheInterceptorItemSettings;
        collection?: PipCacheInterceptorCollectionSettings;
    };
}

export interface ICacheService {
    models: PipCacheModel[];
    getItem(modelName: string, key: any, options?: PipCacheInterceptorOptions): Promise<any>;
    getItems(modelName: string, payload?: {
        httpParams?: any;
        interceptor?: PipCacheInterceptorCollectionSettings;
    }): Promise<any[]>;
    setItem(modelName: string, item: any, options?: {
        removeTotal?: boolean;
    }): Promise<any>;
    setItems(modelName: string, items: any[], payload?: {
        httpParams?: any;
        interceptor?: PipCacheInterceptorCollectionSettings;
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
    readonly models: PipCacheModel[];
    getItem(modelName: string, key: any, options?: PipCacheInterceptorOptions): Promise<any>;
    getItems(modelName: string, payload?: {
        httpParams?: any;
        interceptor?: PipCacheInterceptorCollectionSettings;
    }): Promise<any[]>;
    setItem(modelName: string, item: any, options?: {
        removeTotal?: boolean;
    }): Promise<any>;
    setItems(modelName: string, items: any[], payload?: {
        httpParams?: any;
        interceptor?: PipCacheInterceptorCollectionSettings;
    }): Promise<any[]>;
    deleteItems(modelName: string, keys: any[]): Promise<any>;
    clear(model?: string | string[]): Promise<any>;
}
export interface ICacheProvider {
    models: PipCacheModel[];
    registerModel(model: PipCacheModel): boolean;
}


}
