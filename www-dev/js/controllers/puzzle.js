var zebra = require("../zebra.js");

zebra.controller("PuzzleCtrl", [
	"$scope", "packs", "$state", "$stateParams", "$window",
	"$ionicModal", "$ionicPopup", "audio",
	"$ionicHistory", "$location", "$timeout", "ads",
function (
	$scope,
	packs,
	$state,
	$stateParams,
	$window,
	$ionicModal,
	$ionicPopup,
	audio,
	$ionicHistory,
	$location,
	$timeout,
	ads
) {
	"use strict";

	$scope.showAds = {};

	function updateAds () {
		ads.getAd().then(function (ad) {
			$scope.showAds.winAd = ad.winAd;
			$scope.showAds.restartAd = ad.restartAd;
			$scope.showAds.badchoiceAd = ad.badchoiceAd;

			// keep ads upated,
			setTimeout(updateAds, 1000*60);
		}, function (err) {
			console.log(err);
		});
	}

	updateAds();

	var trigger = function () {};
	$scope.setTrigger = function (t) {
		trigger = t;
	};

	$scope.getID = function (clue) {
		return clue.type.replace(/ /g, "_") +
			"-" + clue.a.v + (clue.b?"-" + clue.b.v:"");
	};

	audio.load("click", "sounds/click.mp3");
	audio.load("alert", "sounds/alert.mp3");
	audio.load("remove", "sounds/remove.mp3");
	audio.load("add", "sounds/add.mp3");
	audio.load("flip", "sounds/flip.mp3");
	audio.load("win", "sounds/win.mp3");

	$ionicModal.fromTemplateUrl("templates/startpack/intro.html", {
		scope: $scope,
		animation: "slide-in-up"
	}).then(function (modal) {
		$scope.tutorialIntro = modal;
		// modal.show();
	});

	$scope.openTutorialIntro = function () {
		$scope.tutorialIntro.show();
	};

	$scope.closeTutorialIntro = function () {
		$scope.tutorialIntro.hide();
	};

	$scope.openHandbook = function () {
		// $scope.handbook.show();
		$scope.tutorialIntro.show();
	};

	// Cleanup the modal when we're done with it!
	$scope.$on("$destroy", function () {
		// $scope.handbook.remove();
		$scope.tutorialIntro.remove();
	});

	function play (name) {
		if ($scope.settings.sounds) {
			audio.play(name);
		}
	}

	$scope.loadingStart();

	$scope.imageSet = "set_0";

	$scope.trymode = {};

	$scope.toggleTryMode = function () {
		$scope.trymode.on = !$scope.trymode.on;
		if ($scope.trymode.on) {
			$scope.board.board.forEach(function (row) {
				row.forEach(function (cell) {
					cell.forEach(function (item) {
						item.tryHigthligth = false;
					});
				});
			});
		}

		trigger({action: "trymode", on: $scope.trymode.on});
	};

	function checkSolution () {
		var board = $scope.board.board;
		var completed = 0;
		var result = true;
		var progress = [];

		var f = function (item) {
			progress[item.y][item.x].push({
				v: item.v,
				x: item.x,
				y: item.y,
				hidden: item.hidden
			});

			return !item.hidden;
		};

		for (var y=0; y<board.length; y++) {
			progress[y] = [];
			var row = board[y];
			for (var x=0; x<row.length; x++) {
				progress[y][x] = [];
				var cell = row[x].filter(f);

				completed += cell.length?cell.length:$scope.puzzle.grid.w;

				if (cell.length !== 1) {
					// return false;
					result = false;
				}
				else if (cell[0].v !== $scope.puzzle.solution[y][x]) {
					// return false;
					completed += $scope.puzzle.grid.w-1;
					result = false;
				}
			}
		}

		var w = $scope.puzzle.grid.w;
		var h = $scope.puzzle.grid.h;

		completed = Math.floor((1 - (completed - w*h) / (w*h*h-w*h))*100);

		if ($scope.puzzle.save &&
			completed !== 100 &&
			$scope.puzzle.completed !== 100
		) {
			packs.savePuzzleProgress(
				$stateParams.packIndex,
				$stateParams.gridIndex,
				$stateParams.puzzleIndex,
				completed,
				progress
			);
		}

		if (result) {
			play("win");

			$ionicPopup.alert({
				scope: $scope,
				title: "Congratulations",
				template: "You win, ready for next puzzle?",
				okText: "OK",
				okType: "button-positive"
			}).then(function () {
				function back () {
					if ($scope.puzzle.save &&
						completed === 100 &&
						$scope.puzzle.completed !== 100
					) {
						packs.savePuzzleProgress(
							$stateParams.packIndex,
							$stateParams.gridIndex,
							$stateParams.puzzleIndex,
							completed,
							progress
						).then(
							function () {
								if (+$stateParams.puzzleIndex === 24) {
									$location.path("/packs");
								}
								else {
									$ionicHistory.goBack();
								}
							},
							function () {
								$ionicHistory.goBack();
							}
						);
					}
					else {
						$ionicHistory.goBack();
					}
				}

				back();
			});
		}

		return result;
	}

	function restart () {
		var board = $scope.board.board;
		$scope.board.selected = undefined;
		var gameBoard = $scope.tutorialInit;

		for (var y=0; y<board.length; y++) {
			var row = board[y];
			for (var x=0; x<row.length; x++) {
				var cell = row[x];
				for (var j=0; j<cell.length; j++) {
					var item = cell[j];
					if (item.hidden) {
						item.hidden =
							gameBoard?gameBoard[y][x][j].hidden:false;

						cell.total+= item.hidden?0:1;
					}
				}
			}
		}

		checkSolution();
	}

	var restartLock = false;
	$scope.restart = function () {
		restartLock = true;
		$ionicPopup.confirm({
			scope: $scope,
			title: "Restart",
			template: "Restart Puzzle?"
		}).then(function (res) {
			restartLock = true;
			if (res) {
				restart();
			}
		});
	};

	$scope.toB = function (index) {
		play("click");
		$scope.board.clues.b.push($scope.board.clues.a[index]);
		$scope.board.clues.a.splice(index, 1);
		if ($scope.board.clues.a.length === 0) {
			$scope.board.clues.show = "B";
		}

		trigger({action: "toB"});
	};

	$scope.toA = function (index) {
		play("click");
		$scope.board.clues.a.push($scope.board.clues.b[index]);
		$scope.board.clues.b.splice(index, 1);

		if ($scope.board.clues.b.length === 0) {
			$scope.board.clues.show = "A";
		}

		trigger({action: "toA"});
	};

	$scope.switchClues = function () {
		play("click");
		switch ($scope.board.clues.show) {
			case "A": $scope.board.clues.show = "B"; break;
			case "B": $scope.board.clues.show = "F"; break;
			case "F": $scope.board.clues.show = "A"; break;
		}
		trigger({action: "switch", list: $scope.board.clues.show});
	};

	$scope.select = function (x, y, item, e) {
		play("click");

		trigger({action: "select", item: item});

		var filter;

		if (item) {
			filter = [];

			for (var i=0; i<$scope.board.clues.all.length; i++) {
				var clue = $scope.board.clues.all[i];
				if (clue.type !== "item" && (
						clue.a.v === item.v ||
						clue.b && clue.b.v === item.v
					)
				) {
					filter.push({
						type: clue.type,
						a: clue.a,
						b: clue.b
					});
				}
			}

			if ($scope.trymode.on) {
				var v = !item.tryHigthligth;
				$scope.board.board[y][x].forEach(function (cellItem) {
					if (cellItem === item) {
						cellItem.tryHigthligth = v;
					}
					else {
						cellItem.tryHigthligth = false;
					}
				});
			}
		}

		$scope.board.selected = {
			x: x,
			y: y,
			items: $scope.board.board[y][x],
			item: item,
			filter: filter
		};

		if (e) {
			e.stopPropagation();
		}
	};

	$scope.selectItem = function (index) {
		play("click");
		var item = $scope.board.selected.items[index];
		$scope.select(item.x, item.y, item);
	};

	var checkBoard = function () {};

	function removeItem (x, y, item) {
		play("remove");

		var items = $scope.board.board[y][x];
		items.total--;
		item.hidden = true;

		trigger({action: "remove", item: item});

		checkBoard();
	}

	function setItem (x, y, item) {
		play("add");

		var items = $scope.board.board[y][x];

		for (var i=0; i<items.length; i++) {
			items[i].hidden = true;
		}

		item.hidden = false;
		items.total = 1;

		checkBoard();
	}

	checkBoard = function () {
		// Check if there is only one item in a row but is not set,
		for (var y=0; y < $scope.board.board.length; y++) {
			var item;
			var items = {};
			var row = $scope.board.board[y];
			for (var x=0; x < row.length; x++) {
				var cell = row[x];
				for (var c=0; c < cell.length; c++) {
					item = cell[c];
					if (!item.hidden) {
						items[item.v] = items[item.v] || [];
						items[item.v].push({cell: cell, item: item});
					}
				}
			}

			for (var v in items) {
				if (items.hasOwnProperty(v)) {
					// Check alone items,
					if (
						items[v].length === 1 &&
						items[v][0].cell.total > 1
					) {
						item = items[v][0].item;
						return setItem(item.x, item.y, item);
					}

					// check if item is set, but is not removed
					// from other cell.
					if (items[v].length > 1) {
						var remove = false;
						for (var i=items[v].length-1; i>=0; i--) {
							if (items[v][i].cell.total === 1) {
								items[v].splice(i, 1);
								remove = true;
							}
						}

						if (remove && items[v].length > 0) {
							item = items[v][0].item;
							return removeItem(item.x, item.y, item);
						}
					}
				}
			}
		}

		checkSolution();
	};

	$scope.setItem = function () {
		var item = $scope.board.selected.item;
		var y = $scope.board.selected.y;
		var x = $scope.board.selected.x;

		if ($scope.settings.badchoice &&
			item.v !== $scope.puzzle.solution[y][x]
		) {
			play("alert");

			$ionicPopup.alert({
				scope: $scope,
				title: "Bad Choice",
				templateUrl: "templates/puzzle/badchoice.html",
				okText: "OK",
				okType: "button-positive"
			});
		}
		else {
			setItem(x, y, item);
		}
	};

	$scope.hideItem = function () {
		var y = $scope.board.selected.y;
		var x = $scope.board.selected.x;

		if ($scope.settings.badchoice &&
			$scope.board.selected.item.v === $scope.puzzle.solution[y][x]
		) {
			play("alert");

			$ionicPopup.alert({
				scope: $scope,
				title: "Bad Choice",
				templateUrl: "templates/puzzle/badchoice.html",
				okText: "OK",
				okType: "button-positive"
			});
		}
		else if (!$scope.board.selected.item.hidden) {
			var item = $scope.board.selected.item;
			removeItem(x, y, item);
		}
	};

	$scope.showItem = function () {
		play("add");

		$scope.board.selected.items.total++;
		$scope.board.selected.item.hidden = false;
		checkSolution();
	};

	$scope.getVisible = function (cell) {
		return cell.filter(function (item) {
			return !item.hidden;
		});
	};

	function showInitMessage (pack) {
		if (pack.type === "tutorial") {
			$timeout(function () {
				$scope.tutorialIntro.show();
			}, 500);
		}
	}

	function setupPack (pack) {
		var puzzle = pack.grid.puzzle;
		var gameBoard = puzzle.progress;

		if (
			pack.type === "tutorial"
		) {
			$scope.tutorialInit = JSON.parse(JSON.stringify(puzzle.progress));
		}

		showInitMessage(pack);

		puzzle.save = $stateParams.puzzleIndex !== "-1" &&
						puzzle.completed < 100 &&
						pack.type !== "tutorial";

		puzzle.progress = undefined;

		puzzle.index = +$stateParams.puzzleIndex;
		$scope.pack = pack;
		$scope.puzzle = puzzle;
		$scope.info = {
			packIndex: +$stateParams.packIndex,
			gridIndex: +$stateParams.gridIndex
		};

		var w = pack.grid.w;
		var h = pack.grid.h;

		var d = Math.ceil(w/2);

		if (!gameBoard) {
			gameBoard = [];

			for (var y=0; y<h; y++) {
				var row = gameBoard[y] = gameBoard[y] || [];
				for (var x=0; x<w; x++) {
					var cell = row[x] = row[x] || [];

					cell.total = 0;
					for (var i=0; i<w; i++) {
						var item = {v: "var_" + y + "_" + i, x: x, y: y};
						item.hidden =
							puzzle.completed === 100 &&
							puzzle.solution[y][x] !== item.v;

						cell.push(item);

						if (!item.hidden) {
							cell.total++;
						}
					}
				}
			}

		}
		else {
			gameBoard.forEach(function (lines) {
				lines.forEach(function (cell) {
					cell.total = cell.filter(function (item) {
						return !item.hidden;
					}).length;
				});
			});
		}

		/* TODO: rename board to game */
		var board = {
			grid: {w: pack.grid.w, h: pack.grid.h},
			board: gameBoard,
			clues: {
				all: puzzle.clues,
				a: puzzle.clues.slice(),
				b: [],
				show: "A"
			},
			geometry: {w: 16*d*w, h: 16*2*h, bh: 30, clues: {w: 500}}
		};

		function geometry () {
			play("flip");

			var title = 50;
			var vh = $window.innerHeight < 300?300:$window.innerHeight;
			var bars = Math.floor((vh-title)/(h+2));

			if (bars < 32) {
				bars = 32;
			}
			else if (bars > 96) {
				bars = 96;
			}

			var gh = vh-title-bars;
			var gw = gh*w/h;

			if (gw>$window.innerWidth) {
				gw = $window.innerWidth;
				gh = gw*h/w;
				bars = $window.innerHeight-title-gh;

				if (bars < 32) {
					bars = 32;
				}
				else if (bars > 96) {
					bars = 96;
				}
			}

			board.geometry.w = gw;
			board.geometry.h = gh;
			board.geometry.bh = Math.floor(bars/2);

			board.geometry.clues.w = $window.innerWidth-48;
		}

		geometry();
		$scope.board = board;

		$scope.$watch($scope.getWindowSize, geometry, true);
		$scope.loadingEnd();
	}

	if ($stateParams.puzzleIndex === "-1") {
		$scope.tutorial = true;
		setupPack(
			{
				"id": -1,
				"name": "Tutorial",
				"grid": {
					"w": 4,
					"h": 4,
					"puzzle": {
						"grid": {"w": 4,"h": 4},
						"solution": [
							["var_0_2","var_0_3","var_0_0","var_0_1"],
							["var_1_1","var_1_0","var_1_3","var_1_2"],
							["var_2_2","var_2_0","var_2_1","var_2_3"],
							["var_3_0","var_3_1","var_3_2","var_3_3"]
						],
						"clues": [
							{
								"type": "middle",
								"a": {"v": "var_0_3","y": 0}
							},
							{
								"type": "immediately to the left of",
								"a": {"v": "var_1_1","y": 1},
								"b": {"v": "var_0_3","y": 0}
							},
							{
								"type": "immediately to the left of",
								"a": {"v": "var_2_0","y": 2},
								"b": {"v": "var_1_3","y": 1}
							},
							{
								"type": "immediately to the left of",
								"a": {"v": "var_3_2","y": 3},
								"b": {"v": "var_3_3","y": 3}
							},
							{
								"type": "immediately to the left of",
								"a": {"v": "var_1_3","y": 1},
								"b": {"v": "var_2_3","y": 2}
							},
							{
								"type": "immediately to the left of",
								"a": {"v": "var_1_0","y": 1},
								"b": {"v": "var_1_3","y": 1}
							},
							{
								"type": "immediately to the left of",
								"a": {"v": "var_2_2","y": 2},
								"b": {"v": "var_0_3","y": 0}
							},
							{
								"type": "immediately to the left of",
								"a": {"v": "var_0_2","y": 0},
								"b": {"v": "var_1_0","y": 1}
							},
							{
								"type": "same position as",
								"a": {"v": "var_0_2","y": 0},
								"b": {"v": "var_3_0","y": 3}
							},
							{
								"type": "same position as",
								"a": {"v": "var_0_0","y": 0},
								"b": {"v": "var_3_2","y": 3}
							},
							{
								"type": "next to",
								"a": {"v": "var_3_1","y": 3},
								"b": {"v": "var_1_3","y": 1}
							},
							{
								"type": "next to",
								"a": {"v": "var_2_1","y": 2},
								"b": {"v": "var_1_2","y": 1}
							}
						]
					}
				}
			}
		);
	}
	else {
		packs.getPuzzle(
			$stateParams.packIndex,
			$stateParams.gridIndex,
			$stateParams.puzzleIndex
		).then(setupPack);
	}

}]);
