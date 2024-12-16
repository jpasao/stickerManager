import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ColorClasses } from '../enums.model';

@Injectable({
  providedIn: 'root'
})
export class ShowToastService {
  constructor(private toast: ToastrService) { }

  public show(title: string, message: string, type: ColorClasses) {
    switch(type) {
      case ColorClasses.info:
        this.toast.info(message, title);
        break;
      case ColorClasses.warning:
        this.toast.warning(message, title);
        break;
      case ColorClasses.danger:
        this.toast.error(message, title, { disableTimeOut: true });
    }
  }
}
