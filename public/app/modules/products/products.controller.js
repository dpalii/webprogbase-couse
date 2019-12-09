angular.
    module('products').
    component('products', {
        templateUrl: 'app/modules/products/products.template.html'
    }).
    controller('productsController', ['$scope', '$http', function ($scope, $http) {
        let user = JSON.parse(localStorage.getItem('user'));
        $scope.limit = 5;
        $scope.offset = 0;
        $scope.searchword = '';
        $scope.searchinput = '';
        $scope.page = 1;
        $scope.pages = 1;
        $scope.maxSize = 5;
        $scope.setPage = setPage;
        setPage(1);
        $scope.addToCart = function (product) {
            $http.post('/api/v1/links/', JSON.stringify({ productId: product._id }))
                .then(data => {
                    $scope.lastPurchase = product.prodname;
                    $("#purchaseNotification").toast('show');
                })
                .catch(err => {
                    console.log(err);
                });
        }
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
            $http.get(`/api/v1/products?limit=${$scope.limit}&offset=${$scope.offset}&searchword=${$scope.searchword}&inDesc=${$scope.inDesc}`)
                .then(data => {
                    $scope.totalItems = data.data.data.count;
                    $scope.products = data.data.data.products;
                    $scope.pages = Math.floor($scope.totalItems / $scope.limit);
                    if ($scope.totalItems % $scope.limit !== 0) $scope.pages += 1;
                })
        };

    }]);