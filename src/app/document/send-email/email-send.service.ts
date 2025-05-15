import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SendEmail } from '@core/domain-classes/send-email';
import { CommonError } from '@core/error-handler/common-error';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmailSendService {

  constructor(private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService) { }

  sendEmail(sendEmail: SendEmail): Observable<void | CommonError> {
    const url = 'email';
    return this.httpClient.post<void>(url, sendEmail)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }
}
