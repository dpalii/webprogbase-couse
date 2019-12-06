angular.
    module('category').
    component('category', {
        templateUrl: 'app/modules/category/category.template.html'
    }).
    controller('categoryController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
        const id = $routeParams.id;
        getCategory(id);
        $scope.update = function () {
            $http.put(`/api/v1/categories/${id}`, { name: $scope.name })
                .then(data => {
                    $scope.category = data.data.data;
                    $scope.name = $scope.category.name;
                })
                .catch(err => {
                    console.log(err);
                });
        }
        function getCategory(id) {
            $http.get(`/api/v1/categories/${id}`)
                .then(data => {
                    $scope.category = data.data.data;
                    $scope.name = $scope.category.name;
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }]);