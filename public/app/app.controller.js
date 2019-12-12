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
                    $scope.logErr = '';
                } else {
                    $scope.logErr = 'Неправильный логин или пароль';
                }
            });
        };
        function register() {
            if ($scope.password.length < 8) $scope.regErr = 'Пароль должен состоять как минимум из 8 символов';
            else if ($scope.password != $scope.confirm) $scope.regErr = 'Пароли не совпадают';
            else AuthenticationService.Register($scope.username, $scope.password, $scope.confirm, function (result, user) {
                if (result === true) {
                    $scope.user = user.user;
                    $scope.isLogged = true;
                    $("#registerModal").modal('hide');
                    $scope.username = '';
                    $scope.password = '';
                    $scope.confirm = '';
                    $scope.regErr = '';
                } else {
                    $scope.regErr = 'Логин занят';
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