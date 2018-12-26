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

  private configPath: string;
  private config: ConfigFile;
  debug: boolean;

  constructor(private electron: ElectronService) {
    if (this.electron.isElectron) {
      const configFileName = environment.configFileName;
      this.configPath = this.electron.path.join(this.electron.remote.app.getPath('userData'), configFileName);
      console.log('Config path:', this.configPath);
    }
    this.readSettingsFile();
  }

  /**
   * Read config from file on disk or from browser localStorage
   */
  readSettingsFile() {
    if (this.electron.isElectron) {
      if (this.electron.fs.existsSync(this.configPath)) { // Pre-existing config file
        this.config = JSON.parse(this.electron.fs.readFileSync(this.configPath).toString());
      } else { // Config file does not exist
        this.setConfig(JSON.stringify(new ConfigFile()));
      }
      this.electron.updateView('Read Config File.');
    } else { // Browser app uses localStorage API
      if (localStorage.getItem('config') == null) { // Config not found in localStorage
        console.log('Generating new config');
        this.setConfig(JSON.stringify(new ConfigFile()));
      }
      this.config = JSON.parse(localStorage.getItem('config'));
    }
    // Ensure that config schema is consistent
    this.loadDefaults();
    console.log('Config initialized', this.config);
  }

  /**
   * Write config to file on disk or to browser localStorage
   */
  writeSettingsFile() {
    if (this.electron.isElectron) {
      this.electron.fs.writeFileSync(this.configPath, JSON.stringify(this.config));
      this.electron.updateView('Write Config File.');
    } else {
      localStorage.setItem('config', JSON.stringify(this.config));
    }
  }

  /**
   * Ensure that the config matches the ConfigFile schema.
   */
  loadDefaults(): boolean {
    let changesMade = false;
    const tempConfig = new ConfigFile();
    // Add missing keys
    Object.keys(tempConfig).forEach(key => {
      if (this.config[key] == null) {
        console.log('Missing key:', key);
        this.config[key] = tempConfig[key];
        changesMade = true;
      }
    });
    // Delete extra keys
    Object.keys(this.config).forEach(key => {
      if (tempConfig[key] == null) {
        console.log('Extra key:', key);
        delete this.config[key];
        changesMade = true;
      }
    });
    if (changesMade) { this.writeSettingsFile(); }
    return changesMade;
  }

  get(key: string) {
    console.log('GET:', key, this.config[key]);
    return this.config[key];
  }

  set(key: string, value: any) {
    console.log(`SET:, KEY - ${key}, OLD VALUE - ${this.config[key]}, NEW VALUE - ${value}`);
    this.config[key] = value;
    this.writeSettingsFile();
  }

  getConfig() {
    return JSON.stringify(this.config);
  }

  setConfig(config: string) {
    const tempConfig = JSON.parse(config);
    this.config = tempConfig;
    // Fix extra or missing config keys
    if (!this.loadDefaults()) {
      this.writeSettingsFile();
    }
    console.log('SET CONFIG:', this.config);
  }

  /**
   * Return the value associated with the given key in the config.
   * Returns the given defaultValue if the key is not set in the config.
   * @param key Key to lookup.
   * @param defaultValue Value to return if the key is not set.
   */
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
