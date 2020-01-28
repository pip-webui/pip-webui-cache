/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appCache.Update', []);

    thisModule.controller('UpdateController',
        function ($scope, pipPhotosData, pipCacheConfig) {
            "ngInject";

            $scope.id = undefined;
            $scope.item = {
                id: undefined,
                albumId: undefined,
                title: undefined,
                url: undefined,
                thumbnailUrl: undefined
            };
            $scope.result = '';

            $scope.readPhoto = function () {
                pipPhotosData.getPhoto($scope.id, { cache: pipCacheConfig.enabled }).then(function (res) {
                    $scope.item = res.data;
                }, function (err) {
                    var t1 = performance.now();
                    $scope.result = JSON.stringify({
                        time: (t1 - t0).toFixed(2) + 'ms',
                        item: err
                    }, null, 2);
                });
            };

            $scope.savePhoto = function () {
                if (!$scope.item || !$scope.item.id) { return; }
                var t0 = performance.now();
                pipPhotosData.updatePhoto($scope.item.id, $scope.item, { cache: pipCacheConfig.enabled }).then(function (res) {
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
