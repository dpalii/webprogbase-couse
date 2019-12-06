angular.
    module('products').
    component('products', {
        templateUrl: 'app/modules/products/products.template.html'
    }).
    controller('productsController', ['$scope', '$http', function ($scope, $http) {
        $scope.limit = 5;
        $scope.offset = 0;
        $scope.searchword = '';
        $scope.searchinput = '';
        $scope.page = 1;
        $scope.pages = 1;
        $scope.maxSize = 5;
        $scope.setPage = setPage;
        $scope.fakepath = 'Выберите фото...'
        setPage(1);
        $scope.newprod = {
            prodname: 'product',
            price: 0,
            inStock: false,
            desc: ''
        }
        $scope.next = function () {
            if ($scope.page < $scope.pages) setPage($scope.page + 1);
        }
        $scope.prev = function () {
            if ($scope.page > 1) setPage($scope.page - 1);
        }
        $scope.create = function () {
            var fd = new FormData();
            for (prop in $scope.newprod) fd.append(prop, $scope.newprod[prop]);
            fd.append('prodpic', $scope.prodpic);
            $http.post('/api/v1/products', fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            })
                .then(data => {
                    setPage(1);
                    $("#createModal").modal('hide');
                })
                .catch(err => {
                    $scope.createErr = 'Файл слишком большой';
                });
        }
        function setPage(pageNo) {
            $scope.searchword = $scope.searchinput;
            $scope.page = pageNo;
            $scope.offset = ($scope.page - 1) * $scope.limit;
            $http.get(`/api/v1/products?limit=${$scope.limit}&offset=${$scope.offset}&searchword=${$scope.searchword}`)
                .then(data => {
                    $scope.totalItems = data.data.data.count;
                    $scope.products = data.data.data.products;
                    $scope.pages = Math.floor($scope.totalItems / $scope.limit);
                    if ($scope.totalItems % $scope.limit !== 0) $scope.pages += 1;
                })
        };

    }]);