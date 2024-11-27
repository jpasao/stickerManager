import { Injectable } from '@angular/core';
import { Tag } from '../interfaces/tag.model'
import { ToastModel } from '../interfaces/toast.model';
import { ColorClasses } from './enums.model';

@Injectable({
  providedIn: 'root'
})
export class DefaultValuesService {
  public tagObject = (): Tag => {
    return {
      IdTag: 0,
      TagName: ''
    }
  }
  public ToastObject = (message: string, color: string): ToastModel => {
    return {
      toastColor: color,
      autohide: color !== ColorClasses.danger,
      toastMessage: message
    };
  }

  constructor() { }
}
