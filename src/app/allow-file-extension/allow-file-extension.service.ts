import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonError } from '../core/error-handler/common-error';
import { CommonHttpErrorService } from '../core/error-handler/common-http-error.service';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CommonService } from '../core/services/common.service';
import { AllowFileExtension } from '@core/domain-classes/allow-file-extension';

@Injectable({
  providedIn: 'root',
})
export class AllowFileExtensionService {
  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService,
    private commonService: CommonService
  ) {}

  getAllowFileExtensions(): Observable<AllowFileExtension[] | CommonError> {
    const url = 'file-extensions';
    return this.httpClient.get<AllowFileExtension[]>(url).pipe(
      tap((data) => {
        if (data && data.length > 0) {
          this.commonService.setAllowFileExtension(data);
        }
      }),
      catchError(this.commonHttpErrorService.handleError)
    );
  }

  getAllowFileExtension(id: string): Observable<AllowFileExtension | CommonError> {
    const url = `file-extensions/${id}`;
    return this.httpClient
      .get<AllowFileExtension>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  addAllowFileExtension(
    setting: AllowFileExtension
  ): Observable<AllowFileExtension | CommonError> {
    const url = `file-extensions`;
    return this.httpClient
      .post<AllowFileExtension>(url, setting)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  updateAllowFileExtension(
    setting: AllowFileExtension
  ): Observable<AllowFileExtension | CommonError> {
    const url = `file-extensions/${setting.id}`;
    return this.httpClient
      .put<AllowFileExtension>(url, setting)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  deleteAllowFileExtension(
    id: string
  ): Observable<AllowFileExtension | CommonError> {
    const url = `file-extensions/${id}`;
    return this.httpClient
      .delete<AllowFileExtension>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }
}
