var zebra = require("../zebra.js");

zebra.controller("PackCtrl", [
	"$scope", "packs", "$stateParams", function (
	$scope,
	packs,
	$stateParams
) {
	"use strict";

	$scope.loadingStart();
	packs.getPack($stateParams.packIndex).then(
		function (pack) {
			$scope.pack = pack;
			$scope.loadingEnd();
		}
	);
}]);
