import { Injectable } from '@angular/core';
import { Tag } from '../../interfaces/tag.model'
import { Sticker } from '../../interfaces/sticker.model';
import { ErrorMessage } from '../../interfaces/error.model';

@Injectable({
  providedIn: 'root'
})
export class DefaultValuesService {
  public TagObject = (): Tag => {
    return {
      IdTag: 0,
      TagName: ''
    }
  }
  public StickerObject = (): Sticker => {
    return {
      IdSticker: 0,
      StickerName: '',
      Tag: [this.TagObject()]
    }
  }
  public ItemsPerTable = [5, 10, 20, 50, 100];
  public GetPagedItems = (items: any, currentPage: number, itemsPerPage: number) => {
    if (items === undefined || items.length === 0 || items instanceof Error) return;
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    return items.slice(firstItemIndex, lastItemIndex);
  }
  public SaveItemsPerPage = (number: string) => {
    localStorage.setItem('itemsPerPage', number);
  }
  public GetItemsPerPage = (): number => {
    const items = localStorage.getItem('itemsPerPage');
    if (items === null) {
      const defaultItems = this.ItemsPerTable[1].toString();
      this.SaveItemsPerPage(defaultItems);
      return  parseInt(defaultItems);
    }
    return parseInt(items);
  }
  public GetErrorMessage(err: any, operation: string, element: string): ErrorMessage {
    const errorMessage: string = err.error.title || err.error.message || err.error;
    const errorTitle = `Error al ${operation} la ${element}`;
    return {
      Title: errorTitle,
      Message: errorMessage
    };
  }

  constructor() { }
}
