var zebra = require("../zebra.js");
var ed = require("../libs/ed.js");
// var bz2 = require("../libs/bzip2.js");

var serverPass = "^NUz8v_yK^^KME=";

function generatePassword () {
	"use strict";

	var password = "";
	var availableSymbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqr" +
								"stuvwxyz0987654321*{}[]()/&%$#^~*+";
	for (var i = 0; i < 128; i++) {
		var symbol = availableSymbols[
			Math.floor(Math.random()*availableSymbols.length)
		];

		password += symbol;
	}

	return password;
}

var rules = [
	"immediately to the left of",
	"middle",
	"same position as",
    "next to"
    // leave item out,
];

var vars = [];
for (var x=0; x<6; x++) {
	for (var y=0; y<6; y++) {
		vars.push("var_"+y+"_"+x);
	}
}

// destructive function,
function getSolution (solution) {
	"use strict";
	solution.forEach(function (row) {
		row.forEach(function (item, x) {
			row[x] = vars[item];
		});
	});

	return solution;
}

function getClues (clues) {
	"use strict";
	var c = [];

	rules.forEach(function (type, index) {
		if (clues[index]) {
			clues[index].forEach(function (clue) {
				var s = {
					type: type,
					a: {v: vars[clue[0][0]], y: clue[0][1]}
				};

				if (clue.length === 2) {
					s.b = {v: vars[clue[1][0]], y: clue[1][1]};
				}

				c.push(s);
			});
		}
	});

	return c;
}

