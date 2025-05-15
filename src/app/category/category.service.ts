import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '@core/domain-classes/category';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService
  ) { }

  delete(id) {
    const url = `category/${id}`;
    return this.httpClient.delete<void>(url);
  }

  update(category: Category) {
    const url = `category/${category.id}`;
    return this.httpClient.put<Category>(url, category);
  }

  add(category: Category) {
    const url = 'category';
    return this.httpClient
      .post<Category>(url, category)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getAllCategoriesForDropDown() {
    const url = `category/dropdown`;
    return this.httpClient.get<Category[]>(url);
  }
}
