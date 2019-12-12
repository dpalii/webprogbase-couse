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
        $scope.limit = 5;
        $scope.offset = 0;
        $scope.page = 1;
        $scope.pages = 1;
        $scope.maxSize = 5;
        $scope.setPage = setPage;
        $scope.next = function () {
            if ($scope.page < $scope.pages) setPage($scope.page + 1);
        }
        $scope.prev = function () {
            if ($scope.page > 1) setPage($scope.page - 1);
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
            $("#deleteModal").modal('hide');
            $http.delete(`/api/v1/categories/${id}`)
                .then(data => { 
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
                    $("#createModal").modal('hide');
                    getCategory(id);
                    $location.path(`/product/${data.data.data._id}`);
                    $scope.createErr = '';
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
                    setPage(1);
                })
                .catch(err => {
                    console.log(err);
                });
        }
        function setPage(pageNo) {
            $scope.page = pageNo;
            $scope.offset = ($scope.page - 1) * $scope.limit;
            $http.get(`/api/v1/products?limit=${$scope.limit}&offset=${$scope.offset}&category=${$scope.category._id}`)
                .then(data => {
                    $scope.totalItems = data.data.data.count;
                    $scope.products = data.data.data.products;
                    $scope.pages = Math.floor($scope.totalItems / $scope.limit);
                    if ($scope.totalItems % $scope.limit !== 0) $scope.pages += 1; 
                })
        };
        
    }]);