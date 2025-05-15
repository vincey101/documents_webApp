import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';
import { CommonError } from './common-error';
import {} from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommonHttpErrorService {

  handleError(httpErrorResponse: HttpErrorResponse): Observable<CommonError> {
    const errors = [];
    for (const [, value] of Object.entries(httpErrorResponse.error)) {
      errors.push(value);
    }
    const customError: CommonError = {
      statusText: httpErrorResponse.statusText,
      code: httpErrorResponse.status,
      messages: errors,
      friendlyMessage: 'Error from service',
      error: httpErrorResponse.error,
    };
    console.error(httpErrorResponse);
    return throwError(customError);
  }
}
