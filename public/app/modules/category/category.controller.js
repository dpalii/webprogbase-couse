angular.
    module('category').
    component('category', {
        templateUrl: 'app/modules/category/category.template.html'
    }).
    controller('categoryController', ['$scope', '$http', '$routeParams', '$location', function ($scope, $http, $routeParams, $location) {
        const id = $routeParams.id;
        $scope.user = JSON.parse(localStorage.getItem('user'));
        $scope.fakepath = 'Выберите фото...';
        getCategory(id);
        $scope.newprod = {
            prodname: 'product',
            price: 0,
            inStock: false,
            desc: ''
        }
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
        $scope.delete = function () {
            $http.delete(`/api/v1/categories/${id}`)
                .then(data => { 
                    $("#deleteModal").modal('hide');
                    $location.path('/categories');
                })
                .catch(err => {
                    console.log(err);
                });
        }
        $scope.create = function () {
            var fd = new FormData();
            for (prop in $scope.newprod) fd.append(prop, $scope.newprod[prop]);
            fd.append('category', id);
            fd.append('prodpic', $scope.prodpic);
            $http.post('/api/v1/products', fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            })
                .then(data => {
                    getCategory(id);
                    $("#createModal").modal('hide');
                })
                .catch(err => {
                    $scope.createErr = 'Файл слишком большой';
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