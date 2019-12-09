angular.
  module('modernApp').
  config(['$routeProvider', '$httpProvider',
    function config($routeProvider ,$httpProvider) {
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
        when('/product/:id', {
          template: '<product></product>'
        }).
        when('/', {
          template: '<home></home>'
        }).
        when('/401', {
          template: '<e401></e401>'
        }).
        when('/403', {
          template: '<e403></e403>'
        }).
        when('/404', {
          template: '<e404></e404>'
        }).
        otherwise('/404');
        $httpProvider.interceptors.push('httpResponseInterceptor');
    }
  ]).
  run(function run($rootScope, $http, $location) {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
        $http.defaults.headers.common.Authorization = 'Bearer ' + jwt;
    }
});