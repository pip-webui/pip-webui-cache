/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appCache.Delete', []);

    thisModule.controller('DeleteController',
        function ($scope, pipPhotosData) {
            $scope.id = null;

            $scope.deletePhoto = function () {
                var t0 = performance.now();
                pipPhotosData.deletePhoto($scope.id).then(function (res) {
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
