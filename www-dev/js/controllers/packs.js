var zebra = require("../zebra.js");

zebra.controller("PacksCtrl", [
	"$scope", "packs", function (
	$scope,
	packs
) {
	"use strict";
	$scope.loadingStart();
	$scope.pages = [];

	$scope.page = function (p) {
		if ($scope.currentPage !== p) {
			$scope.currentPage = p;
			$scope.loadingStart();
			packs.getPacks(p*10, p*10+10).then(
				function (packs) {
					$scope.packs = packs;
					$scope.loadingEnd();
				},
				function (err) {
					console.log(err);
				}
			);
		}
	};

	$scope.$watch(function () {
		return packs.data.total;
	}, function (total) {
		if (total >= 1) {
			if ($scope.currentPage===undefined) {
				$scope.page(0);
			}

			var pages = Math.floor(total / 10) + 1;

			for (var i=$scope.pages.length; i<pages; i++) {
				$scope.pages[i] = i+1;
			}
		}
	});
}]);
