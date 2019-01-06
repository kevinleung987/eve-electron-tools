import { Injectable } from '@angular/core';
import { ipcRenderer, remote, shell, webFrame } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ElectronService {
  // Whether running under Electron or Browser
  isElectron: boolean;
  updateOccured: Subject<any>;
  // Electron APIs
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  shell: typeof shell;
  // NodeJS APIs
  fs: typeof fs;
  path: typeof path;

  constructor() {
    this.isElectron = Boolean(window && window.process && window.process.type);
    this.updateOccured = new Subject();
    if (this.isElectron) {
      // Setup Electron APIs
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;
      this.shell = window.require('electron').shell;
      // Setup NodeJS APIs
      this.fs = window.require('fs');
      this.path = window.require('path');
      this.remote.getCurrentWindow().once('focus', () => this.remote.getCurrentWindow().flashFrame(false));
    }
  }

  /**
   * Broadcasts that an update has occured in the Electron Main process
   * which requires a view update from Angular.
   */
  updateView(reason: string = null) {
    this.updateOccured.next(reason);
  }

  openUrl(url: string) {
    if (this.isElectron) {
      this.shell.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  }

  flashFrame() {
    this.remote.getCurrentWindow().flashFrame(true);
  }
}
