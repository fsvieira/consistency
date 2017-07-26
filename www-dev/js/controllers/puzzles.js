var zebra = require("../zebra.js");

zebra.controller("PuzzlesCtrl", [
	"$scope", "packs", "$stateParams", "$interval",
	"$state", "$ionicModal",
function (
	$scope,
	packs,
	$stateParams,
	$interval,
	$state
) {
	"use strict";
	$scope.loadingStart();

	packs.getPuzzles($stateParams.packIndex, $stateParams.gridIndex).then(
		function (pack) {
			$scope.pack = pack;
			$scope.puzzles = pack.grid.puzzles;

			$scope.openPuzzle = function (index) {
				$state.go(
					"packs.pack.puzzles.puzzle",
					{"puzzleIndex": index}
				);
			};

			$scope.loadingEnd();
		}
	);
}]);
