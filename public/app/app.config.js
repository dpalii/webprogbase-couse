angular.
  module('modernApp').
  config(['$routeProvider',
    function config($routeProvider) {
      $routeProvider.
        when('/about', {
          template: '<about></about>'
        }).
        when('/me', {
          template: '<profile></profile>'
        }).
        when('/users', {
          template: '<users></users>'
        }).
        when('/user/:id', {
          template: '<user></user>'
        }).
        when('/categories', {
          template: '<categories></categories>'
        }).
        when('/category/:id', {
          template: '<category></category>'
        }).
        when('/products', {
          template: '<products></products>'
        }).
        when('/', {
          template: '<home></home>'
        }).
        otherwise('/');
    }
  ]).
  run(function run($rootScope, $http, $location) {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + jwt;
    }
});