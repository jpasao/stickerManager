import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Tag } from '../../interfaces/tag.model';
import { EndPoints, ApiAddresses } from '../enums.model';
import { RequestHelperService } from './request-helper.service'

@Injectable({
  providedIn: 'root'
})
export class TagRepositoryService {

  constructor(
    private http: HttpClient,
    private request: RequestHelperService
  ) { }

  public getTags = (tag: Tag) => {
    return this.http.post<Tag[]>(
      this.request.createCompleteRoute(ApiAddresses.Tag, EndPoints.Get), 
      tag, 
      this.request.generateHeaders()
    );
  }

  public createTag = (tag: Tag) => {
    return this.http.post<number>(
      this.request.createCompleteRoute(ApiAddresses.Tag, EndPoints.Post), 
      tag, 
      this.request.generateHeaders()
    );
  }

  public updateTag = (tag: Tag) => {
    return this.http.put<number>(
      this.request.createCompleteRoute(ApiAddresses.Tag, ''), 
      tag, 
      this.request.generateHeaders()
    );
  }

  public deleteTag = (tag: Tag) => {
    return this.http.delete<number>(
      this.request.createCompleteRoute(ApiAddresses.Tag, '', tag.IdTag)
    );
  }
}
