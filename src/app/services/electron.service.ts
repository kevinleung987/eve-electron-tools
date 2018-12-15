import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame, remote } from 'electron';
import * as fs from 'fs';

@Injectable({ providedIn: 'root' })
export class ElectronService {
  // Whether running under Electron or Browser
  isElectron: boolean;

  // Electron
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  // NodeJS
  fs: typeof fs;

  constructor() {
    this.isElectron = window && window.process && window.process.type;

    if (this.isElectron) {
      // Setup Electron variables
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;
      // Setup NodeJS variables
      this.fs = this.remote.require('fs');
    }
  }
}
