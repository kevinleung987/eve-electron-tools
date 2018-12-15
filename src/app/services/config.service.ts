import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  constructor(private electron: ElectronService) {
    console.log('Config Service initialized');
    console.log(this.electron.remote.app.getPath('userData'));
  }
}
