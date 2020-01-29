export class PipCachePaginationParams {
    offset?: number;
    limit?: number;
}

export function extractPaginationDefault(params: any): [PipCachePaginationParams, any] {
    const res = new PipCachePaginationParams();
    const pars = _.cloneDeep(params);
    if (params) {
        if (params.hasOwnProperty('offset')) {
            res.offset = parseInt(params.offset, 10);
            delete pars.offset;
        }
        if (params.hasOwnProperty('limit')) 
        {
            res.limit = parseInt(params.limit, 10);
            delete pars.limit;
        }
    }
    return [res, pars];
}

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
    // extractPagination?: (params: HttpParams) => [PipCachePaginationParams, HttpParams];
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
