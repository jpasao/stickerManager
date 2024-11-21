import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RequestHelperService {

  constructor() { }

  public createCompleteRoute = (envAddress: string, route: string, endPoint: string, queryParam?: number): string => {
    let completeRoute = `${envAddress}/${route}`;
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
