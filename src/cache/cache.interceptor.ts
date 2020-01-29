import { ICacheService } from "./cache.service";
import { ICacheConfigService } from "./cache-config.service";

function configureInterceptor(
    $httpProvider: ng.IHttpProvider
) {
    "ngInject";

    $httpProvider.interceptors.push(function ($q: ng.IQService, pipCache: ICacheService, pipCacheConfig: ICacheConfigService) {
        return {
            request: (config: ng.IRequestConfig) => {
                if (!pipCacheConfig.enabled) { return config; }
                for (const model of pipCache.models) {
                    for (const ik of Object.keys(model.interceptors)) {
                        const interceptor = model.interceptors[ik];
                        const match = interceptor.match.exec(config.url);
                        if (match) {
                            switch (config.method) {
                                case 'GET':
                                    switch (ik) {
                                        case 'item':
                                            return pipCache.getItem(model.name, interceptor.getKey(match), interceptor.options)
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
                                            return pipCache.getItems(model.name, { httpParams: config.params, interceptor })
                                                .then(items => {
                                                    if (!items) {
                                                        (config as any).onResponse = (body) => {
                                                            const its = interceptor.responseModify
                                                                ? interceptor.responseModify.responseToItems(body) : body;
                                                            pipCache.setItems(model.name, its,
                                                                { httpParams: config.params, interceptor });
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
                                            (config as any).onResponse = (body) => {
                                                pipCache.deleteItems(model.name, [interceptor.getKey(match)]);
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