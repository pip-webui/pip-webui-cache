import { CacheModel } from "./cache.models";

export interface ICacheConfigService {
    enableLogs: boolean;
    models: CacheModel[];
    prefix: string;
}

export class CacheConfigService implements ICacheConfigService {
    constructor(
        public enableLogs: boolean,
        public models: CacheModel[],
        public prefix: string
    ) { }
}

export interface ICacheConfigProvider {
    enableLogs: boolean;
    models: CacheModel[];
    prefix: string;
}

class CacheConfigProvider implements ICacheConfigProvider, ng.IServiceProvider {

    private _service: CacheConfigService;

    enableLogs: boolean = false;
    models: CacheModel[] = [];
    prefix: string = 'PipCache';

    constructor() {
        "ngInject";
    }

    public $get() {
        "ngInject";

        if (this._service == null) {
            this._service = new CacheConfigService(
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