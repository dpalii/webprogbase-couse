angular.
    module('profile').
    component('profile', {
        templateUrl: 'app/modules/profile/profile.template.html'
    }).
    controller('profileController', ['$scope', '$http', function ($scope, $http) {
        $scope.user = JSON.parse(localStorage.getItem('user'));
        $scope.updUser = {
            bio: $scope.user.bio,
            fullname: $scope.user.fullname
        }
        $scope.fakepath = 'Выберите фото...';
        $scope.update = upd;
        $scope.delete = del;
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
            $http.delete(`/api/v1/users/${$scope.user._id}`)
                .then(data => {
                    $scope.$parent.$parent.$parent.logout();
                    $("#deleteModal").modal('hide');
                })
                .catch(err => {
                    $scope.delErr = 'Ошибка удаления';
                });
        }
    }]);