angular
.module('modernApp')
.factory('httpResponseInterceptor', ['$q', '$location', function($q, $location) {
	return {
		response: function(response){
			if (response.status === 401) {
				console.log("Response 401");
            }
			if (response.status === 403) {
				console.log("Response 403");
			}
			if (response.status === 404) {
				console.log("Response 404");
			}
			return response || $q.when(response);
		},
		responseError: function(rejection) {
			if (rejection.status === 401) {
				console.log("Response Error 401", rejection);
				$location.path('/401').search('returnTo', $location.path());
			}
			if (rejection.status === 403) {
				console.log("Response Error 403", rejection);
				$location.path('/403').search('returnTo', $location.path());
			}
			if (rejection.status === 404) {
				console.log("Response Error 404", rejection);
				$location.path('/404').search('returnTo', $location.path());
			}
			return $q.reject(rejection);
		}
	}
}])