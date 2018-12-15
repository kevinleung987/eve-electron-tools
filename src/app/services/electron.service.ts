import { Injectable } from '@angular/core';
import { ipcRenderer, remote, webFrame } from 'electron';
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
  // NodeJS APIs
  fs: typeof fs;
  path: typeof path;

  constructor() {
    this.isElectron = window && window.process && window.process.type;
    this.updateOccured = new Subject();
    if (this.isElectron) {
      // Setup Electron APIs
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;
      // Setup NodeJS APIs
      this.fs = window.require('fs');
      this.path = window.require('path');
    }
  }

  /**
   * Broadcasts that an update has occured in the Electron Main process
   * and that Angular needs to update the view. This is necessary because any
   * changes in state that occur outside of Angular's zone do not automatically
   * trigger an update.
   */
  updateView(reason: string = null) {
    this.updateOccured.next(reason);
  }
}
