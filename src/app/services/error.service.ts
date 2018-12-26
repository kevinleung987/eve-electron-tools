import { ErrorHandler, Injectable } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  constructor(private alert: AlertService) { }

  public handleError(error: any) {
    if (this.alert) {
      this.alert.error(error);
    }
    throw error;
  }
}
