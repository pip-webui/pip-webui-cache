/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appCache.Read', ['pipPhotos.Data']);

    thisModule.controller('ReadController',
        function ($scope, pipPhotosData, pipCacheConfig) {
            "ngInject";

            $scope.id = 1;
            $scope.limit = 10;
            $scope.page = 1;
            $scope.result = '';

            $scope.readAllPhotos = function () {
                var t0 = performance.now();
                pipPhotosData.getPhotos({ cache: pipCacheConfig.enabled }).then(function (res) {
                    var t1 = performance.now();
                    $scope.result = JSON.stringify({
                        time: (t1 - t0).toFixed(2) + 'ms',
                        item: res.data
                    }, null, 2);
                });
            };

            $scope.readPhotos = function () {
                var t0 = performance.now();
                pipPhotosData.getPhotos({ cache: pipCacheConfig.enabled }, { p: $scope.page, l: $scope.limit }).then(function (res) {
                    var t1 = performance.now();
                    $scope.result = JSON.stringify({
                        time: (t1 - t0).toFixed(2) + 'ms',
                        item: res.data
                    }, null, 2);
                });
            };

            $scope.readPhoto = function () {
                var t0 = performance.now();
                pipPhotosData.getPhoto($scope.id, { cache: pipCacheConfig.enabled }).then(function (res) {
                    var t1 = performance.now();
                    $scope.result = JSON.stringify({
                        time: (t1 - t0).toFixed(2) + 'ms',
                        item: res.data
                    }, null, 2);
                }, function (err) {
                    var t1 = performance.now();
                    $scope.result = JSON.stringify({
                        time: (t1 - t0).toFixed(2) + 'ms',
                        item: err
                    }, null, 2);
                });
            };
        }
    );

})();
