import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentByCategory } from '@core/domain-classes/document-by-category';
import { catchError } from 'rxjs/operators';
import { CommonError } from '@core/error-handler/common-error';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { CalenderReminderDto } from '@core/domain-classes/calender-reminder';

@Injectable({ providedIn: 'root' })
export class DashboradService {
  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService
  ) {}

  getDocumentByCategory(): Observable<DocumentByCategory[]> {
    const url = `Dashboard/GetDocumentByCategory`;
    return this.httpClient.get<DocumentByCategory[]>(url);
  }

  getReminders(month, year): Observable<CalenderReminderDto[] | CommonError> {
    const url = `dashboard/reminders/${month}/${year}`;
    return this.httpClient
      .get<CalenderReminderDto[]>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }
}
