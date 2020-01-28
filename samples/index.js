/* global angular */

(function () {
    'use strict';

    var content = [
        { title: 'Create', state: 'create', url: '/create', controller: 'CreateController', templateUrl: 'create/create.html' },
        { title: 'Read', state: 'read', url: '/read', controller: 'ReadController', templateUrl: 'read/read.html' },
        { title: 'Update', state: 'update', url: '/update', controller: 'UpdateController', templateUrl: 'update/update.html' },
        { title: 'Delete', state: 'delete', url: '/delete', controller: 'DeleteController', templateUrl: 'delete/delete.html' }
    ];

    var thisModule = angular.module('appCache',
        [
            // 3rd Party Modules
            'ui.router', 'ui.utils', 'ngResource', 'ngAria', 'ngCookies', 'ngSanitize', 'ngMessages',
            'ngMaterial', 'wu.masonry', 'LocalStorageModule', 'pipCache',

            'appCache',
            'appCache.Create',
            'appCache.Read',
            'appCache.Update',
            'appCache.Delete',
            'pipPhotos.Data'
        ]
    );

    function getPhotosKey(groups) { return groups && groups.id; }
    function getPhotosParams(params) {
        var res = {};
        if (params.hasOwnProperty('p') && params.hasOwnProperty('l')) {
            res.limit = parseInt(params.l, 10);
            res.offset = (parseInt(params.p, 10) - 1) * res.limit;
        }
        return res;
    }

    thisModule.config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider, $mdIconProvider,
        $compileProvider, $httpProvider, pipCacheConfigProvider) {

        $mdIconProvider.iconSet('icons', '../lib/images/icons.svg', 512);

        $compileProvider.debugInfoEnabled(false);
        $httpProvider.useApplyAsync(true);

        var contentItem, i;

        for (i = 0; i < content.length; i++) {
            contentItem = content[i];
            $stateProvider.state(contentItem.state, contentItem);
        }

        $urlRouterProvider.otherwise('/create');
        pipCacheConfigProvider.enableLogs = true;
        pipCacheConfigProvider.models.push({
            name: 'photos',
            options: {
                maxAge: 1000 * 60 * 2,
                key: 'id'
            },
            interceptors: {
                item: {
                    match: new RegExp('photos\/(?<id>[^ $\/]*)'),
                    getKey: getPhotosKey
                },
                collection: {
                    match: new RegExp('photos'),
                    getParams: getPhotosParams
                }
            }
        });
    }
    );

    thisModule.controller('pipSampleController',
        function ($scope, $rootScope, $state, $mdSidenav, $mdTheming, $injector, $mdMedia, localStorageService) {

            var pipTranslate = $injector.has('pipTranslate') ? $injector.get('pipTranslate') : null,
                pipTheme = $injector.has('pipTheme') ? $injector.get('pipTheme') : null;

            $scope.isTranslated = !!pipTranslate;
            $scope.isTheme = !!pipTheme;
            $scope.$mdMedia = $mdMedia;

            $rootScope.$theme = localStorageService.get('theme') || 'blue';
            if ($scope.isTheme) {
                $scope.themes = _.keys(_.omit($mdTheming.THEMES, 'default'));
            } else {
                $scope.themes = [];
            }


            $scope.languages = ['en', 'ru'];
            if (!$rootScope.$language) {
                $rootScope.$language = 'en';
            }

            $scope.content = content;
            $scope.menuOpened = false;

            // Update page after language changed
            $rootScope.$on('languageChanged', function (event) {
                $state.reload();
            });

            // Update page after theme changed
            $rootScope.$on('themeChanged', function (event) {
                $state.reload();
            });

            $scope.onSwitchPage = function (state) {
                $mdSidenav('left').close();
                $state.go(state);
            };

            $scope.onThemeClick = function (theme) {
                if ($scope.isTheme) {
                    setTimeout(function () {
                        pipTheme.use(theme, false, false);
                        $rootScope.$theme = theme;
                        $rootScope.$apply();
                    }, 0);
                }
            };

            $scope.onToggleMenu = function () {
                $mdSidenav('left').toggle();
            };

            $scope.onLanguageClick = function (language) {
                if (pipTranslate) {
                    setTimeout(function () {
                        pipTranslate.use(language);
                        $rootScope.$apply();
                    }, 0);
                }

            };

            $scope.isActiveState = function (state) {
                return $state.current.name == state;
            };

        }
    );

})();
