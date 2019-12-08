angular.
    module('user').
    component('user', {
        templateUrl: 'app/modules/user/user.template.html'
    }).
    controller('userController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
        $scope.user = JSON.parse(localStorage.getItem('user'));
        $scope.id = $routeParams.id;
        getUser($scope.id);
        $scope.changeRole = function(role) {
            $http.put(`/api/v1/users/${$scope.id}`, {role: role})
                .then(data => {
                    $scope.currUser = data.data.data;
                })
                .catch(err => {
                    console.log(err);
                });
        }
        function getUser(id) {
            $http.get(`/api/v1/users/${id}`)
                .then(data => {
                    $scope.currUser = data.data.data;
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }]);