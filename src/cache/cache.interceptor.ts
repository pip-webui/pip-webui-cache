import { ICacheService } from "./cache.service";
import { CacheCollectionParams } from "./cache.models";

function configureInterceptor(
    $httpProvider: ng.IHttpProvider
) {
    "ngInject";

    $httpProvider.interceptors.push(function ($q: ng.IQService, pipCache: ICacheService) {
        const getDefaultParams = function (params: any): CacheCollectionParams {
            const ret: CacheCollectionParams = {};
            if (params) {
                if (params.hasOwnProperty('offset')) { ret.offset = parseInt(params.offset, 10); }
                if (params.hasOwnProperty('limit')) { ret.limit = parseInt(params.limit, 10); }
            }
            return ret;
        };
        return {
            request: (config: ng.IRequestConfig) => {
                for (const model of pipCache.models) {
                    for (const ik of Object.keys(model.interceptors)) {
                        const interceptor = model.interceptors[ik];
                        const match = interceptor.match.exec(config.url);
                        if (match) {
                            switch (config.method) {
                                case 'GET':
                                    switch (ik) {
                                        case 'item':
                                            const { groups } = match;
                                            return pipCache.getItem(model.name, interceptor.getKey(groups), interceptor.options)
                                                .then(item => {
                                                    if (!item) {
                                                        (config as any).onResponse = (body) => {
                                                            pipCache.setItem(model.name, body, interceptor.options);
                                                        };
                                                        return config;
                                                    } else {
                                                        config.timeout = $q.defer().promise;
                                                        return $q.reject({ cachedData: item });
                                                    }
                                                });
                                        case 'collection':
                                            const params = interceptor.getParams ? interceptor.getParams(config.params) : getDefaultParams(config.params);
                                            return pipCache.getItems(model.name, params, interceptor.options)
                                                .then(items => {
                                                    if (!items) {
                                                        (config as any).onResponse = (body) => {
                                                            const its = interceptor.responseModify
                                                                ? interceptor.responseModify.responseToItems(body) : body;
                                                            pipCache.setItems(model.name, its,
                                                                { params, options: interceptor.options });
                                                        };
                                                        return config;
                                                    } else {
                                                        config.timeout = $q.defer().promise;
                                                        const resp = interceptor.responseModify
                                                            ? interceptor.responseModify.itemsToResponse(items) : items;
                                                        return $q.reject({ cachedData: resp });
                                                    }
                                                });
                                        default:
                                            console.error(`Unknown type of interceptor (${ik})`);
                                            break;
                                    }
                                case 'POST':
                                case 'PUT':
                                    switch (ik) {
                                        case 'item':
                                        case 'collection':
                                            (config as any).onResponse = (body) => {
                                                pipCache.setItem(model.name, body, { removeTotal: config.method === 'POST' });
                                            };
                                            break;
                                        default:
                                            break;
                                    }
                                case 'DELETE':
                                    switch (ik) {
                                        case 'item':
                                            const { groups } = match;
                                            (config as any).onResponse = (body) => {
                                                pipCache.deleteItems(model.name, [interceptor.getKey(groups)]);
                                            };
                                            break;
                                        default:
                                            break;
                                    }
                                default:
                                    break;
                            }
                        }
                    }
                }
                return config;
            },
            response: <T>(response: ng.IHttpPromiseCallbackArg<T>) => {
                if (response.config.hasOwnProperty('onResponse') && typeof (response.config as any).onResponse === 'function') {
                    (response.config as any).onResponse(response.data);
                }
                return response;
            },
            responseError: function (rejection) {
                if (rejection && rejection.cachedData) {
                    return $q.resolve({ data: rejection.cachedData });
                }
                return $q.reject(rejection);
            }
        } as ng.IHttpInterceptor;
    });
}

angular
    .module('pipCache')
    .config(configureInterceptor);