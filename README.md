# EVE Electron Tools

Electron-powered toolset for [EVE Online](https://www.eveonline.com/). Built using Electron, Angular, and Bootstrap. Check out the latest Browser build [here](https://kevinleung987.github.io/eve-electron-tools/). Releases for the Desktop build can be found [here](https://github.com/kevinleung987/eve-electron-tools/releases)

## About

**EVE Electron Tools** is...
- **Open-Source:** This application is free and open-source. A lot of popular community tools used by the EVE Online community are not open-source and some have even been known to log your input.
- **Electron-Powered:** I found that most community tools for EVE Online are served as a web-page, but what happens if the owner decides to stop paying server fees? EVE-NT comes delivered as a cross-platform desktop application, but it can also be served as a web-page with reduced functionality. Electron exposes several operating system APIs that enable features that aren't possible in the browser-based deployment.

![](preview.jpg?raw=true)

## Features
Some features require Electron and so are only available in the Desktop build.
- **Parsing Tools(Local Scan/D-Scan):** Copy from the Local window or D-Scan and paste it into the parser to get a composition breakdown. Works exactly like the popular D-Scan websites except your results don't get logged by other people.
- **Market Browser:** Quickly look up prices for items without having to login to the game.
- **zKill Listener:** Listens for killmails on the zKillboard Live Feed as they come in, you can filter by alliance, corporation, location, ship-type and enable sound notifications.
- **Profile Sync(Desktop-Only):** Sync your EVE settings between accounts or characters with the click of a button. Very useful for anyone managing multiple accounts.
- **VNI Companion(Desktop-Only):** Multiple tools that enable safer and easier AFK Ratting. Watches Intel channel for mentions of systems close to you. You can also enable alerts for faction and capital spawns.

## Usage

- The latest Browser build can be found [here](https://kevinleung987.github.io/eve-electron-tools/), the Browser version has reduced functionality.
- You can find available releases of the full Desktop Application [here](https://github.com/kevinleung987/eve-electron-tools/releases)

## Development

- Node v10+ required.
- Install dependencies by running `npm install`
- Install Angular CLI & Electron globally with `npm install -g @angular/cli electron`
- Serve the application in the browser with `npm run browser` or under Electron with hot-reloading enabled using `npm start`. The Electron application can be built & bundled by running:
  - `npm run bundle:windows` - for Windows
  - `npm run bundle:mac` - for MacOS
  - `npm run bundle:linux` - for Linux

## Tools Used

- **[Angular](https://github.com/angular/angular)** - Front-end framework
- **[Electron](https://github.com/electron/electron)** - Desktop Application framework
- **[Bootstrap Material Design](https://github.com/FezVrasta/bootstrap-material-design)** - Material Design-flavoured Bootstrap
- **[Electron-Builder](https://github.com/electron-userland/electron-builder)** - Cross-platform Electron builds
- **[Travis](https://travis-ci.com/)** - Build automation
Other Dependencies:
- **[ngx-papaparse](https://github.com/alberthaff/ngx-papaparse)** - Elegant CSV parsing
- **[ngx-toastr](https://github.com/scttcper/ngx-toastr)** - Toast notifications
- **[ng-select](https://github.com/ng-select/ng-select)** - Autocomplete & Multiselect

## Note About Data Dependencies

EVE data dumps (Static Data Exports or SDEs) are used to reduce the number of API calls needed for the operation of various tools. These provide static game data like item names but sometimes need updating after a game patch. I've written a tool in Python 3 which can be found under `updateData.py`. The tool will take the latest SDEs, prune excess columns, and place the output .csv files into a folder `downloads`. The update tool requires `pandas` and `requests`.

License
----
MIT
