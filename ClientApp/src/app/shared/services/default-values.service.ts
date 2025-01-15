import { Injectable } from '@angular/core';
import { Tag } from '../../interfaces/tag.model'
import { Sticker } from '../../interfaces/sticker.model';
import { StickerFilter } from '../../interfaces/sticker-filter.model';
import { ErrorMessage } from '../../interfaces/error.model';
import { EndPoints } from '../enums.model';
import { Category } from '../../interfaces/category.model';

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
  public CategoryObject = (): Category => {
    return {
      IdCategory: 0,
      CategoryName: '',
      Tag: [this.TagObject()],
    }
  }
  public StickerObject = (): Sticker => {
    return {
      IdSticker: 0,
      StickerName: '',
      Tag: [this.TagObject()],
      Category: [this.CategoryObject()],
    }
  }
  public FilterObject = (): StickerFilter => {
    return {
      Start: 1,
      Size: 10,
      OrderByName: true,
      Ascending: true,
      Sticker: this.StickerObject()
    }
  }
  public ItemsPerTable = [5, 10, 20, 50, 100];
  public GetPagedItems = (items: any, currentPage: number, itemsPerPage: number) => {
    if (items === undefined || items.length === 0 || items instanceof Error) return;
    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    return items.slice(firstItemIndex, lastItemIndex);
  }
  public SaveItemsPerPage = (number: string, page: EndPoints) => {
    localStorage.setItem(`${page}itemsPerPage`, number);
  }
  public GetItemsPerPage = (page: EndPoints): number => {
    const items = localStorage.getItem(`${page}itemsPerPage`);
    if (items === null) {
      const defaultItems = this.ItemsPerTable[1].toString();
      this.SaveItemsPerPage(defaultItems, page);
      return  parseInt(defaultItems);
    }
    return parseInt(items);
  }
  public GetErrorMessage(err: any, operation: string, element: string): ErrorMessage {
    const errorMessage: string = err?.error?.title || err?.error?.message || err.error;
    const errorTitle = `Error al ${operation} la ${element}`;
    return {
      Title: errorTitle,
      Message: errorMessage
    };
  }
  public convertToBase64(file: any) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      }
      fileReader.onerror = (error) => {
        reject(error);
      }
    });
  }

  constructor() { }
}
