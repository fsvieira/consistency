var zebra = require("../zebra.js");

zebra.controller("PuzzlesCtrl", [
	"$scope", "packs", "$stateParams", "$interval",
	"$state", "$ionicModal", "videoads",
function (
	$scope,
	packs,
	$stateParams,
	$interval,
	$state,
	$ionicModal,
	videoads
) {
	"use strict";
	$scope.loadingStart();

	function updateCounter (puzzles) {
		var timed = puzzles.filter(function (puzzle) {
			puzzle.tmpStatus = puzzle.status;

			if (puzzle.time) {
				puzzle.tmpStatus = "timed";
			}

			return puzzle.time;
		});

		function counter () {
			timed.forEach(function (puzzle, index) {
				var counter = puzzle.time - new Date().getTime();

				if (puzzle.tmpStatus === "unlocked") {
					timed.splice(index, 1); // remove it from timed puzzles.
				}
				else if (counter <= 0) {
					puzzle.tmpStatus = "unlocked";
					packs.puzzleUnlock(
						$stateParams.packIndex,
						$stateParams.gridIndex,
						puzzle.pos
					);

					timed.splice(index, 1); // remove it from timed puzzles.
				}
				else {
					puzzle.counter = new Date(counter);
				}
			});
		}

		return $interval(counter, 1000);
	}

	packs.getPuzzles($stateParams.packIndex, $stateParams.gridIndex).then(
		function (pack) {
			$scope.pack = pack;
			$scope.puzzles = pack.grid.puzzles;

			var stop;
			if (pack.type !== "tutorial") {
				stop = updateCounter($scope.puzzles);
			}

			$scope.$on("$destroy", function () {
				if (angular.isDefined(stop)) {
					$interval.cancel(stop);
					stop = undefined;
				}
			});

			$scope.openPuzzle = function (index) {
				var puzzle = $scope.puzzles[index];

				if (puzzle.tmpStatus !== "unlocked") {
					$scope.openUnlock(puzzle);
				}
				else {
					$state.go(
						"packs.pack.puzzles.puzzle",
						{"puzzleIndex": index}
					);
				}
			};

			// Buy stuff,
			$ionicModal.fromTemplateUrl("templates/unlock.html", {
				scope: $scope,
				animation: "slide-in-up"
			}).then(function (modal) {
				$scope.unlockModal = modal;
			});

			$scope.openUnlock = function (data) {
				// packs.getPackDetails();
				$scope.unlock = data;
				$scope.showAdUnlock = data.tmpStatus === "timed";
				$scope.unlockModal.show();
			};

			$scope.closeUnlock = function () {
				$scope.unlock = undefined;
				$scope.unlockModal.hide();
			};

			$scope.showVideo = function () {
				// $scope.loadingStart();

				function unlock () {
					// $scope.loadingEnd();
					$scope.closeUnlock();

					packs.unlockVideoPuzzles(
						$stateParams.packIndex,
						$stateParams.gridIndex
					).then(function (puzzles) {
						puzzles.forEach(function (puzzle) {
							$scope.puzzles[puzzle.pos]
								.tmpStatus = "unlocked";
						});
					});
				}

				videoads.showAd().then(
					unlock,
					function (err) {
						if (err === "INTERNET_UNAVAILABLE" ||
							err === "Connection Error"
						) {
							$scope.showVideoError(err);
						}
						else {
							unlock();
						}
					}
				);
			};

			$scope.loadingEnd();
		}
	);
}]);
