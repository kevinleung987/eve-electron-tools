import { ErrorHandler, Injectable } from '@angular/core';
import { AlertService } from './alert.service';

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  constructor(private alert: AlertService) { }

  public handleError(error: any) {
    console.error(error);
    this.alert.error(error);
  }
}
