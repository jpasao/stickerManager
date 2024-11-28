import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { EnvironmentUrlService } from './environment-url.service';

@Injectable({
  providedIn: 'root'
})
export class RequestHelperService {

  constructor(private envUrl: EnvironmentUrlService) { }

  public createCompleteRoute = (route: string, endPoint: string, queryParam?: number): string => {
    let completeRoute = `${this.envUrl.urlAddress}/${route}`;
    if (endPoint.length) completeRoute = completeRoute.concat(`/${endPoint}`);
    if (typeof queryParam !== 'undefined') completeRoute = completeRoute.concat(`?id=${queryParam}`);
    return completeRoute;
  };

  public generateHeaders = (): object => {
    return {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' }),
      Accept: 'application/json'
    }
  }
}
