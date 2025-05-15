import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonError } from '../core/error-handler/common-error';
import { ClientService } from './client.service';
import { Client } from '@core/domain-classes/client';

@Injectable({
    providedIn: 'root'
  })
export class ClientResolver  {
    constructor(private clientService: ClientService) { }
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Client | CommonError> {
        const id = route.paramMap.get('id');
        return this.clientService.getClient(id) as Observable<Client | CommonError>;
    }
}