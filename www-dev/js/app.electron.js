var electron = require("electron");
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var path = require("path");
var url = require("url");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var win;

function createWindow () {
	"use strict";
	// Create the browser window.
	win = new BrowserWindow({
		width: 800,
		height: 600,
		icon: path.join(__dirname, "img/icon.png"),
		title: "Consistency"
	});

	// and load the index.html of the app.
	win.loadURL(url.format({
		pathname: path.join(__dirname, "index.html"),
		protocol: "file:",
		slashes: true
	}));

	win.maximize();
	win.setMenu(null);

	// Open the DevTools.
	// win.webContents.openDevTools()

	// Emitted when the window is closed.
	win.on("closed", function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
	"use strict";
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", function () {
	"use strict";
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
});

