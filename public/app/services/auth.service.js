angular.
    module('modernApp').
    factory('AuthenticationService', Service);

function Service($http) {
    var service = {};

    service.Login = Login;
    service.Logout = Logout;
    service.IsLogged = IsLogged;
    service.Register = Register;
    return service;

    function IsLogged() {
        if (localStorage.getItem('jwt')) return true;
        return false;
    }

    function Login(username, password, callback) {
        $http.post('/api/v1/auth', { username: username, password: password })
            .then(response => {
                if (response.data.token) {
                    localStorage.setItem('jwt', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    $http.defaults.headers.common.Authorization = 'Bearer ' + response.data.token;
                    callback(true, {user: response.data.user});
                } else {
                    callback(false, null);
                }
            })
            .catch(err => callback(false, null));
    }

    function Register(username, password, confirm, callback) {
        $http.post('/api/v1/users', {username: username, password: password })
            .then(response => {
                if (response.data) {
                    Login(username, password, callback);
                } else {
                    callback(false, null);
                }
            })
            .catch(err => callback(false, null));
    }

    function Logout() {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        $http.defaults.headers.common.Authorization = '';
    }
}