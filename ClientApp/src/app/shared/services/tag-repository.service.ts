import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentUrlService } from './environment-url.service';
import { Tag } from '../../interfaces/tag.model';
import { EndPoints, ApiAddresses } from '../enums.model';
import { RequestHelperService } from './request-helper.service'

@Injectable({
  providedIn: 'root'
})
export class TagRepositoryService {

  constructor(
    private http: HttpClient, 
    private envUrl: EnvironmentUrlService,
    private request: RequestHelperService
  ) { }

  public getTags = (tag: Tag) => {
    return this.http.post<Tag[]>(
      this.request.createCompleteRoute(this.envUrl.urlAddress, ApiAddresses.Tag, EndPoints.Get), 
      tag, 
      this.request.generateHeaders()
    );
  }

  public createTag = (tag: Tag) => {
    return this.http.post<number>(
      this.request.createCompleteRoute(this.envUrl.urlAddress, ApiAddresses.Tag, EndPoints.Post), 
      tag, 
      this.request.generateHeaders()
    );
  }

  public updateTag = (tag: Tag) => {
    return this.http.put<number>(
      this.request.createCompleteRoute(this.envUrl.urlAddress, ApiAddresses.Tag, ''), 
      tag, 
      this.request.generateHeaders()
    );
  }

  public deleteTag = (tag: Tag) => {
    return this.http.delete<number>(
      this.request.createCompleteRoute(this.envUrl.urlAddress, ApiAddresses.Tag, '', tag.IdTag)
    );
  }
}
