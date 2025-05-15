import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonError } from '../core/error-handler/common-error';
import { CommonHttpErrorService } from '../core/error-handler/common-http-error.service';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { FileRequestDocument } from '../core/domain-classes/file-request-document';
import { FileRequestDocumentInfo } from '@core/domain-classes/file-request-document-info';
import { FileRequestDocumentApprove } from '@core/domain-classes/file-request-document-apporve';

@Injectable({
  providedIn: 'root',
})
export class FileRequestDocumentService {
  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService,
  ) { }

  getFileRequestDocuments(): Observable<FileRequestDocument[] | CommonError> {
    const url = 'FileRequestDocument';
    return this.httpClient.get<FileRequestDocument[]>(url).pipe(
      catchError(this.commonHttpErrorService.handleError)
    );
  }

  getFileRequestDocument(id: string): Observable<FileRequestDocument[] | CommonError> {
    const url = `file-request-document/${id}`;
    return this.httpClient
      .get<FileRequestDocument[]>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError
      ));
  }

  addFileRequestDocument(
    fileRequest: FileRequestDocumentInfo
  ): Observable<FileRequestDocumentInfo | CommonError> {

    const url = `file-request-document/${fileRequest.fileRequestId}`;

    const formData = new FormData();

    fileRequest.files.forEach((file, index) => {
      formData.append('files[]', file);
    });

    Array.from(fileRequest.names).forEach((file) => {
      formData.append('names[]', file);
    });
    return this.httpClient
      .post<FileRequestDocumentInfo>(url, formData)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  rejectFileRequestDocument(
    setting: FileRequestDocument
  ): Observable<FileRequestDocument | CommonError> {
    const url = `file-request-document/reject`;
    return this.httpClient
      .put<FileRequestDocument>(url, setting)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  approveDocument(document: FileRequestDocumentApprove): Observable<FileRequestDocumentApprove | CommonError> {
    document.documentMetaDatas = document.documentMetaDatas?.filter(
      (c) => c.metatag
    );
    const url = `file-request-document/document`;
    const formData = new FormData();
    formData.append('fileRequestId', document.fileRequestId);
    formData.append('fileRequestDocumentId', document.fileRequestDocumentId);
    formData.append('name', document.name);
    formData.append('categoryId', document.categoryId);
    formData.append('statusId', document.statusId);
    formData.append('clientId', document.clientId);
    formData.append('storageSettingId', document.storageSettingId);
    formData.append('categoryName', document.categoryName);
    formData.append('description', document.description);
    formData.append('extension', document.extension);
    formData.append(
      'documentMetaDatas',
      JSON.stringify(document.documentMetaDatas)
    );
    formData.append(
      'documentRolePermissions',
      JSON.stringify(document.documentRolePermissions ?? [])
    );

    formData.append(
      'documentUserPermissions',
      JSON.stringify(document.documentUserPermissions ?? [])
    );
    return this.httpClient
      .post<FileRequestDocumentApprove>(url, formData)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

}
