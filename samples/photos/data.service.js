
var PhotosDataService = (function () {
    PhotosDataService.$inject = ['$http'];
    function PhotosDataService($http) {
        "ngInject";
        this.$http = $http;
        this.photosUrl = 'http://5c78f6073a89af0014cd7154.mockapi.io/api/v1/photos';
    }
    PhotosDataService.prototype.getPhotos = function (params, successCallback, errorCallback) {
        params = params ? params : {};
        return this.$http.get(this.photosUrl, { params: params }).then(successCallback, errorCallback);
    };
    PhotosDataService.prototype.getPhoto = function (id, successCallback, errorCallback) {
        return this.$http.get(this.photosUrl + '/' + id).then(successCallback, errorCallback);
    };
    PhotosDataService.prototype.createPhotos = function (photos, successCallback, errorCallback) {
        return this.$http.post(this.photosUrl, photos).then(successCallback, errorCallback);
    };
    PhotosDataService.prototype.createPhoto = function (photo, successCallback, errorCallback) {
        return this.$http.post(this.photosUrl, photo).then(successCallback, errorCallback);
    };
    PhotosDataService.prototype.updatePhoto = function (id, photo, successCallback, errorCallback) {
        return this.$http.put(this.photosUrl + '/' + id, photo).then(successCallback, errorCallback);
    };
    PhotosDataService.prototype.deletePhoto = function (id, successCallback, errorCallback) {
        return this.$http.delete(this.photosUrl + '/' + id).then(successCallback, errorCallback);
    };
    return PhotosDataService;
}());
var PhotosDataProvider = (function () {
    function PhotosDataProvider() {
        "ngInject";
    }
    PhotosDataProvider.prototype.$get = ['$http', function ($http) {
        "ngInject";
        if (this._service == null) {
            this._service = new PhotosDataService($http);
        }
        return this._service;
    }];
    return PhotosDataProvider;
}());
angular
    .module('pipPhotos.Data', [])
    .provider('pipPhotosData', PhotosDataProvider);
    