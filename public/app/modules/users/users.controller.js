angular.
    module('users').
    component('users', {
        templateUrl: 'app/modules/users/users.template.html'
    }).
    controller('usersController', ['$scope', '$http', function ($scope, $http) {
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
        function setPage(pageNo) {
            $scope.searchword = $scope.searchinput;
            $scope.page = pageNo;
            $scope.offset = ($scope.page - 1) * $scope.limit;
            $http.get(`/api/v1/users?limit=${$scope.limit}&offset=${$scope.offset}&searchword=${$scope.searchword}`)
                .then(data => {
                    $scope.totalItems = data.data.data.count;
                    $scope.users = data.data.data.users;
                    $scope.pages = Math.floor($scope.totalItems / $scope.limit);
                    if ($scope.totalItems % $scope.limit !== 0) $scope.pages += 1; 
                })
        };
    }]);