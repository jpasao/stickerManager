import { Injectable } from '@angular/core';
import { Tag } from '../../interfaces/tag.model'
import { Sticker } from '../../interfaces/sticker.model';
import { ErrorMessage } from '../../interfaces/error.model';
import { EndPoints } from '../enums.model';

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
  public resizeImage(imageURL: any): Promise<any> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = function () {
        const thumbnailSize: number = 150;
        const canvas = document.createElement('canvas');
        canvas.width = thumbnailSize;
        canvas.height = thumbnailSize;
        const ctx = canvas.getContext('2d');
        if (ctx != null) {
          ctx.drawImage(image, 0, 0, thumbnailSize, thumbnailSize);
        }
        return canvas.toBlob((blob) => resolve(blob));
      };
      image.src = imageURL;
    });
  }
  public async getThumbnail(file: any): Promise<any> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        await this.resizeImage(reader.result as string)
          .then((result: any) => {
            resolve(result);
          });
      }
    })
  }

  constructor() { }
}
