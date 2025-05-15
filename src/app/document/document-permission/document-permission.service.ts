import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DocumentPermission } from '@core/domain-classes/document-permission';
import { DocumentRolePermission } from '@core/domain-classes/document-role-permission';
import { DocumentUserPermission } from '@core/domain-classes/document-user-permission';
import { PermissionUserRole } from '@core/domain-classes/permission-user-role';
import { CommonError } from '@core/error-handler/common-error';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DocumentPermissionService {
  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService
  ) {}

  getDoucmentPermission(
    id: string
  ): Observable<DocumentPermission[] | CommonError> {
    const url = `DocumentRolePermission/${id}`;
    return this.httpClient
      .get<DocumentPermission[]>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  deleteDocumentUserPermission(id: string): Observable<void | CommonError> {
    const url = `documentUserPermission/${id}`;
    return this.httpClient
      .delete<void>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  deleteDocumentRolePermission(id: string): Observable<void | CommonError> {
    const url = `documentRolePermission/${id}`;
    return this.httpClient
      .delete<void>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  addDocumentUserPermission(
    documentUserPermissions: DocumentUserPermission[]
  ): Observable<void | CommonError> {
    const url = 'documentUserPermission';
    return this.httpClient
      .post<void>(url, { documentUserPermissions })
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  addDocumentRolePermission(
    documentRolePermissions: DocumentRolePermission[]
  ): Observable<void | CommonError> {
    const url = 'documentRolePermission';
    return this.httpClient
      .post<void>(url, { documentRolePermissions })
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  multipleDocumentsToUsersAndRoles(
    permissionUserRole: PermissionUserRole
  ): Observable<boolean | CommonError> {
    const url = 'documentRolePermission/multiple';
    return this.httpClient
      .post<boolean>(url, permissionUserRole)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }
}
