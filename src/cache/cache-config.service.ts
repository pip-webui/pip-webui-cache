import { PipCacheModel } from "./cache.models";

export interface ICacheConfigService {
    enabled: boolean;
    enableLogs: boolean;
    models: PipCacheModel[];
    prefix: string;
}

export class CacheConfigService implements ICacheConfigService {
    constructor(
        public enabled: boolean,
        public enableLogs: boolean,
        public models: PipCacheModel[],
        public prefix: string
    ) { }
}

export interface ICacheConfigProvider {
    enableLogs: boolean;
    models: PipCacheModel[];
    prefix: string;
}

class CacheConfigProvider implements ICacheConfigProvider, ng.IServiceProvider {

    private _service: CacheConfigService;

    enabled: boolean = true;
    enableLogs: boolean = false;
    models: PipCacheModel[] = [];
    prefix: string = 'PipCache';

    constructor() {
        "ngInject";
    }

    public $get() {
        "ngInject";

        if (this._service == null) {
            this._service = new CacheConfigService(
                this.enabled,
                this.enableLogs,
                this.models,
                this.prefix
            );
        }

        return this._service;
    }

}

angular
    .module("pipCache")
    .provider('pipCacheConfig', CacheConfigProvider);