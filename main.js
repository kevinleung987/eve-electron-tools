const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');
// Security warnings from hot-reload
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

function createWindow() {

  const { screen } = require("electron");
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height
  });

  if (serve) { // load from web server
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else { // load the dist folder from Angular
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, `/dist/index.html`),
        protocol: "file:",
        slashes: true
      })
    );
  }

  // The following is optional and will open the DevTools:
  win.webContents.openDevTools()

  win.on("closed", () => {
    win = null;
  });
}
try {
  app.on("ready", createWindow);

  // on macOS, closing the window doesn't quit the app
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  // initialize the app's main window
  app.on("activate", () => {
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  throw e;
}

