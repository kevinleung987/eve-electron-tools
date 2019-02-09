import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  clientID: string;
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        (<any>window).gtag('config', environment.tracking, {
          'page_title': event.urlAfterRedirects.substring(1, event.urlAfterRedirects.length),
          'page_path': event.urlAfterRedirects
        });
      }
    });
  }
}
