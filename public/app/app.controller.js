angular.
    module('modernApp').
    controller('loginController', ['$scope', '$location', 'AuthenticationService', function ($scope, $location, AuthenticationService) {
        $scope.login = login;
        $scope.isLogged = AuthenticationService.IsLogged();
        $scope.logout = logout;
        $scope.register = register;
        $scope.user = JSON.parse(localStorage.getItem('user'));
        function login() {
            AuthenticationService.Login($scope.username, $scope.password, function (result, user) {
                if (result === true) {
                    $scope.user = user.user;
                    $scope.isLogged = true;
                    $("#loginModal").modal('hide');
                    $scope.username = '';
                    $scope.password = '';
                } else {
                    $scope.logErr = 'Username or password is incorrect';
                }
            });
        };
        function register() {
            if ($scope.password.length < 8) $scope.regErr = 'Password should be at least 8 chars long';
            else if ($scope.password != $scope.confirm) $scope.regErr = 'Passwords do not match';
            else AuthenticationService.Register($scope.username, $scope.password, $scope.confirm, function (result, user) {
                if (result === true) {
                    $scope.user = user.user;
                    $scope.isLogged = true;
                    $("#registerModal").modal('hide');
                    $scope.username = '';
                    $scope.password = '';
                    $scope.confirm = '';
                } else {
                    $scope.regErr = 'Username is occupied';
                }
            });
        }
        function logout() {
            AuthenticationService.Logout();
            $scope.user = null;
            $scope.isLogged = false;
            $location.path('/');
        }
    }]);