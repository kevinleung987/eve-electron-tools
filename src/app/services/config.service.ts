import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  path: string;
  config: {};
  constructor(private electron: ElectronService) {
    if (this.electron.isElectron) {
      console.log('Config Service initialized');
      const settingsFile = environment.settingsFile;
      this.path = this.electron.remote.require('path').join(this.electron.remote.app.getPath('userData'), settingsFile);
      console.log(this.path);
      this.config = this.readSettingsFile();
    }
  }

  get(key) {
    return this.config[key];
  }

  set(key, value) {
    this.config[key] = value;
    this.electron.fs.writeFileSync(this.path, JSON.stringify(this.config));
  }

  readSettingsFile() {
    if (this.electron.fs.existsSync(this.path)) {
      return JSON.parse(this.electron.fs.readFileSync(this.path).toString());
    } else {
      const config = {};
      this.electron.fs.writeFileSync(this.path, JSON.stringify(config));
      return config;
    }
  }
}
