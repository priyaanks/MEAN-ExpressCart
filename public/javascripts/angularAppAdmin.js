var app = angular.module('expressCart', ['ui.router'])
	.config([
		'$stateProvider',
		'$urlRouterProvider', 
		function($stateProvider, $urlRouterProvider) {
		
		$stateProvider
		  .state('adminlogin', {
		  	url: '/adminlogin',
		  	templateUrl: '/adminlogin.html',
		  	controller: 'AdminAuthCtrl',
		  	onEnter: ['$state', 'adminAuth', function($state, adminAuth) {
		  		if(adminAuth.isUserLoggedIn()) {
		  			$state.go('admindashboard');
		  		}
		  	}]
		  })
		  .state('adminregister', {
		  	url: '/adminregister',
		  	templateUrl: '/adminregister.html',
		  	controller: 'AdminAuthCtrl',
		  	onEnter: ['$state', 'adminAuth', function($state, adminAuth) {
		  		alert('hi');
		  		if(adminAuth.isUserLoggedIn()) {
		  			$state.go('adminlogin');
		  		}
		  	}]
		  })
		  .state('admindashboard', {
		  	url: '/admindashboard',
		  	templateUrl: '/admindashboard.html',
		  	controller: 'AdminDashboardCtrl',
		  });

		  $urlRouterProvider.otherwise('adminlogin');
	}])
	.factory('adminAuth', ['$http', '$window', function($http, $window){
		var adminAuth = {};

		adminAuth.saveToken = function(token){
			$window.localStorage('express-cart-token') = token;
		};

		adminAuth.getToken = function(){
			return $window.localStorage['express-cart-token'];
		};

		adminAuth.isUserLoggedIn = function(){
			var token = adminAuth.getToken();

			if(token){
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				return payload.exp > Date.now() / 1000;
			} else {
				return false;
			}
		};

		adminAuth.currentUser = function(){
			if(adminAuth.isUserLoggedIn()){
				var token = adminAuth.getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				return payload.username;
			}
		};

		adminAuth.register = function(user) {
			return $http.post('/adminregister', user).success(function(data){
				adminAuth.saveToken(data.token);
			});
		};

		adminAuth.logIn = function(user){
			return $http.post('/adminlogin', user).success(function(data){
				adminAuth.saveToken(data.token);
			});
		};

		adminAuth.logOut = function(){
			$window.localStorage.removeItem('express-cart-token');
		};

		return adminAuth;
	}])
	.controller('AdminAuthCtrl', [
		'$scope',
		'$state',
		'adminAuth', 
		function($scope, $state, adminAuth){
			$scope.user = {};
			alert('in AdminAuthCtrl');
			$scope.register = function(){
				adminAuth.register($scope.user).error(function(error){
					$scope.error = error;
				}).then(function(){
					$state.go('adminlogin');
				});
			};

			$scope.logIn = function(){
				adminAuth.logIn($scope.user).error(function(error){
					$scope.error = error;
				}).then(function(){
					$state.go('admindashboard');
				});
			};
	}])
	.controller('AdminDashboardCtrl', [
		'$scope',
		'$state',
		'adminAuth',
		function($scope, $state, adminAuth){
			$scope.name = "Priyank";
	}])
	.controller('NavCtrl', [
		'$scope',
		'adminAuth',
		function($scope, adminAuth){
			$scope.isUserLoggedIn = adminAuth.isUserLoggedIn;
			$scope.currentUser = adminAuth.currentUser;
			$scope.logOut = adminAuth.logOut;
			$scope.expressTheme = 'default';
	}]);