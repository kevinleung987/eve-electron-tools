# EVE Electron Tools

Open-source, back-end-optional, desktop alternative for popular community tools for EVE Online. Built using ElectronJS, Angular, and Bootstrap.


![](preview.jpg?raw=true)
## About
Why is EVE Electron Tools...
- **Open-Source:** This application is free and open-source to allow you to be independent of any third-party, so you don't unknowingly feed your data to an enigmatic server.
- **Back-end Optional:** EVE Electron Tools does not require a hosted back-end service to use most of it's functionality. Some features, like sharing D-Scans, will require the presence of a back-end server(To be developed in the future). This means you can operate the tools independent of any server and not every user or group requires the extra functionality that the back-end will provide.
- **Desktop Application:** By bundling this toolkit targetting multiple platforms, anyone can use the application freely without having to host or serve a web-app from a server somewhere. However, most features will be available when served as a web-page, but some planned features like a UI profile manager will require the use of some Electron APIs.
## Usage
- When this toolkit is in a release-ready state, you will be able to find it under the Releases tab.
## Development
- Install dependencies by running `npm install`.
- Install Angular CLI & Electron with `npm install -g @angular/cli electron`
- Serve the application in the browser with `npm run start` or under Electron with `npm run electron`. I'm still playing around with the build-process but that can be found under `npm run electron-build`
## Back-end Service
Development is planned for a back-end service inside the same repo that will add extra functionality to the toolkit, as well as boost performance through caching API calls.
## Note about data-source dependencies
EVE data dumps (Static Data Exports or SDEs) are used to reduce the number of API calls needed for the operation of various tools. These provide static game data like item names but sometimes need updating after a game patch. A tool can be found under `updateData.py` which will take the latest Static Data Exports, prune excess columns, and place the output .csv files into a folder `downloads`

License
----
MIT
