var zebra = require("../zebra.js");

zebra.controller("MainCtrl", [
	"$scope", "$ionicModal", "audio",
	"$ionicLoading", "$ionicPopup", "$window", "$ionicPlatform",
function (
	$scope,
	$ionicModal,
	audio,
	$ionicLoading,
	$ionicPopup,
	$window,
	$ionicPlatform
) {
	"use strict";

	if (window.cordova) {
		$scope.showRateIt = true;
	}

	$scope.getColor = function (perc) {
		var r = 52 - 51;
		var g = 135 - 51;
		var b = 129 - 51;
		r = Math.ceil(51 + r*perc);
		g = Math.ceil(51 + g*perc);
		b = Math.ceil(51 + b*perc);

		return "rgb("+r+","+g+","+b+")";
	};

	$scope.getColor2 = function (perc) {
		var r = 127;
		var d = Math.PI*2*perc;
		var x = Math.floor(128 + Math.cos(d)*r);
		var y = Math.floor(128 + Math.sin(d)*r);
		var z = Math.floor(perc*255);

		return "rgb("+x+","+y+","+z+")";
	};

	$scope.getWindowSize = function () {
		return {
			"h": $window.innerHeight,
			"w": $window.innerWidth
		};
	};

	angular.element($window).on("resize", function () {
		$scope.$apply();
	});

	$scope.rateIt = function () {
		cordova.plugins.market.open("com.fsvieira.consistency");
	};

	$scope.showVideoError = function (/* err */) {
		$ionicPopup.alert({
			title: "Video Error",
			template:
			"There was an unexpected error, " +
			"please check your connection and try again."
		}).then(function () {});
	};

	$scope.loadingStart = function () {
		$ionicLoading.show({
			templateUrl: "templates/loading.html"
		});
	};

	$scope.loadingEnd = function () {
		$ionicLoading.hide();
	};

	if (!localStorage.getItem("settings")) {
		localStorage.setItem(
			"settings",
			JSON.stringify({
				music: true,
				sounds: true,
				badchoice: true
			})
		);
	}

	var settings = JSON.parse(localStorage.getItem("settings"));

	$scope.settings = settings;

	// Settings stuff,
	$ionicModal.fromTemplateUrl("templates/settings.html", {
		scope: $scope,
		animation: "slide-in-up"
	}).then(function (modal) {
		$scope.settingsModal = modal;
	});

	$scope.openSettings = function () {
		$scope.settingsModal.show();
	};

	$scope.closeSettings = function () {
		$scope.settingsModal.hide();
	};

	$scope.saveSettings = function () {
		localStorage.setItem("settings", JSON.stringify(settings));
	};

	$scope.updateMusic = function () {
		if (settings.music) {
			audio.open("music/song18_0.mp3").then(function (sound) {
				sound.loop(true);
				sound.play();
			});
		}
		else {
			audio.open("music/song18_0.mp3").then(function (sound) {
				sound.pause();
			});
		}

		$scope.saveSettings();
	};

	document.addEventListener("pause", function () {
		if (settings.music) {
			audio.open("music/song18_0.mp3").then(function (sound) {
				sound.pause();
			});
		}
	}, false);

	document.addEventListener("resume", function () {
		if (settings.music) {
			audio.open("music/song18_0.mp3").then(function (sound) {
				sound.loop(true);
				sound.play();
			});
		}
	}, false);

	$ionicPlatform.ready(function () {
		$scope.updateMusic();
	});
}]);
