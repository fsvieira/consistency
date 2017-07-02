var zebra = require("../zebra.js");

zebra.factory("videoads", [
	"$ionicPlatform", "$q", "$timeout", "config",
function ($ionicPlatform, $q, $timeout, config) {
	"use strict";

	var timeout = 10;
	var minute = 1000*60;
	var counter = localStorage.getItem("counter");
	var stopCounter;

	var interstitial;

	if (counter === undefined || counter === null) {
		counter = timeout;
	}

	counter = +counter;

	function setUp () {
		return $q(function (resolve, reject) {
			try {
				if (!interstitial) {
					interstitial = new Appnext.Interstitial(
						config.appnext.id,
						{
							"buttonText": "Install",
							"buttonColor": "#6AB344",
							"skipText": "skip",
							"postback": "posbtack",
							"autoPlay": true,
							"mute": false,
							"creativeType": "managed",
							"preferredOrientation": "automatic"
						}
					);
				}

				resolve(interstitial);
			}
			catch (err) {
				interstitial = undefined;
				reject(err);
				return;
			}
		});
	}

	function countdown () {
		stopCounter = undefined;

		if (counter > 0) {
			stopCounter = $timeout(countdown, minute);
			counter--;
			localStorage.setItem("counter", counter);
		}
	}

	function sawAd () {
		return counter > 0;
	}

	function showAd () {
		return $q(function (resolve, reject) {
			if (counter <= 0) {
				setUp().then(
					function (interstitial) {
						interstitial.setOnAdClosedCallback(
							function () {
								counter = timeout;
								countdown();
								resolve();
							}
						);

						interstitial.setOnAdErrorCallback(reject);

						interstitial.showAd();
					},
					function (err) {
						if (err === "Connection Error") {
							reject("INTERNET_UNAVAILABLE");
						}
						else {
							reject(err);
						}
					}
				);
			}
			else {
				// nothing to show, let player rest a little :P
				resolve();
			}
		});
	}

	$ionicPlatform.ready(function () {
		setUp();
	});

	// start countdown,
	countdown();

	document.addEventListener("resume", function () {
		// restart timeout
		countdown();
	});

	document.addEventListener("pause", function () {
		if (stopCounter) {
			$timeout.cancel(stopCounter);
		}
	});

	return {showAd: showAd, sawAd: sawAd};

}]);
