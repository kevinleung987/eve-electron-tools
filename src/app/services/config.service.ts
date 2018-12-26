import { Injectable } from '@angular/core';
import { ConfigFile } from 'src/app/models/Config.model';
import { ElectronService } from 'src/app/services/electron.service';
import { environment } from 'src/environments/environment';

/**
 * Manages maintenence of the Config file for EVE-ET, configuration settings
 * are represented as key-value pairs.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private path: string;
  private config: ConfigFile;
  constructor(private electron: ElectronService) {
    if (this.electron.isElectron) {
      const settingsFile = environment.settingsFile;
      this.path = this.electron.path.join(this.electron.remote.app.getPath('userData'), settingsFile);
      console.log('Config path:', this.path);
    }
    this.readSettingsFile();
  }

  readSettingsFile() {
    if (this.electron.isElectron) {
      if (this.electron.fs.existsSync(this.path)) {
        this.config = JSON.parse(this.electron.fs.readFileSync(this.path).toString());
      } else {
        this.config = new ConfigFile();
        this.setConfig(JSON.stringify(this.config));
      }
      this.electron.updateView('Read Config File.');
    } else {
      if (localStorage.getItem('config') == null) {
        console.log('Generating new config');
        this.setConfig(JSON.stringify(new ConfigFile()));
      }
      this.config = JSON.parse(localStorage.getItem('config'));
    }
    console.log('Config initialized', this.config);
  }

  get(key: string) {
    console.log('GET:', key, this.config[key]);
    return this.config[key];
  }

  set(key: string, value: any) {
    console.log(`SET:, Key - ${key}, Old Value - ${this.config[key]}, New Value - ${value}`);
    this.config[key] = value;
    if (this.electron.isElectron) {
      this.electron.fs.writeFileSync(this.path, JSON.stringify(this.config));
      this.electron.updateView('Set config value.');
    } else {
      localStorage.setItem('config', JSON.stringify(this.config));
    }
  }

  getConfig() {
    return JSON.stringify(this.config);
  }

  setConfig(config: string) {
    if (config.length <= 1) {
      config = JSON.stringify(new ConfigFile());
    }
    this.config = JSON.parse(config);
    if (this.electron.isElectron) {
      this.electron.fs.writeFileSync(this.path, JSON.stringify(this.config));
      this.electron.updateView('Overwrite config.');
    } else {
      localStorage.setItem('config', JSON.stringify(this.config));
    }
    console.log('SET CONFIG:', this.config);
  }

  default(key: string, defaultValue: any) {
    let val = this.get(key);
    if (val == null) {
      this.set(key, defaultValue);
      val = this.get(key);
    }
    return val;
  }

  isDemo() {
    return this.config.isDemo;
  }
}
