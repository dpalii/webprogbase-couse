angular.
    module('categories').
    component('categories', {
        templateUrl: 'app/modules/categories/categories.template.html'
    }).
    controller('categoriesController', ['$scope', '$http', '$location', function ($scope, $http, $location) {
        $scope.limit = 5;
        $scope.offset = 0;
        $scope.searchword = '';
        $scope.searchinput = '';
        $scope.page = 1;
        $scope.pages = 1;
        $scope.maxSize = 5;
        $scope.setPage = setPage;
        setPage(1);
        $scope.next = function () {
            if ($scope.page < $scope.pages) setPage($scope.page + 1);
        }
        $scope.prev = function () {
            if ($scope.page > 1) setPage($scope.page - 1);
        }
        $scope.create = function () {
            $http.post('/api/v1/categories', { name: $scope.name })
                .then(data => {
                    setPage(1);
                    $('#createModal').modal('hide');
                    $location.path(`/category/${data.data.data._id}`);
                })
        }
        function setPage(pageNo) {
            $scope.searchword = $scope.searchinput;
            $scope.page = pageNo;
            $scope.offset = ($scope.page - 1) * $scope.limit;
            $http.get(`/api/v1/categories?limit=${$scope.limit}&offset=${$scope.offset}&searchword=${$scope.searchword}`)
                .then(data => {
                    $scope.totalItems = data.data.data.count;
                    $scope.categories = data.data.data.categories;
                    $scope.pages = Math.floor($scope.totalItems / $scope.limit);
                    if ($scope.totalItems % $scope.limit !== 0) $scope.pages += 1; 
                })
        };
    }]);