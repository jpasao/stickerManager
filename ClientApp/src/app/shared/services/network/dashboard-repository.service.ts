import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dashboard } from '../../../interfaces/dashboard.model';
import { EndPoints, ApiAddresses } from '../../enums.model';
import { RequestHelperService } from './request-helper.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardRepositoryService {

  constructor(
    private http: HttpClient,
    private request: RequestHelperService
  ) { }

  public getOverview = () => {
    return this.http.get<Dashboard[]>(
      this.request.createCompleteRoute(ApiAddresses.Dashboard, EndPoints.Overview)
    );
  }

  public getSticker = () => {
    return this.http.get<Dashboard[]>(
      this.request.createCompleteRoute(ApiAddresses.Dashboard, EndPoints.Sticker)
    );
  }

  public getCategory = () => {
    return this.http.get<Dashboard[]>(
      this.request.createCompleteRoute(ApiAddresses.Dashboard, EndPoints.Category)
    );
  }

  public getTag = () => {
    return this.http.get<Dashboard[]>(
      this.request.createCompleteRoute(ApiAddresses.Dashboard, EndPoints.Tag)
    );
  }
}
