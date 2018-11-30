# EVE Electron Tools

Back-end-optional, desktop alternative for popular community tools for EVE Online. Built using Electron, Angular, and Bootstrap.


![](preview.jpg?raw=true)

## Features

- **Parsing Tools(Local Scan/D-Scan):** Copy from the Local window or D-Scan and paste it into the parser to get a composition breakdown. Works exactly like the popular D-Scan websites except your results don't get logged by other people.
- **Market Browser:** Quickly look up prices for items without having to login to the game.
- **zKill Listener:** Listens for killmails on the zKillboard Live Feed as they come in, you can filter by alliance, corporation, location, ship-type and enable sound notifications.
- **Profile Syncer:** Sync your EVE settings between accounts or characters with the click of a button. Very useful for anyone managing multiple accounts.
- **VNI Helper:** Multiple tools that enable safer and easier AFK Ratting. Watches Intel channel for mentions of systems close to you. You can also enable alerts for faction and capital spawns.

## About

EVE Electron Tools is...
- **Open-Source:** This application is free and open-source. A lot of the popular community tools for EVE Online aren't open-source and some have been known to log your input.
- **Back-end Optional:** EVE-ET does not require a hosted back-end service to use most of it's functionality. Some features, like sharing D-Scans, will require the presence of a back-end server(To be developed in the future). This means you can operate the tools independent of any server and not every user or group requires the extra functionality that the back-end will provide.
- **A Desktop Application:** By bundling this toolset to target multiple platforms, anyone can use the application freely without having to host or serve a web-app from a server somewhere. The option is available to serve EVE-ET as a web-page with reduced functionality.

## Tools used

- **[Angular](https://github.com/angular/angular)** - Frontend framework
- **[Electron](https://github.com/electron/electron)** - Desktop Application framework
- **[Bootstrap Material Design](https://github.com/FezVrasta/bootstrap-material-design)** - Material Design CSS
- **[Angular-Electron](https://github.com/maximegris/angular-electron)** - Boilerplate to link Angular with Electron


## Usage

- When this application is in a release-ready state, you will be able to find regular releases under the Releases tab.

## Development

- Install dependencies by running `npm install`
- Install Angular CLI & Electron with `npm install -g @angular/cli electron`
- Serve the application in the browser with `npm run start` or under Electron with `npm run electron`. I'm still playing around with the build-process but that can be found under `npm run electron-build`

## Back-end Service

Development is planned for a back-end service inside the same repo that will add extra functionality to the toolkit, as well as boost performance through caching API calls.

## Note about data-source dependencies

EVE data dumps (Static Data Exports or SDEs) are used to reduce the number of API calls needed for the operation of various tools. These provide static game data like item names but sometimes need updating after a game patch. A tool can be found under `updateData.py` which will take the latest Static Data Exports, prune excess columns, and place the output .csv files into a folder `downloads`. The update tool requires `pandas` and `requests`.

License
----
MIT
