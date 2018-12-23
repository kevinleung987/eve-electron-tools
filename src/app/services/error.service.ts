import { ErrorHandler, Injectable } from '@angular/core';
import { AlertService } from './alert.service';

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  constructor(private alert: AlertService) { }

  public handleError(error: any) {
    this.alert.error(error);
    throw error;
  }
}