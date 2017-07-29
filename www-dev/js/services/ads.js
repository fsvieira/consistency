var zebra = require("../zebra.js");

zebra.factory("ads", [
	"$q", "config",
function (
	$q, config
) {
	"use strict";

	var ads;
	var categories;
	var initOk = false;
	var cacheTimeout = 0;
	var adsIndex = 0;

	function saveCategories () {
		localStorage.setItem(
			"consistency@categories",
			JSON.stringify(categories)
		);
	}

	function loadCategories () {
		categories = localStorage.getItem("consistency@categories");
		if (categories) {
			categories = JSON.parse(categories);
		}
		else {
			categories = {
				"Action": {show: 0, clicks: 0},
				"Adventure": {show: 0, clicks: 0},
				"Arcade": {show: 0, clicks: 0},
				"Arcade & Action": {show: 0, clicks: 0},
				"Board": {show: 0, clicks: 0},
				"Books & Reference": {show: 0, clicks: 0},
				"Brain & Puzzle": {show: 0, clicks: 0},
				"Business": {show: 0, clicks: 0},
				"Card": {show: 0, clicks: 0},
				"Cards & Casino": {show: 0, clicks: 0},
				"Casino": {show: 0, clicks: 0},
				"Casual": {show: 0, clicks: 0},
				"Comics": {show: 0, clicks: 0},
				"Communications": {show: 0, clicks: 0},
				"Education": {show: 0, clicks: 0},
				"Educational": {show: 0, clicks: 0},
				"Entertainment": {show: 0, clicks: 0},
				"Family": {show: 0, clicks: 0},
				"Finance": {show: 0, clicks: 0},
				"Health & Fitness": {show: 0, clicks: 0},
				"Libraries & Demo": {show: 0, clicks: 0},
				"Lifestyle": {show: 0, clicks: 0},
				"Live Wallpaper": {show: 0, clicks: 0},
				"Media & Video": {show: 0, clicks: 0},
				"Medical": {show: 0, clicks: 0},
				"Music": {show: 0, clicks: 0},
				"Music & Audio": {show: 0, clicks: 0},
				"News & Magazines": {show: 0, clicks: 0},
				"Personalization": {show: 0, clicks: 0},
				"Photography": {show: 0, clicks: 0},
				"Productivity": {show: 0, clicks: 0},
				"Puzzle": {show: 0, clicks: 0},
				"Racing": {show: 0, clicks: 0},
				"Role Playing": {show: 0, clicks: 0},
				"Shopping": {show: 0, clicks: 0},
				"Simulation": {show: 0, clicks: 0},
				"Social": {show: 0, clicks: 0},
				"Sports": {show: 0, clicks: 0},
				"Sports Games": {show: 0, clicks: 0},
				"Strategy": {show: 0, clicks: 0},
				"Tools": {show: 0, clicks: 0},
				"Travel & Local": {show: 0, clicks: 0},
				"Trivia": {show: 0, clicks: 0},
				"Weather": {show: 0, clicks: 0},
				"Word": {show: 0, clicks: 0}
			};

			saveCategories();
		}
	}

	loadCategories();

	function init () {
		return $q(function (resolve, reject) {
			if (window.appnext) {
				if (!initOk) {
					window.appnext.init(
						config.appnext.id,

						function () {
							initOk = true;
							resolve();
						},
						reject
					);
				}
				else {
					resolve();
				}
			}
			else {
				reject("NOT READY INIT");
			}
		});
	}

	function updateCategoriesShow (ad) {
		var cats = ad.categories.split(",");

		cats.forEach(function (a) {
			var cat = categories[a.trim()] || {show: 0, clicks: 0};
			cat.show++;
			categories[a.trim()] = cat;
		});

		saveCategories();
	}

	function updateCategoriesClick (ad) {
		var cats = ad.categories.split(",");

		cats.forEach(function (a) {
			var cat = categories[a.trim()] || {show: 0, clicks: 0};
			cat.clicks++;
			categories[a.trim()] = cat;
		});

		saveCategories();
	}

	function getCategories () {
		var cats = [];
		var catStr = "";
		var catClicks = [];
		var catShow = [];
		var i;

		for (var name in categories) {
			if (categories.hasOwnProperty(name)) {
				var cat = categories[name];
				cat.name = name;
				cats.push(cat);

				if (cat.clicks > 0) {
					catClicks.push(cat);
				}
				else if (cat.show > 0) {
					catShow.push(cat);
				}
			}
		}

		if (catClicks.length > 0) {
			catClicks.sort(function (a, b) {
				var ar = a.show / a.clicks;
				var br = b.show / b.clicks;

				return ar < br;
			});

			// choose 3 top clicked categories,
			for (i=0; i<3 && i < catClicks.length; i++) {

				if (catStr !== "") {
					catStr += ",";
				}

				catStr += catClicks[i].name;
			}
		}

		if (catShow.length > 0) {
			// choose 2 less show cats
			catShow.sort(function (a, b) {
				return b.show < a.show;
			});

			for (i=0; i<2 && i < catShow.length; i++) {

				if (catStr !== "") {
					catStr += ",";
				}

				catStr += catShow[i].name;
			}
		}

		// Choose one random category from all cats.
		if (catStr !== "") {
			catStr += ",";
		}

		catStr += cats[Math.floor(Math.random()*100%cats.length)].name;

		return catStr;
	}

	function getAds () {
		return $q(function (resolve, reject) {
			if (ads && cacheTimeout < new Date().getTime()) {
				resolve(ads);
			}
			else {
				init().then(
					function () {
						window.appnext.loadAds(
							getCategories(),
							function (res) {
								adsIndex = 0;
								cacheTimeout = new Date().getTime() +
									1000 * 60 * 5;

								res.sort(function (a, b) {
									return b.revenueRate - a.revenueRate;
								});

								ads = res;
								resolve(ads);
							},
							function (err) {
								setTimeout(getAds, 3000); // retry in 3 seconds
								reject(err);
							}
						);
					},
					function (err) {
						setTimeout(getAds, 3000); // retry in 3 seconds
						reject(err);
					}
				);
			}
		});
	}

	function openAd (ad) {
		window.appnext.openAd(ad.id, function () {
			updateCategoriesClick(ad);
		}, function (err) {
			console.log(err);
		});
	}

	function getAd () {
		return getAds().then(function (ads) {

			if (ads.length) {
				adsIndex = adsIndex % ads.length;
				var badchoiceAd = ads[adsIndex];

				adsIndex = (adsIndex + 1) % ads.length;
				var restartAd = ads[adsIndex];

				adsIndex = (adsIndex + 1) % ads.length;
				var winAd = ads[adsIndex];

				adsIndex = (adsIndex + 1) % ads.length;

				updateCategoriesShow(winAd);
				updateCategoriesShow(restartAd);
				updateCategoriesShow(badchoiceAd);

				return {
					winAd: winAd,
					restartAd: restartAd,
					badchoiceAd: badchoiceAd
				};
			}

			return $q.reject("no ads");
		});
	}

	return {
		getAd: getAd,
		openAd: openAd
	};
}]);

