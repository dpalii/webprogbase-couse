angular.
    module('product').
    component('product', {
        templateUrl: 'app/modules/product/product.template.html'
    }).
    controller('productController', ['$scope', '$http', '$routeParams', '$location', function ($scope, $http, $routeParams, $location) {
        $scope.user = JSON.parse(localStorage.getItem('user'));
        $scope.id = $routeParams.id;
        $scope.limit = 5;
        $scope.offset = 0;
        $scope.page = 1;
        $scope.pages = 1;
        $scope.maxSize = 5;
        $scope.setPage = setPage;
        setPage(1);
        $scope.fakepath = 'Выберите фото...';
        getProduct($scope.id);
        $scope.update = upd;
        $scope.delete = del;
        $scope.postComment = function() {
            $http.post('/api/v1/comments/', JSON.stringify({ product: $scope.product._id, content: $scope.newcomment }))
                .then(data => {
                    setPage(1);
                    $scope.newcomment = '';
                })
                .catch(err => {
                    console.log(err);
                });
        }
        $scope.watch = function() {
            $http.post('/api/v1/subscribtions/', JSON.stringify({ productId: $scope.product._id }))
                .then(data => {
                    toast('Успех', 'Вы подписались на обновления этого товара');
                    checkSub();
                })
                .catch(err => {
                    if(err.status == 400) toast('Ошибка', 'Чтобы подписаться на обновления, начните роботу с ботом');
                    else if(err.status == 409) toast('Ошибка', 'Вы уже подписаны на обновления этого товара');
                    console.log(err);
                });
        }
        $scope.unwatch = function() {
            $http.delete(`/api/v1/subscribtions/${$scope.product._id}`)
                .then(data => {
                    toast('Успех', 'Вы отписались от обновлений этого товара');
                    checkSub();
                })
                .catch(err => {
                    if(err.status == 400) toast('Ошибка', 'Вы уже отписаны от обновлений этого товара');
                    console.log(err);
                });
        }
        $scope.remove = function(id) {
            $http.delete(`/api/v1/comments/${id}`)
                .then(data => {
                    setPage(1);
                })
                .catch(err => {
                    console.log(err);
                });
        }
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
            $scope.page = pageNo;
            $scope.offset = ($scope.page - 1) * $scope.limit;
            $http.get(`/api/v1/comments?limit=${$scope.limit}&offset=${$scope.offset}&id=${$scope.id}`)
                .then(data => {
                    $scope.totalItems = data.data.data.count;
                    $scope.comments = data.data.data.comments;
                    $scope.pages = Math.floor($scope.totalItems / $scope.limit);
                    if ($scope.totalItems % $scope.limit !== 0) $scope.pages += 1;
                })
        };
        function upd() {
            var fd = new FormData();
            if ($scope.updProduct.inStock == "true") $scope.updProduct.inStock = true;
            else $scope.updProduct.inStock == false;
            for(prop in $scope.updProduct) fd.append(prop, $scope.updProduct[prop]);
            fd.append('prodpic', $scope.prodpic);
            $http.put(`/api/v1/products/${$scope.id}`, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            })
                .then(data => {
                    $scope.product = data.data.data;
                    $("#editModal").modal('hide');
                    $scope.editErr = '';
                })
                .catch(err => {
                    $scope.editErr = 'Файл слишком большой';
                });
        }
        function del() {
            $("#deleteModal").modal('hide');
            $http.delete(`/api/v1/products/${$scope.id}`)
                .then(data => {
                    $location.path('/products');
                })
                .catch(err => {
                    console.log(err);
                });
        }
        function getProduct(id) {
            $http.get(`/api/v1/products/${id}`)
                .then(data => {
                    $scope.product = data.data.data;
                    checkSub();
                    $scope.updProduct = {
                        prodname: $scope.product.prodname,
                        desc: $scope.product.desc,
                        inStock: $scope.product.inStock,
                        price: $scope.product.price,
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        }
        function checkSub() {
            $http.get(`/api/v1/subscribtions/${$scope.product._id}`)
                .then(data => {
                    if (data.data.data) $scope.subbed = true;
                    else $scope.subbed = false;
                })
                .catch(err => {
                    console.log(err);
                });
        }
        function toast(head, body) {
            $scope.toastHeader = head;
            $scope.toastBody = body;
            $('#toast').toast('show');
        }
    }]);