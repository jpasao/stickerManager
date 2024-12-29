import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sticker } from '../../../interfaces/sticker.model'; 
import { Photo } from '../../../interfaces/photo.model';
import { StickerFilter } from '../../../interfaces/sticker-filter.model'; 
import { ApiAddresses, EndPoints } from '../../enums.model';
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

  public getThumbnails = (filter: StickerFilter) => {
    return this.http.post<Photo[]>(
      this.request.createCompleteRoute(ApiAddresses.Image, EndPoints.Thumbnail),
      filter
    );
  }

  public countPhotos = () => {
    return this.http.get<number[]>(
      this.request.createCompleteRoute(ApiAddresses.Image, EndPoints.Count)
    );
  }

  public savePhoto = (image: Photo) => {
    return this.http.post<number>(
      this.request.createCompleteRoute(ApiAddresses.Image, '', image.IdSticker),
      image.StickerImage
    );
  }

  public deletePhoto = (idPhoto: number) => {
    return this.http.delete<number>(
      this.request.createCompleteRoute(ApiAddresses.Image, '', idPhoto)
    );
  }
}
