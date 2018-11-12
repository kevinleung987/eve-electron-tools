import {Injectable, OnInit} from '@angular/core';

@Injectable({providedIn: 'root'})
export class ElectronService implements OnInit {
  public isElectron: boolean;
  constructor() {}
  ngOnInit(): void {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf(' electron/') > -1) {
      this.isElectron = true;
      console.log('In Electron.');
    } else {
      this.isElectron = false;
      console.log('In Browser.');
    }
  }
}
