angular.
    module('user').
    component('user', {
        templateUrl: 'app/modules/user/user.template.html'
    }).
    controller('userController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
        const id = $routeParams.id;
        getUser(id);
        $scope.changeRole = function(role) {
            $http.put(`/api/v1/users/${id}`, {role: role})
                .then(data => {
                    $scope.user = data.data.data;
                })
                .catch(err => {
                    console.log(err);
                });
        }
        function getUser(id) {
            $http.get(`/api/v1/users/${id}`)
                .then(data => {
                    $scope.user = data.data.data;
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }]);