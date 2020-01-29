(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).cache = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CacheConfigService = (function () {
    function CacheConfigService(enabled, enableLogs, models, prefix) {
        this.enabled = enabled;
        this.enableLogs = enableLogs;
        this.models = models;
        this.prefix = prefix;
    }
    return CacheConfigService;
}());
exports.CacheConfigService = CacheConfigService;
var CacheConfigProvider = (function () {
    function CacheConfigProvider() {
        "ngInject";
        this.enabled = true;
        this.enableLogs = false;
        this.models = [];
        this.prefix = 'PipCache';
    }
    CacheConfigProvider.prototype.$get = function () {
        "ngInject";
        if (this._service == null) {
            this._service = new CacheConfigService(this.enabled, this.enableLogs, this.models, this.prefix);
        }
        return this._service;
    };
    return CacheConfigProvider;
}());
angular
    .module("pipCache")
    .provider('pipCacheConfig', CacheConfigProvider);
},{}],2:[function(require,module,exports){
"use strict";
configureInterceptor.$inject = ['$httpProvider'];
Object.defineProperty(exports, "__esModule", { value: true });
function configureInterceptor($httpProvider) {
    "ngInject";
    $httpProvider.interceptors.push(['$q', 'pipCache', 'pipCacheConfig', function ($q, pipCache, pipCacheConfig) {
        return {
            request: function (config) {
                if (!pipCacheConfig.enabled) {
                    return config;
                }
                var _loop_1 = function (model) {
                    var _loop_2 = function (ik) {
                        var interceptor = model.interceptors[ik];
                        var match = interceptor.match.exec(config.url);
                        if (match) {
                            switch (config.method) {
                                case 'GET':
                                    switch (ik) {
                                        case 'item': return { value: pipCache.getItem(model.name, interceptor.getKey(match), interceptor.options)
                                                .then(function (item) {
                                                if (!item) {
                                                    config.onResponse = function (body) {
                                                        pipCache.setItem(model.name, body, interceptor.options);
                                                    };
                                                    return config;
                                                }
                                                else {
                                                    config.timeout = $q.defer().promise;
                                                    return $q.reject({ cachedData: item });
                                                }
                                            }) };
                                        case 'collection': return { value: pipCache.getItems(model.name, { httpParams: config.params, interceptor: interceptor })
                                                .then(function (items) {
                                                if (!items) {
                                                    config.onResponse = function (body) {
                                                        var its = interceptor.responseModify
                                                            ? interceptor.responseModify.responseToItems(body) : body;
                                                        pipCache.setItems(model.name, its, { httpParams: config.params, interceptor: interceptor });
                                                    };
                                                    return config;
                                                }
                                                else {
                                                    config.timeout = $q.defer().promise;
                                                    var resp = interceptor.responseModify
                                                        ? interceptor.responseModify.itemsToResponse(items) : items;
                                                    return $q.reject({ cachedData: resp });
                                                }
                                            }) };
                                        default:
                                            console.error("Unknown type of interceptor (" + ik + ")");
                                            break;
                                    }
                                case 'POST':
                                case 'PUT':
                                    switch (ik) {
                                        case 'item':
                                        case 'collection':
                                            config.onResponse = function (body) {
                                                pipCache.setItem(model.name, body, { removeTotal: config.method === 'POST' });
                                            };
                                            break;
                                        default:
                                            break;
                                    }
                                case 'DELETE':
                                    switch (ik) {
                                        case 'item':
                                            config.onResponse = function (body) {
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
                    };
                    for (var _i = 0, _a = Object.keys(model.interceptors); _i < _a.length; _i++) {
                        var ik = _a[_i];
                        var state_1 = _loop_2(ik);
                        if (typeof state_1 === "object")
                            return state_1;
                    }
                };
                for (var _i = 0, _a = pipCache.models; _i < _a.length; _i++) {
                    var model = _a[_i];
                    var state_2 = _loop_1(model);
                    if (typeof state_2 === "object")
                        return state_2.value;
                }
                return config;
            },
            response: function (response) {
                if (response.config.hasOwnProperty('onResponse') && typeof response.config.onResponse === 'function') {
                    response.config.onResponse(response.data);
                }
                return response;
            },
            responseError: function (rejection) {
                if (rejection && rejection.cachedData) {
                    return $q.resolve({ data: rejection.cachedData });
                }
                return $q.reject(rejection);
            }
        };
    }]);
}
angular
    .module('pipCache')
    .config(configureInterceptor);
},{}],3:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var PipCachePaginationParams = (function () {
    function PipCachePaginationParams() {
    }
    return PipCachePaginationParams;
}());
exports.PipCachePaginationParams = PipCachePaginationParams;
function extractPaginationDefault(params) {
    var res = new PipCachePaginationParams();
    var pars = _.cloneDeep(params);
    if (params) {
        if (params.hasOwnProperty('offset')) {
            res.offset = parseInt(params.offset, 10);
            delete pars.offset;
        }
        if (params.hasOwnProperty('limit')) {
            res.limit = parseInt(params.limit, 10);
            delete pars.limit;
        }
    }
    return [res, pars];
}
exports.extractPaginationDefault = extractPaginationDefault;
var PipCacheInterceptorOptions = (function () {
    function PipCacheInterceptorOptions() {
    }
    return PipCacheInterceptorOptions;
}());
exports.PipCacheInterceptorOptions = PipCacheInterceptorOptions;
var PipCacheInterceptorSettings = (function () {
    function PipCacheInterceptorSettings() {
    }
    return PipCacheInterceptorSettings;
}());
exports.PipCacheInterceptorSettings = PipCacheInterceptorSettings;
var PipCacheInterceptorItemSettings = (function (_super) {
    __extends(PipCacheInterceptorItemSettings, _super);
    function PipCacheInterceptorItemSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PipCacheInterceptorItemSettings;
}(PipCacheInterceptorSettings));
exports.PipCacheInterceptorItemSettings = PipCacheInterceptorItemSettings;
var PipCacheInterceptorCollectionSettings = (function (_super) {
    __extends(PipCacheInterceptorCollectionSettings, _super);
    function PipCacheInterceptorCollectionSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PipCacheInterceptorCollectionSettings;
}(PipCacheInterceptorSettings));
exports.PipCacheInterceptorCollectionSettings = PipCacheInterceptorCollectionSettings;
var PipCacheModel = (function () {
    function PipCacheModel() {
    }
    return PipCacheModel;
}());
exports.PipCacheModel = PipCacheModel;
},{}],4:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var cache_models_1 = require("./cache.models");
var TotalItem = (function () {
    function TotalItem() {
    }
    return TotalItem;
}());
var CacheService = (function () {
    function CacheService(config) {
        this.config = config;
        this.openedDbs = new Map();
    }
    CacheService.prototype.getDbName = function (modelName) {
        if (!modelName) {
            throw new Error('Model name should be defined');
        }
        return this.config.prefix + modelName.charAt(0).toUpperCase() + modelName.slice(1);
    };
    CacheService.prototype.getDb = function (model) {
        if (!model || !model.name) {
            throw new Error('Model should be defined');
        }
        var dbName = this.getDbName(model.name);
        if (this.openedDbs.has(dbName)) {
            return this.openedDbs.get(dbName);
        }
        var db = new Dexie(dbName);
        var modelKey = model.options.key || 'id';
        db.version(2).stores({
            items: modelKey,
            hashes: 'hash',
            lastRead: '',
            meta: ''
        });
        this.openedDbs.set(dbName, db);
        return db;
    };
    CacheService.prototype.getModel = function (modelName) {
        return this.models.find(function (m) { return m.name === modelName; });
    };
    Object.defineProperty(CacheService.prototype, "models", {
        get: function () { return this.config.models || []; },
        enumerable: true,
        configurable: true
    });
    CacheService.prototype.getItem = function (modelName, key, options) {
        return __awaiter(this, void 0, void 0, function () {
            var model, db, _a, expire, item, maxAge, expired;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        model = this.getModel(modelName);
                        db = this.getDb(model);
                        return [4 /*yield*/, Promise.all([
                                db.table('lastRead').get(key),
                                db.table('items').get(key)
                            ])];
                    case 1:
                        _a = _b.sent(), expire = _a[0], item = _a[1];
                        maxAge = options && options.maxAge || model.options.maxAge;
                        expired = expire + maxAge <= new Date().valueOf();
                        if (this.config.enableLogs) {
                            console.groupCollapsed('[PipCache] GET single item #' + key);
                            console.log('Item: ', item);
                            console.log('Expired: ', expired);
                            console.log('Expired at: ', new Date(expire));
                            console.groupEnd();
                        }
                        return [2 /*return*/, expired ? null : item];
                }
            });
        });
    };
    CacheService.prototype.getItems = function (modelName, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var model, db, modelKey, maxAge, _a, pagination, params, hasPagination, pars, offset, limit, hash;
            return __generator(this, function (_b) {
                model = this.getModel(modelName);
                db = this.getDb(model);
                modelKey = model.options.key || 'id';
                maxAge = _.get(payload, 'interceptor.options.maxAge', model.options.maxAge);
                if (this.config.enableLogs) {
                    console.groupCollapsed('[PipCache] GET collection of items');
                    console.log('Payload: ', payload);
                }
                _a = _.get(payload, 'interceptor.extractPagination', cache_models_1.extractPaginationDefault)(payload && payload.httpParams), pagination = _a[0], params = _a[1];
                hasPagination = Object.keys(pagination).length !== 0;
                pars = _.defaultsDeep(pagination, { offset: 0, limit: 0 });
                offset = pars.offset, limit = pars.limit;
                hash = params && Object.keys(params).length ? objectHash.MD5(params) : '';
                return [2 /*return*/, db.table('hashes').get(hash)
                        .then(function (hi) {
                        var total = hi && hi.total && hi.total.value && hi.total.lastRead + maxAge >= new Date().valueOf()
                            ? hi.total.value : undefined;
                        var upper = offset + limit;
                        var plannedLength = hasPagination
                            ? (limit ? (total ? (upper > total ? total - offset : limit) : limit) : (total ? (total - offset) : (limit)))
                            : total;
                        var idxMap = hi && hi.idxMap || [];
                        if (hasPagination) {
                            if (limit) {
                                idxMap = idxMap.filter(function (it, idx) { return idx >= offset && idx < upper; });
                                if (idxMap.length !== plannedLength) {
                                    if (_this.config.enableLogs) {
                                        console.log('There\'s not enough information about indexes');
                                        console.groupEnd();
                                    }
                                    return Promise.reject(null);
                                }
                            }
                            else if (total !== undefined) {
                                idxMap = idxMap.filter(function (it, idx) { return idx >= offset; });
                                if (idxMap.length !== plannedLength) {
                                    if (_this.config.enableLogs) {
                                        console.log('Not all items presented in cache');
                                        console.groupEnd();
                                    }
                                    return Promise.reject(null);
                                }
                            }
                            else {
                                if (_this.config.enableLogs) {
                                    console.log('We want to return all items, but we don\'t know how many they are');
                                    console.groupEnd();
                                }
                                return Promise.reject(null);
                            }
                        }
                        else if (total === undefined) {
                            if (_this.config.enableLogs) {
                                console.log('We want to return all items, but we don\'t know how many they are');
                                console.groupEnd();
                            }
                            return Promise.reject(null);
                        }
                        return Promise.all([
                            Promise.resolve(idxMap),
                            !hasPagination && !hash ? db.table('items').toArray() : db.table('items').where(modelKey).anyOf(idxMap).toArray(),
                            !hasPagination && !hash ? db.table('lastRead').toArray() : db.table('lastRead').where('').anyOf(idxMap).toArray()
                        ]);
                    }).then(function (_a) {
                        var ids = _a[0], items = _a[1], reads = _a[2];
                        if (!items || items.length !== ids.length || !reads || reads.length !== ids.length) {
                            if (_this.config.enableLogs) {
                                console.warn('Not all items presented in cache');
                                console.groupEnd();
                            }
                            return null;
                        }
                        if (Math.min.apply(Math, reads) + maxAge <= new Date().valueOf()) {
                            if (_this.config.enableLogs) {
                                console.log('Items was expired');
                                console.groupEnd();
                            }
                            return null;
                        }
                        var res = ids.map(function (id) { return items.find(function (it) { return it[modelKey] === id; }); });
                        if (_this.config.enableLogs) {
                            console.log('Items: ', res);
                            console.groupEnd();
                        }
                        return res;
                    }).catch(function (reason) {
                        if (reason === null) {
                            return null;
                        }
                        else {
                            throw reason;
                        }
                    })];
            });
        });
    };
    CacheService.prototype.setItem = function (modelName, item, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var model, db, promises;
            return __generator(this, function (_a) {
                model = this.getModel(modelName);
                db = this.getDb(model);
                promises = [
                    db.table('lastRead').put(new Date().valueOf(), item[model.options.key]),
                    db.table('items').put(item)
                ];
                if (options) {
                    if (options.removeTotal) {
                        promises.push(db.table('hashes').toCollection().modify({ total: undefined }));
                    }
                }
                return [2 /*return*/, Promise.all(promises).then(function (data) {
                        if (_this.config.enableLogs) {
                            console.groupCollapsed('[PipCache] SET single item #' + item[model.options.key]);
                            console.log('Item: ', data[1]);
                            console.log('Readed at: ', new Date());
                            console.groupEnd();
                        }
                        return data[1];
                    })];
            });
        });
    };
    CacheService.prototype.setItems = function (modelName, items, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var model, modelKey, db, lastRead, ids, total, _a, pagination, params, hasPagination, pars, offset, limit, hash, promises;
            return __generator(this, function (_b) {
                model = this.getModel(modelName);
                modelKey = model.options.key || 'id';
                db = this.getDb(model);
                lastRead = new Date().valueOf();
                ids = items.map(function (it) { return it[modelKey]; });
                _a = _.get(payload, 'interceptor.extractPagination', cache_models_1.extractPaginationDefault)(payload && payload.httpParams), pagination = _a[0], params = _a[1];
                hasPagination = Object.keys(pagination).length !== 0;
                pars = _.defaultsDeep(pagination, { offset: 0, limit: 0 });
                offset = pars.offset, limit = pars.limit;
                hash = params && Object.keys(params).length ? objectHash.MD5(params) : '';
                promises = [
                    db.table('lastRead').bulkPut(new Array(items.length).fill(lastRead), ids),
                    db.table('items').bulkPut(items),
                    db.table('hashes').get(hash).then(function (hi) {
                        var nh = hi || Object.assign(new TotalItem(), { hash: hash, total: {}, idxMap: [] });
                        ids.forEach(function (id, idx) { return nh.idxMap[idx + offset] = id; });
                        if (hasPagination && pagination.limit && items.length && items.length < pagination.limit || !hasPagination) {
                            total = (pagination.offset || 0) + items.length;
                            nh.total = {
                                value: total,
                                lastRead: lastRead
                            };
                        }
                        return db.table('hashes').put(nh);
                    })
                ];
                return [2 /*return*/, Promise.all(promises).then(function () {
                        if (_this.config.enableLogs) {
                            console.groupCollapsed('[PipCache] SET collection of items');
                            console.log('Payload: ', payload);
                            console.log('Items: ', items);
                            console.log('Hash:', hash);
                            console.log('Last read at: ', new Date());
                            if (!_.isUndefined(total)) {
                                console.log("New total for hash [" + hash + "]: " + total);
                            }
                            console.groupEnd();
                        }
                        return items;
                    })];
            });
        });
    };
    CacheService.prototype.deleteItems = function (modelName, keys) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var model, db;
            return __generator(this, function (_a) {
                model = this.getModel(modelName);
                db = this.getDb(model);
                return [2 /*return*/, Promise.all([
                        db.table('lastRead').bulkDelete(keys),
                        db.table('items').bulkDelete(keys),
                        db.transaction('rw', db.table('hashes'), function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, db.table('hashes').toCollection().modify(function () {
                                            var _this = this;
                                            var removeTotal;
                                            keys.forEach(function (key) {
                                                var idx = _this.value.idxMap.findIndex(function (id) { return id === key; });
                                                if (idx >= 0) {
                                                    _this.value.idxMap.splice(idx, 1);
                                                    removeTotal = true;
                                                }
                                            });
                                            if (removeTotal) {
                                                delete this.value.total;
                                            }
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                    ]).then(function () {
                        if (_this.config.enableLogs) {
                            console.groupCollapsed('[PipCache] DELETE');
                            console.log('Keys: ', keys);
                            console.groupEnd();
                        }
                    })];
            });
        });
    };
    CacheService.prototype.clear = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var dbs = [];
                        if (model) {
                            Array.isArray(model)
                                ? dbs.push.apply(dbs, model.map(function (m) { return _this.getDbName(m); })) : dbs.push(_this.getDbName(model));
                            resolve(dbs);
                        }
                        else {
                            resolve(Dexie.getDatabaseNames());
                        }
                    }).then(function (names) {
                        var dbs = names.filter(function (name) { return name.startsWith(_this.config.prefix); });
                        if (_this.config.enableLogs) {
                            console.log('databases to delete: ', names);
                        }
                        var promises = [];
                        for (var _i = 0, dbs_1 = dbs; _i < dbs_1.length; _i++) {
                            var name_1 = dbs_1[_i];
                            try {
                                var db = _this.openedDbs.has(name_1) ? _this.openedDbs.get(name_1) : new Dexie(name_1);
                                promises.push(db.table('items').clear());
                                promises.push(db.table('meta').clear());
                                promises.push(db.table('lastRead').clear());
                                promises.push(db.table('hashes').clear());
                            }
                            catch (err) {
                                if (_this.config.enableLogs) {
                                    console.warn('Error opening database ' + name_1);
                                }
                            }
                        }
                        return Promise.all(promises);
                    }).then(function (res) {
                        if (_this.config.enableLogs) {
                            console.log('[PipCache] CLEAR');
                            if (model) {
                                console.log('Model(s): ', model);
                            }
                            else {
                                console.log('all models');
                            }
                        }
                        return null;
                    })];
            });
        });
    };
    return CacheService;
}());
exports.CacheService = CacheService;
var CacheProvider = (function () {
    CacheProvider.$inject = ['pipCacheConfigProvider'];
    function CacheProvider(pipCacheConfigProvider) {
        "ngInject";
        this.pipCacheConfigProvider = pipCacheConfigProvider;
    }
    Object.defineProperty(CacheProvider.prototype, "models", {
        get: function () { return this.pipCacheConfigProvider.models; },
        enumerable: true,
        configurable: true
    });
    CacheProvider.prototype.registerModel = function (model) {
        if (!model) {
            return false;
        }
        var res = this.models.find(function (m) { return m.name === model.name; });
        if (res) {
            return false;
        }
        this.models.push(model);
        return true;
    };
    CacheProvider.prototype.$get = function () {
        "ngInject";
        if (this._service == null) {
            this._service = new CacheService(this.pipCacheConfigProvider);
        }
        return this._service;
    };
    return CacheProvider;
}());
angular
    .module("pipCache")
    .provider('pipCache', CacheProvider);
},{"./cache.models":3}],5:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
angular.module('pipCache', []);
require("./cache-config.service");
require("./cache.service");
require("./cache.interceptor");
__export(require("./cache.models"));
__export(require("./cache-config.service"));
__export(require("./cache.service"));
},{"./cache-config.service":1,"./cache.interceptor":2,"./cache.models":3,"./cache.service":4}],6:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./cache/index");
__export(require("./cache/index"));
},{"./cache/index":5}]},{},[6])(6)
});

//# sourceMappingURL=pip-webui-cache.js.map
