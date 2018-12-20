import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class AlertService {
  constructor(private toast: ToastrService) { }

  success(msg: string) {
    this.toast.success(msg);
  }

  info(msg: string) {
    this.toast.info(msg);
  }

  warning(msg: string) {
    this.toast.warning(msg);
  }

  error(msg: string) {
    this.toast.error(msg);
  }
}
