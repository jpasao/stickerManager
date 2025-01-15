import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dependency } from '../../../interfaces/dependency.model';
import { Category } from '../../../interfaces/category.model';
import { ApiAddresses, EndPoints } from '../../enums.model';
import { RequestHelperService } from './request-helper.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryRepositoryService {

  constructor(
    private http: HttpClient,
    private request: RequestHelperService
  ) { }

  public getCategories = (category: Category) => {
    return this.http.post<Category[]>(
      this.request.createCompleteRoute(ApiAddresses.Category, EndPoints.Get),
      category,
      this.request.generateHeaders()
    );
  }

  public createCategory = (category: Category) => {
    return this.http.post<number>(
      this.request.createCompleteRoute(ApiAddresses.Category, EndPoints.Post),
      category,
      this.request.generateHeaders()
    );
  }

  public updateCategory = (category: Category) => {
    return this.http.put<number>(
      this.request.createCompleteRoute(ApiAddresses.Category, ''),
      category,
      this.request.generateHeaders()
    );
  }

  public deleteCategory = (category: Category) => {
    return this.http.delete<number>(
      this.request.createCompleteRoute(ApiAddresses.Category, '', category.IdCategory)
    );
  }

  public getDependencies = (category: Category) => {
    return this.http.get<Dependency[]>(
      this.request.createCompleteRoute(ApiAddresses.Category, EndPoints.Dependency, category.IdCategory)
    );
  }
}
