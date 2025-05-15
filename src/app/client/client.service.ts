import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonError } from '../core/error-handler/common-error';
import { CommonHttpErrorService } from '../core/error-handler/common-http-error.service';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Client } from '@core/domain-classes/client';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService,
  ) {}


  getClients(): Observable<Client[] | CommonError> {
    const url = 'clients';
    return this.httpClient.get<Client[]>(url).pipe(
      catchError(this.commonHttpErrorService.handleError)
    );
  }

  getClient(id: string): Observable<Client | CommonError> {
    const url = `clients/${id}`;
    return this.httpClient
      .get<Client>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  addClient(
    setting: Client
  ): Observable<Client | CommonError> {
    const url = `clients`;
    return this.httpClient
      .post<Client>(url, setting)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  updateClient(
    setting: Client
  ): Observable<Client | CommonError> {
    const url = `clients/${setting.id}`;
    return this.httpClient
      .put<Client>(url, setting)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  deleteClient(
    id: string
  ): Observable<Client | CommonError> {
    const url = `clients/${id}`;
    return this.httpClient
      .delete<Client>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }
}
