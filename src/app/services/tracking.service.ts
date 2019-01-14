import { Injectable } from '@angular/core';
import Analytics from 'electron-google-analytics';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  analytics = new Analytics(environment.tracking, { debug: environment.production, version: environment.version });
  path = '/';
  clientID: string;
  constructor() {
    this.analytics.pageview('EVE Electron Tools', this.path, 'Page View', undefined)
      .then((response) => {
        this.clientID = response.clientID;
        console.log(this.clientID);
        return response;
      }).catch((err) => {
        return err;
      });
  }
}
