var zebra = require("../zebra.js");

zebra.factory("db", ["$http", "$q", "$ionicPlatform", function (
	$http,
	$q,
	$ionicPlatform
) {
	"use strict";

	var db;

	function getDB () {
		return $q(function (resolve) {
			if (db) {
				resolve(db);
			}
			else {
				$ionicPlatform.ready(function () {
					db = window.openDatabase(
						"consistency",
						"1.0",
						"Consistency Game Data",
						1000000
					);

					resolve(db);
				});
			}
		});
	}

	function run (stmts) {
		return getDB().then(function (db) {
			return $q(function (resolve, reject) {
				db.transaction(function (tx) {
					var index = 0;
					function runS () {
						if (index < stmts.length) {
							var s = stmts[index];
							index++;
							tx.executeSql(s, [], runS);
						}
						else {
							resolve(db);
						}
					}

					runS();

				}, function (e) {
					console.log(e);
					alert(e.message);
					reject(e);
				});
			});
		});
	}

	function exec (stmt) {
		return getDB().then(function (db) {
			return $q(function (resolve, reject) {
				db.transaction(function (tx) {
					tx.executeSql(stmt, [], function (tx, res) {
						var result = [];
						for (var i=0; i<res.rows.length; i++) {
							result.push(res.rows.item(i));
						}

						resolve(result);
					});
				}, function (e) {
					console.log(e);
					alert(e.message);
					reject(e);
				});
			});
		});
	}

	return {
		run: run,
		exec: exec
	};

}]);
