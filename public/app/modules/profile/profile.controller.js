angular.
    module('profile').
    component('profile', {
        templateUrl: 'app/modules/profile/profile.template.html'
    }).
    controller('profileController', ['$scope', '$http', function ($scope, $http) {
        $scope.user = JSON.parse(localStorage.getItem('user'));
        $scope.updUser = {
            bio: $scope.user.bio,
            fullname: $scope.user.fullname,
            tgTag: $scope.user.tgTag
        }
        $scope.limit = 5;
        $scope.offset = 0;
        $scope.page = 1;
        $scope.pages = 1;
        $scope.maxSize = 5;
        $scope.setPage = setPage;
        setPage(1);
        $scope.fakepath = 'Выберите фото...';
        $scope.update = upd;
        $scope.delete = del;
        $scope.removeFromCart = function(id) {
            $http.delete(`/api/v1/links/${id}`, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            })
                .then(data => {
                    setPage(1);
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
            $http.get(`/api/v1/links?limit=${$scope.limit}&offset=${$scope.offset}`)
                .then(data => {
                    $scope.totalItems = data.data.data.count;
                    $scope.links = data.data.data.links;
                    $scope.pages = Math.floor($scope.totalItems / $scope.limit);
                    if ($scope.totalItems % $scope.limit !== 0) $scope.pages += 1;
                })
        };
        function upd() {
            var fd = new FormData();
            for(prop in $scope.updUser) fd.append(prop, $scope.updUser[prop]);
            fd.append('avatar', $scope.avatar);
            $http.put(`/api/v1/users/${$scope.user._id}`, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            })
                .then(data => {
                    $scope.user = data.data.data;
                    localStorage.setItem('user', JSON.stringify(data.data.data));
                    $("#editModal").modal('hide');
                })
                .catch(err => {
                    $scope.editErr = 'Файл слишком большой';
                });
        }
        function del() {
            $("#deleteModal").modal('hide');
            $http.delete(`/api/v1/users/${$scope.user._id}`)
                .then(data => {
                    $scope.$parent.$parent.$parent.logout();
                })
                .catch(err => {
                    $scope.delErr = 'Ошибка удаления';
                });
        }
    }]);