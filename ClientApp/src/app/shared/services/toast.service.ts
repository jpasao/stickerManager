import { Injectable, ViewChild } from '@angular/core';
import { ToastMessageComponent } from '../../components/toast/toast-message.component';
import { ColorClasses } from '../enums.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  @ViewChild(ToastMessageComponent) toastComponent!: ToastMessageComponent;
  constructor() { }

  public show(message: string, color: string) {
    this.toastColor = color;
    this.autohide = this.toastColor !== ColorClasses.danger;
    this.toastMessage = message;
    this.toastComponent.toggleToast();
  }
}
