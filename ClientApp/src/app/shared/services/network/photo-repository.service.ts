import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sticker } from '../../../interfaces/sticker.model'; 
import { Photo } from '../../../interfaces/photo.model';
import { ApiAddresses } from '../../enums.model';
import { RequestHelperService } from './request-helper.service';

@Injectable({
  providedIn: 'root'
})
export class PhotoRepositoryService {

  constructor(
    private http: HttpClient, 
    private request: RequestHelperService
  ) { }

  public getPhotos = (sticker: Sticker) => {
    return this.http.get<Photo[]>(
      this.request.createCompleteRoute(ApiAddresses.Image, '', sticker.IdSticker)
    );
  }

  public savePhoto = (sticker: Sticker, image: Photo) => {
    return this.http.post<number>(
      this.request.createCompleteRoute(ApiAddresses.Image, '', sticker.IdSticker),
      image.StickerImage
    );
  }

  public deletePhoto = (image: Photo) => {
    return this.http.delete<number>(
      this.request.createCompleteRoute(ApiAddresses.Image, '', image.IdPhoto)
    );
  }
}
