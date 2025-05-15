import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonError } from '../core/error-handler/common-error';
import { CommonHttpErrorService } from '../core/error-handler/common-http-error.service';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { FileRequest } from '../core/domain-classes/file-request';
import { FileRequestInfo } from '@core/domain-classes/file-request-info';
import { FileRequestResource } from '@core/domain-classes/file-request-resource';

@Injectable({
  providedIn: 'root',
})
export class FileRequestService {
  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService,
  ) { }

  getFileRequests(resource: FileRequestResource): Observable<HttpResponse<FileRequestInfo[]> | CommonError> {
    const url = `file-request`;
    const customParams = new HttpParams()
      .set('fields', resource.fields)
      .set('orderBy', resource.orderBy)
      .set('pageSize', resource.pageSize.toString())
      .set('skip', resource.skip.toString())
      .set('searchQuery', resource.searchQuery)
      .set('id', resource.id.toString())
      .set('email', '')
      .set('subject', resource.subject.toString())

    return this.httpClient.get<FileRequestInfo[]>(url, {
      params: customParams,
      observe: 'response'
    }).pipe(catchError(this.commonHttpErrorService.handleError));
  }

  verifyPassword(id: string, password: string): Observable<boolean | CommonError> {
    const url = `file-request/${id}/verify-password`;
    return this.httpClient
      .post<boolean>(url, {}, { params: { password } })
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getFileRequestData(id: string): Observable<FileRequestInfo | CommonError> {
    const url = `file-request/${id}/data`;
    return this.httpClient
      .get<FileRequestInfo>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getFileRequest(id: string): Observable<FileRequestInfo | CommonError> {
    const url = `file-request/${id}`;
    return this.httpClient
      .get<FileRequestInfo>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  addFileRequest(
    setting: FileRequest
  ): Observable<FileRequest | CommonError> {
    const url = `file-request`;
    return this.httpClient
      .post<FileRequest>(url, setting)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  updateFileRequest(
    setting: FileRequest
  ): Observable<FileRequestInfo | CommonError> {
    const url = `file-request/${setting.id}`;
    return this.httpClient
      .put<FileRequestInfo>(url, setting)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  deleteFileRequest(
    id: string
  ): Observable<FileRequest | CommonError> {
    const url = `file-request/${id}`;
    return this.httpClient
      .delete<FileRequest>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }
}
