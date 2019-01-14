# EVE Electron Tools

Electron-powered toolset for [EVE Online](https://www.eveonline.com/). Built using Electron, Angular, and Bootstrap. The latest version of the code can always be found in the Browser build [here](https://eve-electron.kevinleung.net). Releases for the Desktop build can be found [here](https://github.com/kevinleung987/eve-electron-tools/releases).

## About

**EVE Electron Tools** is...
- **Open-Source:** This application is free and open-source. Many of the popular community tools used by the EVE Online community are not open-source and some have rumored to log input and collect data. The desktop-only features in EVE-ET are explicitly meant to provide an open-source and transparent alternative to the closed-source desktop applications that are popularly used by EVE players.
- **Stand-alone/Server-less:** Most community tools for EVE Online are served as a web-page, but what happens if the owner decides to stop supporting the application? The inspiration for this project was one such tool that no longer works because the application was closed-source and the author stopped paying server fees. EVE-NT is delivered as a stand-alone, server-less, cross-platform desktop application, but it can also be served as a web-page with reduced functionality.
- **Electron-Powered:** Electron enables EVE-ET to feature an elegant web UI while also leveraging powerful NodeJS APIs that enable it to be a fully featured desktop application.
## Previews
Market Browser             |  Local Scan
:-------------------------:|:-------------------------:
![](preview-market.gif?raw=true)  |  ![](preview-scan.gif?raw=true)

## Features
Some features require Electron and so are only available in the Desktop build.
- **Parsing Tools(Local Scan/D-Scan):** Copy from the Local window or D-Scan and paste it into the parser to get a composition breakdown. Works exactly like other EVE parsing tools except all requests and processing are made client-side, without a back-end server. Without centralized caching provided by a back-end, parsing is slower, but you keep full control over your data.
- **Market Browser:** Quickly look up prices for items across any region in the game without having to login.
- **Zkill Listener:** Listens for killmails on the zKillboard Live Feed as they come in, you can filter by alliance, corporation, location, ship-type and enable sound notifications.
- **Navigation:** Quick-reference tools to check Jump-Distance, determine which systems are in range, or calculate gate routes with preference settings.
- **Profile Sync(Desktop-Only):** Sync your EVE settings between accounts or characters. Very useful for anyone managing multiple accounts. Backups are made automatically before syncing to ensure your profiles stay safe.
- **VNI Companion(Desktop-Only):** Multiple tools that enable safer and easier Ratting. Watches an Intel channel for activity in systems near you. Alerts for faction and capital spawns. Counts how much ISK you've accumulated during your Ratting session.

## Usage

- The latest Browser build can be found [here](https://eve-electron.kevinleung.net), this always represents the latest version of the codebase, however, it should be treated as more of a preview of the full Desktop Application.
- You can find available releases of the full Desktop Application [here](https://github.com/kevinleung987/eve-electron-tools/releases).

## Development

- Node v10+ required.
- Install dependencies by running `npm install`
- Install Angular CLI & Electron globally with `npm install -g @angular/cli electron`
- Serve the application in the browser with `npm run browser` or under Electron with hot-reloading enabled using `npm start`. The Electron application can be built & bundled by running:
  - `npm run bundle:windows` - for Windows
  - `npm run bundle:linux` - for Linux
  - `npm run bundle:mac` - for MacOS, only works on systems running MacOS

## Tools Used

- **[Angular](https://github.com/angular/angular)** - Front-end framework
- **[Electron](https://github.com/electron/electron)** - Desktop Application framework
- **[Bootstrap Material Design](https://github.com/FezVrasta/bootstrap-material-design)** - Material Design-flavoured Bootstrap
- **[Electron-Builder](https://github.com/electron-userland/electron-builder)** - Cross-platform Electron application builds
- **[Travis](https://travis-ci.com/)** - Build automation & deployment

Other Dependencies:

- **[ngx-papaparse](https://github.com/alberthaff/ngx-papaparse)** - Elegant CSV parsing
- **[ngx-toastr](https://github.com/scttcper/ngx-toastr)** - Toast notifications
- **[match-sorter](https://github.com/kentcdodds/match-sorter)** - String matching to power Suggestions service
- **[chokidar](https://github.com/paulmillr/chokidar)** - Cross-platform NodeJS fs.watch wrapper to simplify watching file changes

## Difference between Desktop & Browser versions

- The Desktop version should be considered the primary version of EVE-ET.
- The Browser version is built with the Electron-dependent tools taken out of the Routing Module, this allows WebPack to treeshake any dependencies like `chokidar` that are desktop-only. Because of this, the Browser version can only be run with AoT compilation where the tree-shaking can take place and prevent a compile error that occurs when trying to bundle desktop NodeJS libraries with the Browser client.

## Note About Data Dependencies

EVE data dumps (Static Data Exports or SDEs) are used to reduce the number of API calls needed for the operation of various tools. These provide static game data like item names but sometimes need updating after a game patch. I've written a tool in Python 3 which can be found under `updateData.py`. The tool will take the latest SDEs, prune excess columns, and place the output .csv files into a folder `downloads`. The update tool requires `pandas` and `requests`.

License
----
MIT
