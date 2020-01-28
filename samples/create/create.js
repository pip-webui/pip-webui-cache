/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appCache.Create', []);

    thisModule.controller('CreateController',
        function ($scope, pipPhotosData) {
            "ngInject";

            $scope.cache = true;
            $scope.item = {
                albumId: undefined,
                title: undefined,
                url: undefined,
                thumbnailUrl: undefined
            };
            $scope.result = '';

            $scope.createPhoto = function () {
                var t0 = performance.now();
                pipPhotosData.createPhoto($scope.item).then(function (res) {
                    var t1 = performance.now();
                    $scope.result = JSON.stringify({
                        time: (t1 - t0).toFixed(2) + 'ms',
                        item: res.data
                    }, null, 2);
                });
            };

        }
    );

})();
