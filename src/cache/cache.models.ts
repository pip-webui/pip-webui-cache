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
            }
            getParams?: (params: any) => CacheCollectionParams;
        };
    };
}
