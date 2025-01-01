import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sticker } from '../../../interfaces/sticker.model'; 
import { EndPoints, ApiAddresses } from '../../enums.model';
import { RequestHelperService } from './request-helper.service';
import { StickerFilter } from '../../../interfaces/sticker-filter.model';

@Injectable({
  providedIn: 'root'
})
export class StickerRepositoryService {

  constructor(
    private http: HttpClient,
    private request: RequestHelperService
  ) { }

  public getStickers = (filters: StickerFilter) => {
    return this.http.post<Sticker[]>(
      this.request.createCompleteRoute(ApiAddresses.Sticker, EndPoints.Get),
      filters,
      this.request.generateHeaders()
    );
  }

  public createSticker = (sticker: Sticker) => {
    return this.http.post<number>(
      this.request.createCompleteRoute(ApiAddresses.Sticker, EndPoints.Post),
      sticker,
      this.request.generateHeaders()
    );
  }

  public updateSticker = (sticker: Sticker) => {
    return this.http.put<number>(
      this.request.createCompleteRoute(ApiAddresses.Sticker, ''),
      sticker,
      this.request.generateHeaders()
    );
  }

  public deleteSticker = (sticker: Sticker) => {
    return this.http.delete<number>(
      this.request.createCompleteRoute(ApiAddresses.Sticker, '', sticker.IdSticker)
    );
  }
}
