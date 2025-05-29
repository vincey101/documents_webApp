import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { CommonError } from '@core/error-handler/common-error';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '@core/domain-classes/user';
import { catchError, tap } from 'rxjs/operators';
import { Role } from '@core/domain-classes/role';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import {
  reminderFrequencies,
  ReminderFrequency,
} from '@core/domain-classes/reminder-frequency';
import { ReminderResourceParameter } from '@core/domain-classes/reminder-resource-parameter';
import { Reminder } from '@core/domain-classes/reminder';
import { DocumentView } from '@core/domain-classes/document-view';
import { PageHelper } from '@core/domain-classes/page-helper';
import { AllowFileExtension } from '@core/domain-classes/allow-file-extension';
import { ClonerService } from './clone.service';

@Injectable({ providedIn: 'root' })
export class CommonService {
  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService,
    private clonerService: ClonerService
  ) { }
  private _allowFileExtension$: BehaviorSubject<AllowFileExtension[]> =
    new BehaviorSubject<AllowFileExtension[]>([]);
  public get allowFileExtension$(): Observable<AllowFileExtension[]> {
    return this._allowFileExtension$.asObservable();
  }
  getUsers(): Observable<User[] | CommonError> {
    const url = `user`;
    return this.httpClient
      .get<User[]>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  setAllowFileExtension(value: AllowFileExtension[]) {
    if (value) {
      this._allowFileExtension$.next(this.clonerService.deepClone(value));
    } else {
      const allowedExtensions = sessionStorage.getItem('allowFileExtension');
      if (allowedExtensions) {
        this._allowFileExtension$.next(JSON.parse(allowedExtensions));
      }
    }
  }

  getUsersForDropdown(): Observable<User[] | CommonError> {
    const url = `user-dropdown`;
    return this.httpClient
      .get<User[]>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getRoles(): Observable<Role[] | CommonError> {
    const url = `role`;
    return this.httpClient
      .get<Role[]>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getRolesForDropdown(): Observable<Role[] | CommonError> {
    const url = 'role-dropdown';
    return this.httpClient
      .get<Role[]>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getMyReminder(id: string): Observable<Reminder | CommonError> {
    const url = `reminder/${id}/myreminder`;
    return this.httpClient
      .get<Reminder>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getReminder(id: string): Observable<Reminder | CommonError> {
    const url = `reminder/${id}`;
    return this.httpClient
      .get<Reminder>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  addDocumentAuditTrail(
    documentAuditTrail: DocumentAuditTrail
  ): Observable<DocumentAuditTrail | CommonError> {
    const url = `documentAuditTrail`;
    return this.httpClient
      .post<DocumentAuditTrail>(url, documentAuditTrail)
      .pipe(catchError(this.commonHttpErrorService.handleError));
    //return this.httpClient.post<DocumentAuditTrail>('documentAuditTrail',documentAuditTrail);
  }

  downloadDocument(
    documentView: DocumentView
  ): Observable<HttpEvent<Blob> | CommonError> {
    let url = '';
    if (documentView.isFromFileRequest) {
      url = `file-request-document/${documentView.documentId}/download`;
    }
    else if (documentView.isFromPublicPreview) {
      url = `document-sharable-link/${documentView.documentId
        }/download?password=${documentView.linkPassword ?? ''}`;
    }
    else {
      url = `document/${documentView.documentId}/download/${documentView.isVersion}`;
    }
    return this.httpClient
      .get(url, {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      })
      .pipe(
        catchError((error) =>
          this.commonHttpErrorService.handleError(
            this.blobToString(error.error)
          )
        )
      );
  }

  isDownloadFlag(documentId: string): Observable<boolean> {
    const url = `document/${documentId}/isDownloadFlag`;
    return this.httpClient.get<boolean>(url);
  }

  getDocumentToken(
    documentView: DocumentView
  ): Observable<{ [key: string]: string }> {
    let url = '';
    if (documentView.isFromPublicPreview) {
      url = `document-sharable-link/${documentView.documentId}/token`;
    } else {
      url = `documentToken/${documentView.documentId}/token`;
    }
    return this.httpClient.get<{ [key: string]: string }>(url);
  }

  deleteDocumentToken(token: string): Observable<boolean> {
    const url = `documentToken/${token}`;
    return this.httpClient.delete<boolean>(url);
  }

  readDocument(
    documentView: DocumentView
  ): Observable<{ [key: string]: string[] } | CommonError> {
    let url = '';
    if (documentView.isFromFileRequest) {
      url = `file-request-document/${documentView.documentId}/readText`;
      return this.httpClient.get<{ [key: string]: string[] }>(url);
    }
    else if (documentView.isFromPublicPreview) {
      url = `document-sharable-link/${documentView.documentId
        }/readText?password=${documentView.linkPassword ?? ''}`;
      return this.httpClient.post<{ [key: string]: string[] }>(url, {
        password: documentView.linkPassword,
      });
    } else {
      url = `document/${documentView.documentId}/readText/${documentView.isVersion}`;
      return this.httpClient.get<{ [key: string]: string[] }>(url);
    }
  }

  getReminderFrequency(): Observable<ReminderFrequency[]> {
    return of(reminderFrequencies);
  }

  getAllRemindersForCurrentUser(
    resourceParams: ReminderResourceParameter
  ): Observable<HttpResponse<Reminder[]>> {
    const url = 'reminder/all/currentuser';
    const customParams = new HttpParams()
      .set('fields', resourceParams.fields ? resourceParams.fields : '')
      .set('orderBy', resourceParams.orderBy ? resourceParams.orderBy : '')
      .set('pageSize', resourceParams.pageSize.toString())
      .set('skip', resourceParams.skip.toString())
      .set(
        'searchQuery',
        resourceParams.searchQuery ? resourceParams.searchQuery : ''
      )
      .set('subject', resourceParams.subject ? resourceParams.subject : '')
      .set('message', resourceParams.message ? resourceParams.message : '')
      .set(
        'frequency',
        resourceParams.frequency ? resourceParams.frequency : ''
      );

    return this.httpClient.get<Reminder[]>(url, {
      params: customParams,
      observe: 'response',
    });
  }

  deleteReminderCurrentUser(reminderId: string): Observable<boolean> {
    const url = `reminder/currentuser/${reminderId}`;
    return this.httpClient.delete<boolean>(url);
  }

  getPageHelperText(code: string): Observable<PageHelper | CommonError> {
    const url = `page-helper/${code}/code`;
    return this.httpClient.get<PageHelper>(url);
  }

  getAllowFileExtensions(): Observable<AllowFileExtension[] | CommonError> {
    const allowedExtensions = sessionStorage.getItem('allowFileExtension');
    if (allowedExtensions) {
      this._allowFileExtension$.next(JSON.parse(allowedExtensions));
      return of(JSON.parse(allowedExtensions));
    }
    const url = 'file-extensions';
    return this.httpClient.get<AllowFileExtension[]>(url).pipe(
      tap((allowFileExtension) => {
        this.setAllowFileExtension(allowFileExtension);
        if (allowFileExtension && allowFileExtension.length > 0) {
          sessionStorage.setItem('allowFileExtension', JSON.stringify(allowFileExtension));
        }
      }),
      catchError(this.commonHttpErrorService.handleError)
    );
  }

  private blobToString(blob) {
    const url = URL.createObjectURL(blob);
    const xmlRequest = new XMLHttpRequest();
    xmlRequest.open('GET', url, false);
    xmlRequest.send();
    URL.revokeObjectURL(url);
    return JSON.parse(xmlRequest.responseText);
  }
}
