var zebra = require("../zebra.js");

zebra.controller("IntroCtrl", [
	"$scope",
	"$stateParams",
	"$ionicTabsDelegate",
	"$timeout",
function (
	$scope,
	$stateParams,
	$ionicTabsDelegate,
	$timeout
) {
	"use strict";

	if (
		$stateParams.gridIndex === "-1" &&
		$stateParams.packIndex === ""
	) {
		$scope.showClue = +$stateParams.puzzleIndex;
	}

	$timeout(function () {
		$ionicTabsDelegate.select(0);
	}, 400);
}]);
