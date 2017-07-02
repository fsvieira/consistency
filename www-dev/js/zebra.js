var zebra = angular.module("zebra", ["ionic"]);

zebra.run([
	"$ionicPlatform", "$rootScope", function (
	$ionicPlatform
) {
	"use strict";

	$ionicPlatform.ready(function () {
		if (window.cordova && window.cordova.Keyboard) {
			cordova.Keyboard.hideKeyboardAccessoryBar(true);
		}

		if (window.StatusBar) {
			StatusBar.styleDefault();
		}
	});
}]);

zebra.config([
	"$ionicConfigProvider",
	"$httpProvider",
	"$stateProvider",
	"$urlRouterProvider",
function (
	$ionicConfigProvider,
	$httpProvider,
	$stateProvider,
	$urlRouterProvider
) {
	"use strict";

	$ionicConfigProvider.views.maxCache(0);

	$stateProvider
		.state("start", {
			url: "/start",
			templateUrl: "templates/start.html"
		})
		.state("about", {
			url: "/about",
			templateUrl: "templates/about.html"
		})
		.state("packs", {
			url: "/packs",
			"abstract": true,
			template: "<ion-nav-view />"
		})
		.state("packs.index", {
			url: "",
			views: {
				"": {
					templateUrl: "templates/packs.html",
					controller: "PacksCtrl"
				}
			}
		})
		.state("packs.pack", {
			url: "/:packIndex",
			views: {
				"@": {
					templateUrl: "templates/pack.html",
					controller: "PackCtrl"
				}
			}
		})
		.state("packs.pack.puzzles", {
			url: "/:gridIndex",
			views: {
				"@": {
					templateUrl: "templates/puzzles.html",
					controller: "PuzzlesCtrl"
				}
			}
		})
		.state("packs.pack.puzzles.puzzle", {
			url: "/:puzzleIndex",
			views: {
				"@": {
					templateUrl: "templates/puzzle.html",
					controller: "PuzzleCtrl"
				}
			}
		});

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise("/start");
}]);

module.exports = zebra;
