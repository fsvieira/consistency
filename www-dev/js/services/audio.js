var zebra = require("../zebra.js");

zebra.factory("audio", [
	"$q", "$ionicPlatform", "$interval", function (
	$q,
	$ionicPlatform,
	$interval
) {
	"use strict";

	var audio;
	function driver () {
		return $q(function (resolve) {
			if (audio === undefined) {
				$ionicPlatform.ready(function () {
					if (window.cordova) {
						audio = {audio: Media, path: "/android_asset/www/res/"};
						resolve(audio);
					}
					else {
						audio = {audio: Audio, path: "res/"};
						resolve(audio);
					}
				});
			}
			else {
				resolve(audio);
			}
		});
	}

	function Sound (sound) {
		var stop;

		this.play = function () {
			sound.play();

			if (window.cordova && sound.loop) {
				stop = $interval(function () {
					sound.getCurrentPosition(
						// success callback
						function (position) {
							if (position < 0) {
								sound.stop();
								sound.play();
							}
						},
						// error callback
						function () {}
					);
				}, 1000);
			}
		};

		this.pause = function () {
			if (stop) {
				$interval.cancel(stop);
				stop = undefined;
			}

			sound.pause();
		};

		this.loop = function (loop) {
			sound.loop = loop;
		};
	}

	var cache = {};
	function open (path) {
		return driver().then(function (audio) {
			var sound = cache[path];
			if (!sound) {
				sound = new Sound(new audio.audio(audio.path + path));
				cache[path] = sound;
			}

			return sound;
		});
	}

	var alias = {};
	function load (name, path) {
		return open(path).then(function (sound) {
			alias[name] = sound;
			return sound;
		});
	}

	function play (name) {
		if (alias[name]) {
			alias[name].play();
		}
	}

	return {
		open: open,
		load: load,
		play: play
	};
}]);
