import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DocumentStatus } from '@core/domain-classes/document-status';
import { CommonError } from '@core/error-handler/common-error';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentStatusService {
  private commonHttpErrorService = inject(CommonHttpErrorService);
  private httpClient = inject(HttpClient);

  getDocumentStatuss(): Observable<DocumentStatus[] | CommonError> {
    const url = 'document-status';
    return this.httpClient.get<DocumentStatus[]>(url)
      .pipe(
        catchError(this.commonHttpErrorService.handleError));
  }

  getDocumentStatusById(id: string): Observable<DocumentStatus | CommonError> {
    const url = `document-status/${id}`;
    return this.httpClient.get<DocumentStatus>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  addDocumentStatus(documentStatus: DocumentStatus): Observable<DocumentStatus | CommonError> {
    const url = 'documentStatus';
    return this.httpClient.post<DocumentStatus>(url, documentStatus)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  updateDocumentStatus(documentStatus: DocumentStatus): Observable<DocumentStatus | CommonError> {
    const url = `document-status/${documentStatus.id}`;
    return this.httpClient.put<DocumentStatus>(url, documentStatus)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  deleteDocumentStatus(id: string): Observable<void | CommonError> {
    const url = `document-status/${id}`;
    return this.httpClient.delete<void>(url).pipe(
      catchError(this.commonHttpErrorService.handleError)
    );
  }
}
