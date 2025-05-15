import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { User } from '@core/domain-classes/user';
import { Observable } from 'rxjs';
import { CommonError } from '@core/error-handler/common-error';
import { catchError } from 'rxjs/operators';
import { PageHelper } from '@core/domain-classes/page-helper';

@Injectable({ providedIn: 'root' })
export class PageHelperService {
  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService
  ) {}

  getPageHelpers(): Observable<PageHelper[] | CommonError> {
    const url = `page-helper`;
    return this.httpClient
      .get<PageHelper[]>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  updatePageHelper(
    pageHelper: PageHelper
  ): Observable<PageHelper | CommonError> {
    const url = `page-helper/${pageHelper.id}`;
    return this.httpClient
      .post<User>(url, pageHelper)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getPageHelper(id: string): Observable<PageHelper | CommonError> {
    const url = `page-helper/${id}`;
    return this.httpClient
      .get<PageHelper>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }
}
