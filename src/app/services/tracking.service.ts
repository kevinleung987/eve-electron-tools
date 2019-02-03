import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  analytics = null;
  path = '/';
  clientID: string;
  constructor() {

  }
}
