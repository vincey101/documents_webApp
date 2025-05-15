import { DataSource } from '@angular/cdk/table';
import { HttpResponse } from '@angular/common/http';
import { Reminder } from '@core/domain-classes/reminder';
import { ReminderResourceParameter } from '@core/domain-classes/reminder-resource-parameter';
import { ResponseHeader } from '@core/domain-classes/response-header';
import { CommonService } from '@core/services/common.service';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

export class ReminderDataSource implements DataSource<Reminder> {
  private _reminderSubject$ = new BehaviorSubject<Reminder[]>([]);
  private _responseHeaderSubject$ = new BehaviorSubject<ResponseHeader>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();
  private _count = 0;
  sub$: Subscription;

  public get count(): number {
    return this._count;
  }
  public responseHeaderSubject$ = this._responseHeaderSubject$.asObservable();

  constructor(private commonService: CommonService) {}

  connect(): Observable<Reminder[]> {
    this.sub$ = new Subscription();
    return this._reminderSubject$.asObservable();
  }

  disconnect(): void {
    this._reminderSubject$.complete();
    this.loadingSubject.complete();
    this.sub$.unsubscribe();
  }

  loadData(reminderResource: ReminderResourceParameter) {
    this.loadingSubject.next(true);
    this.sub$ = this.commonService
      .getAllRemindersForCurrentUser(reminderResource)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((resp: HttpResponse<Reminder[]>) => {
        const paginationParam = new ResponseHeader();
        paginationParam.pageSize = parseInt(resp.headers.get('pageSize'));
        paginationParam.totalCount = parseInt(resp.headers.get('totalCount'));
        paginationParam.skip = parseInt(resp.headers.get('skip'));
        this._responseHeaderSubject$.next({ ...paginationParam });

        const inquiries = [...resp.body];
        this._count = inquiries.length;
        this._reminderSubject$.next(inquiries);
      });
  }
}
