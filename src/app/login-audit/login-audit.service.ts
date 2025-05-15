import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginAudit } from '@core/domain-classes/login-audit';
import { LoginAuditResource } from '@core/domain-classes/login-audit-resource';
import { CommonError } from '@core/error-handler/common-error';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class LoginAuditService {

    constructor(
        private httpClient: HttpClient,
        private commonHttpErrorService: CommonHttpErrorService) { }

    getLoginAudits(resource: LoginAuditResource): Observable<HttpResponse<LoginAudit[]> | CommonError> {
        const url = `loginAudit`;
        const customParams = new HttpParams()
            .set('fields', resource.fields)
            .set('orderBy', resource.orderBy)
            .set('pageSize', resource.pageSize.toString())
            .set('skip', resource.skip.toString())
            .set('searchQuery', resource.searchQuery)
            .set('id', resource.id.toString())
            .set('userName', resource.userName.toString())

        return this.httpClient.get<LoginAudit[]>(url, {
            params: customParams,
            observe: 'response'
        }).pipe(catchError(this.commonHttpErrorService.handleError));
    }
}
