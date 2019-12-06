angular.
    module('modernApp').
    service('fileUpload', ['$https', function ($https) {
        this.uploadFileToUrl = function(file, uploadUrl) {
           var fd = new FormData();
           fd.append('file', file);
        
           $https.post(uploadUrl, fd, {
              transformRequest: angular.identity,
              headers: {'Content-Type': 'multipart/form-data'}
           })
           .success(function() {
           })
           .error(function() {
           });
        }
     }]);