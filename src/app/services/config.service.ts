import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private path: string;
  private config: {};
  public configChanged: Subject<{}>;
  constructor(private electron: ElectronService) {
    this.configChanged = new Subject();
    if (this.electron.isElectron) {
      const settingsFile = environment.settingsFile;
      this.path = this.electron.remote.require('path').join(this.electron.remote.app.getPath('userData'), settingsFile);
      console.log(this.path);
      this.readSettingsFile();
      this.configChanged.next(this.config);
    }
  }

  get(key) {
    console.log('GET:', key, this.config[key]);
    return this.config[key];
  }

  set(key, value) {
    this.config[key] = value;
    this.electron.fs.writeFileSync(this.path, JSON.stringify(this.config));
    console.log('SET:', key, this.config[key]);
    this.configChanged.next(this.config);
  }

  getConfig() {
    return JSON.stringify(this.config);
  }

  setConfig(config) {
    this.config = JSON.parse(config);
    this.electron.fs.writeFileSync(this.path, JSON.stringify(this.config));
    console.log('SET CONFIG:', this.config);
    this.configChanged.next(this.config);
  }

  readSettingsFile() {
    if (this.electron.fs.existsSync(this.path)) {
      this.config = JSON.parse(this.electron.fs.readFileSync(this.path).toString());
    } else {
      this.config = {};
      this.electron.fs.writeFileSync(this.path, JSON.stringify(this.config));
    }
    console.log('Config initialized', this.config);
  }
}
