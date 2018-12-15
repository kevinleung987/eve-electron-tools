import { Injectable } from '@angular/core';
import { ElectronService as ngxElectronService } from 'ngx-electron';
import { remote, fs } from 'electron';

@Injectable({ providedIn: 'root' })
export class ElectronService {
  isElectron: boolean;
  fs: typeof fs;
  constructor(private ngxElectron: ngxElectronService) {
    this.isElectron = this.ngxElectron.isElectronApp;
    if (this.isElectron) {
      this.fs = this.ngxElectron.remote.require('fs');
      fs.readFile('F:/dev/eve-electron-tools/README.md', 'utf8', (err, data) => {
        console.log(data);
      });
    }
  }
}
