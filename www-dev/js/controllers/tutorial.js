var zebra = require("../zebra.js");

zebra.controller("TutorialCtrl", [
	"$scope",
function (
	$scope
) {
	"use strict";

	$scope.state = "start";
	var states = [
		"start",
		"clues-meaning",
		"clues-1",
		"clues-1-remove",
		"clues-1-2",
		"clues-1-2-remove",
		"organize",
		"organize-AB",
		"filter",
		"filter-select",
		"try-mode",
		"try-select",
		"try-remove-select",
		"try-remove",
		"try-remove-select-1",
		"try-remove-1",
		"end"
	];

	function check (msg, action, x, y, v) {
		if (msg.action !== action) {
			return false;
		}

		if (!msg.item) {
			return true;
		}

		if (x!==undefined && y!==undefined && v!==undefined) {
			var item = msg.item;
			return item.x === x &&
				item.y === y &&
				item.v === v
			;
		}
		else {
			return true;
		}
	}

	var filterCount = 1;
	var trySelectCount = [];

	function message (msg) {
		if (filterCount === 0) {
			$scope.next("filter-select");
			filterCount--;
		}

		if (
			check(msg, "remove", 1, 0, "var_0_3") ||
			check(msg, "remove", 2, 0, "var_0_3") ||
			check(msg, "remove", 0, 1, "var_1_1") ||
			check(msg, "remove", 1, 1, "var_1_1")
		) {
			if (trySelectCount.indexOf(msg.item) === -1) {
				trySelectCount.push(msg.item);
			}
		}

		if (check(msg, "closeHandbook")) {
			$scope.next("clues-meaning");
		}
		else if (
			$scope.state === "try-select" && (
				check(msg, "select", 1, 0, "var_0_3") ||
				check(msg, "select", 2, 0, "var_0_3") ||
				check(msg, "select", 0, 1, "var_1_1") ||
				check(msg, "select", 1, 1, "var_1_1")
			)
		) {
			if (trySelectCount.indexOf(msg.item) === -1) {
				trySelectCount.push(msg.item);
			}

			if (trySelectCount.length === 4) {
				$scope.next("try-select");
			}
		}
		else if (
			$scope.state === "filter-select" &&
			check(msg, "select")
		) {
			filterCount--;
			if (filterCount < 0) {
				$scope.next("filter-select");
			}
		}
		else if (check(msg, "select", 0, 0, "var_0_3")) {
			$scope.next("clues-1");
		}
		else if (check(msg, "remove", 0, 0, "var_0_3")) {
			$scope.next("clues-1-remove");
		}
		else if (check(msg, "select", 3, 0, "var_0_3")) {
			$scope.next("clues-1-2");
		}
		else if (check(msg, "remove", 3, 0, "var_0_3")) {
			$scope.next("clues-1-2-remove");
		}
		else if (check(msg, "toA") || check(msg, "toB")) {
			$scope.next("organize");
		}
		else if (check(msg, "switch")) {
			$scope.next("organize-AB");
			if (msg.list === "F") {
				$scope.next("filter");
			}
		}
		else if (check(msg, "trymode")) {
			if (msg.on) {
				$scope.next("try-mode");
			}
		}
		else if (check(msg, "select", 3, 0, "var_0_3")) {
			$scope.next("clues-1-2");
		}
		else if (
			check(msg, "select", 2, 1, "var_1_1")
		) {
			$scope.next("try-remove-select");
		}
		else if (
			check(msg, "remove", 2, 1, "var_1_1")
		) {
			$scope.next("try-remove-select");
			$scope.next("try-remove");
		}
		else if (
			check(msg, "select", 3, 1, "var_1_1")
		) {
			$scope.next("try-remove-select-1");
		}
		else if (
			check(msg, "remove", 3, 1, "var_1_1")
		) {
			$scope.next("try-remove-select-1");
			$scope.next("try-remove-1");
		}
	}

	$scope.$parent.setTrigger(message);

	$scope.setFace = function () {
		angular.element(document.querySelector(".hand")).remove();
		angular.element(document.querySelector(".hand")).remove();
		angular.element(document.querySelector(".hand")).remove();
		angular.element(document.querySelector(".hand")).remove();

		$scope.face = Math.floor(Math.random()*100)%6;
	};

	$scope.setFace();

	$scope.next = function (state) {
		state = state || $scope.state;

		var index = states.indexOf(state);
		if (index !== -1) {
			$scope.setFace();

			if (
				index > 0 && state === "try-mode"
			) {
				index = 0;
			}
			else {
				states.splice(index, 1);
			}

			if (
				state === "clues-1-2-remove" && index > 0
			) {
				index = 0;
			}

			if (states[index] === "end" && states.length > 1) {
				$scope.state = states[0];
			}
			else {
				$scope.state = states[index];
			}

			switch ($scope.state) {
				case "clues-meaning":
					angular.element(
						document.querySelector("#handbook")
					).append("<div class='hand'></div>");
					break;

				case "clues-1":
					angular.element(
						document.querySelector("#var_0_3__P0x0")
					).append("<div class='hand'></div>");
					break;

				case "try-remove":
				case "try-remove-1":
				case "clues-1-2-remove":
				case "clues-1-remove":
					angular.element(
						document.querySelector("#remove")
					).append("<div class='hand'></div>");
					break;

				case "clues-1-2":
					angular.element(
						document.querySelector("#var_0_3__P3x0")
					).append("<div class='hand'></div>");
					break;

				case "organize":
					angular.element(
						document.querySelector("#clue_middle-var_0_3")
					).append("<div class='hand'></div>");
					break;

				case "filter":
				case "organize-AB":
					angular.element(
						document.querySelector("#switch-clues")
					).append("<div class='hand'></div>");
					break;

				case "filter-select":
					angular.element(
						document.querySelector("#var_0_0__P0x0")
					).append("<div class='hand'></div>");
					angular.element(
						document.querySelector("#var_0_3__P1x0")
					).append("<div class='hand'></div>");
					break;

				case "try-mode":
					angular.element(
						document.querySelector("#try-mode")
					).append("<div class='hand'></div>");
					break;

				case "try-select":
					angular.element(
						document.querySelector("#var_1_1__P0x1")
					).append("<div class='hand'></div>");

					angular.element(
						document.querySelector("#var_1_1__P1x1")
					).append("<div class='hand'></div>");

					angular.element(
						document.querySelector("#var_0_3__P1x0")
					).append("<div class='hand'></div>");

					angular.element(
						document.querySelector("#var_0_3__P2x0")
					).append("<div class='hand'></div>");
					break;

				case "try-remove-select":
					angular.element(
						document.querySelector("#var_1_1__P2x1")
					).append("<div class='hand'></div>");
					break;

				case "try-remove-select-1":
					angular.element(
						document.querySelector("#var_1_1__P3x1")
					).append("<div class='hand'></div>");
					break;
			}
		}
	};

}]);
