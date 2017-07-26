module.exports = {
	init: function (placementID, success, error) {
        cordova.exec(
			success,
			error,
            'AppnextPlugin',
            'init',
			[placementID]
		);
	},
	loadAds: function (category, success, error) {
        cordova.exec(
			success,
			error,
            'AppnextPlugin',
            'loadAds',
			[category]
		);
	},
	openAd: function (id, success, error) {
        cordova.exec(
			success,
			error,
            'AppnextPlugin',
            'openAd',
			[id]
		);
	}
};
