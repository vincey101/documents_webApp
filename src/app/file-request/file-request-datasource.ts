import { DataSource } from '@angular/cdk/table';
import { HttpResponse } from '@angular/common/http';
import { ResponseHeader } from '@core/domain-classes/response-header';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { FileRequestService } from './file-request.service';
import { FileRequestResource } from '@core/domain-classes/file-request-resource';
import { FileRequestInfo } from '@core/domain-classes/file-request-info';

export class FileRequestDataSource implements DataSource<FileRequestInfo> {
  private fileRequestSubject = new BehaviorSubject<FileRequestInfo[]>([]);
  private responseHeaderSubject = new BehaviorSubject<ResponseHeader>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();
  private _count: number = 0;

  public get count(): number {
    return this._count;
  }

  public responseHeaderSubject$ = this.responseHeaderSubject.asObservable();

  constructor(private fileRequestService: FileRequestService) {}

  connect(): Observable<FileRequestInfo[]> {
    return this.fileRequestSubject.asObservable();
  }

  disconnect(): void {
    this.fileRequestSubject.complete();
    this.loadingSubject.complete();
  }

loadFileRequests(fileRequestResource: FileRequestResource) {
  this.loadingSubject.next(true);
  this.fileRequestService
    .getFileRequests(fileRequestResource)
    .pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
    .subscribe((resp: HttpResponse<FileRequestInfo[]>) => {
      const paginationParam = new ResponseHeader();
      paginationParam.pageSize = parseInt(resp.headers.get('pageSize'));
      paginationParam.totalCount = parseInt(resp.headers.get('totalCount'));
      paginationParam.skip = parseInt(resp.headers.get('skip'));
        this.responseHeaderSubject.next(paginationParam);
        const fileRequests = [...resp.body];
        this._count = fileRequests.length;
        this.fileRequestSubject.next(fileRequests);
    });
}

}