zebra.factory("packs", [
	"$http", "$q", "$ionicPlatform", "db", "videoads",
function (
	$http,
	$q,
	$ionicPlatform,
	db
) {
	"use strict";
	// localStorage.removeItem("s");
	var s = localStorage.getItem("s");
	var data = {total: 0};

	function open (url) {
		return $http({
			url: url,
			method: "GET",
			transformResponse: [function (data) {
				return data;
			}]
		}).then(function (data) {
			return JSON.parse(
				ed.d(
					serverPass,
					data.data
				)
			);
		}, function (err) {
			return err;
		});
	}

	function addPack (pack) {
		var status = "unlocked";
		var unlock = "null";
		var sql = [];

		sql.push("INSERT OR REPLACE INTO packs (id,name,status,completed," +
				"total, unlock) VALUES (" +
				pack.id + "," +
				"'" + pack.name + "'," +
				"'" + status + "'," +
				"0," +
				pack.total + "," +
				unlock +
			");");

		pack.grids.forEach(function (grid, index) {
			sql.push("INSERT OR REPLACE INTO grids(packId, w, h, completed," +
					" total, pos) " +
					"VALUES (" +
						pack.id + "," +
						grid.w + "," +
						grid.h + "," +
						"0," +
						grid.total + "," +
						index +
					");"
			);

			// setup puzzles,
			var gIndex = index;
			grid.puzzles.forEach(function (puzzle, index) {
				var status = "unlocked";
				var unlock = 0;

				sql.push("INSERT OR REPLACE INTO puzzles(" +
						"packId,gridPos,status," +
						"completed,data, pos) VALUES (" +
							pack.id + "," +
							gIndex + "," +
							"'" + status + "'," +
							"0," +
							"'" + ed.e(
								s,
								JSON.stringify({
									data: puzzle,
									unlock: unlock,
									info: {
										id: pack.id,
										gid: gIndex,
										pos: index
									}
								})
							) + "'," +
							index +
						");"
				);
			});
		});

		return db.run(sql);
	}

	function countPacks () {
		db.exec("SELECT count(id) as cnt FROM packs;").then(
			function (col) {
				if (col.length === 1) {
					data.total = col[0].cnt;
				}
				else {
					data.total = 0;
				}
			}
		);
	}

	function getFile (path) {
		var url = "res/packs/" + path;

		if (window.cordova) {
			url = "/android_asset/www/" + url;
		}

		return open(url).then(
			addPack
		);
	}

	if (!s) {
		s = generatePassword();
		localStorage.setItem("s", s);
	}

	db.run(
		[
			/*"DROP TABLE packs;",
			"DROP TABLE grids;",
			"DROP TABLE puzzles;",*/
			"CREATE TABLE IF NOT EXISTS packs (" +
					"id integer primary key," +
					"name text," +
					"status text," +
					"completed integer," +
					"total integer, " +
					"unlock text" +
				");",
			"CREATE TABLE IF NOT EXISTS grids (" +
					"packId integer," +
					"pos integer," +
					"w integer," +
					"h integer," +
					"completed integer," +
					"total integer," +
					"FOREIGN KEY (packId) REFERENCES packs(id), " +
					"PRIMARY KEY (packId, pos)" +
				");",
			"CREATE TABLE IF NOT EXISTS puzzles (" +
					"packId integer," +
					"gridPos integer," +
					"pos integer," +
					"status text," +
					"completed integer," + // Save as %
					"progress text," +
					"time integer," +
					"data text," +
					"FOREIGN KEY(packId) REFERENCES packs(id)," +
					"FOREIGN KEY(gridPos) REFERENCES grids(pos), " +
					"PRIMARY KEY (packId, gridPos, pos)" +
				");"
		]
	)
	.then(function () { return getFile("pack_0.json"); })
	.then(function () { return getFile("pack_1.json"); })
	.then(function () { return getFile("pack_2.json"); })
	.then(function () { return getFile("pack_3.json"); })
	.then(function () { return getFile("pack_4.json"); })
	.then(function () { return getFile("pack_5.json"); })
	.then(function () { return getFile("pack_6.json"); })
	.then(countPacks);

	/* Public Packs Service functions, */

	// Get packs with paging support,
	function getPacks (a, b) {
		return db.exec("SELECT * FROM packs " +
				"WHERE id >= " + a + " AND id <= " + b + " order by id asc;"
		);
	}

	function getPack (packIndex) {
		return db.exec("SELECT * FROM packs WHERE " +
			" id = " + packIndex + ";"
		).then(
			function (cols) {
				var pack = cols[0];
				return db.exec("SELECT * FROM grids WHERE packId = " +
					pack.id + " order by pos asc;"
				).then(
					function (grids) {
						pack.grids = grids;
						return pack;
					}
				);
			}
		);
	}

	// TODO: change packIndex -> packId, gridIndex -> gridId, on all.
	function getDBPuzzles (packIndex, gridIndex) {
		return db.exec("SELECT * FROM packs WHERE " +
			" id = " + packIndex + ";"
		).then(
			function (cols) {
				var pack = cols[0];
				return db.exec("SELECT * FROM grids WHERE packId=" +
					packIndex + " AND pos=" + gridIndex + ";"
				).then(
					function (cols) {
						var grid = cols[0];
						pack.grid = grid;

						return db.exec(
							"SELECT packId, gridPos, pos,"+
							" status, completed, time " +
							" FROM puzzles WHERE packId=" + packIndex +
							" AND gridPos = " + gridIndex +
							" order by pos asc;"
						).then(
							function (puzzles) {
								grid.puzzles = puzzles;
								return pack;
							}
						);
					}
				);
			}
		);
	}

	function getPuzzles (packIndex, gridIndex) {
		if (gridIndex < 0) {
			var url = "res/tutorial/pack_start.json";

			if (window.cordova) {
				url = "/android_asset/www/" + url;
			}

			return $http.get(url).then(function (data) {
				return data.data;
			});
		}
		else {
			return getDBPuzzles(packIndex, gridIndex);
		}
	}

	function getDBPuzzle (packIndex, gridIndex, puzzleIndex) {
		return db.exec("SELECT * FROM packs WHERE " +
			" id = " + packIndex + ";"
		).then(
			function (cols) {
				var pack = cols[0];
				return db.exec("SELECT * FROM grids WHERE packId=" +
					packIndex + " AND pos=" + gridIndex + ";"
				).then(
					function (cols) {
						var grid = cols[0];
						pack.grid = grid;

						return db.exec(
							"SELECT * FROM puzzles WHERE " +
							" packId=" + packIndex +
							" AND gridPos = " + gridIndex +
							" AND pos = "+ puzzleIndex
						).then(
							function (puzzleInfo) {
								var puzzle = JSON.parse(
									ed.d(s, puzzleInfo[0].data)
								);

								if (
									puzzle.info.id !== +packIndex ||
									puzzle.info.gid !== +gridIndex ||
									puzzle.info.pos !== +puzzleIndex
								) {
									return $q.reject("BAD_PUZZLE");
								}
								else {
									var p = {
										grid: {
											w: puzzle.data[0][0],
											h: puzzle.data[0][1]
										}
									};

									p.completed = puzzleInfo[0].completed;
									p.solution = getSolution(puzzle.data[1]);
									p.clues = getClues(puzzle.data[2]);

									if (puzzleInfo[0].progress) {
										p.progress = JSON.parse(
											puzzleInfo[0].progress
										);
									}

									grid.puzzle = p;

									return pack;
								}
							}
						);
					}
				);
			}
		);
	}

	function getPuzzle (packIndex, gridIndex, puzzleIndex) {
		if (gridIndex < 0) {
			return getPuzzles(packIndex, gridIndex).then(
				function (pack) {
					pack.grid.puzzle = pack.grid.puzzles[puzzleIndex];
					pack.grid.puzzle.grid = pack.grid;
					return pack;
				}
			);
		}
		else {
			return getDBPuzzle(packIndex, gridIndex, puzzleIndex);
		}
	}

	function savePuzzleProgress (
		packIndex,
		gridIndex,
		puzzleIndex,
		completed,
		progress
	) {
		var stmts = [];

		stmts.push("UPDATE puzzles " +
			"SET completed="+completed +
			", progress = " + (
				completed===100?
				"null":
				"'" + JSON.stringify(progress) + "'"
			) +
			" WHERE "+
			" packId=" + packIndex +
			" AND gridPos = " + gridIndex +
			" AND pos = "+ puzzleIndex
		);

		if (completed === 100) {
			stmts.push(
				"UPDATE packs SET " +
				"completed = (SELECT count(*) FROM puzzles WHERE packId=" +
				packIndex + " AND completed=100)" +
				" WHERE id="+packIndex+";"
			);

			stmts.push(
				"UPDATE grids SET " +
				"completed = (SELECT count(*) FROM puzzles WHERE packId=" +
				packIndex + " AND gridPos="+gridIndex+" AND completed=100)" +
				" WHERE packId="+packIndex+" AND pos="+gridIndex+";"
			);
		}

		return db.run(stmts);
	}

	return {
		data: data,
		getPacks: getPacks,
		getPack: getPack,
		getPuzzles: getPuzzles,
		getPuzzle: getPuzzle,
		savePuzzleProgress: savePuzzleProgress
	};

}]);
