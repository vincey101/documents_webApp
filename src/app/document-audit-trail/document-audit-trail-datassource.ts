import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { HttpResponse } from '@angular/common/http';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { ResponseHeader } from '@core/domain-classes/document-header';
import { DocumentResource } from '@core/domain-classes/document-resource';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { DocumentAuditTrailService } from './document-audit-trail.service';

export class DocumentAuditTrialDataSource
  implements DataSource<DocumentAuditTrail>
{
  private documentAuditTrailsSubject = new BehaviorSubject<
    DocumentAuditTrail[]
  >([]);
  private responseHeaderSubject = new BehaviorSubject<ResponseHeader>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();
  private _count = 0;

  public get count(): number {
    return this._count;
  }

  public responseHeaderSubject$ = this.responseHeaderSubject.asObservable();

  constructor(private documentAuditTrailService: DocumentAuditTrailService) {}

  connect(
    collectionViewer: CollectionViewer
  ): Observable<DocumentAuditTrail[]> {
    return this.documentAuditTrailsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.documentAuditTrailsSubject.complete();
    this.loadingSubject.complete();
  }

  loadDocumentAuditTrails(documentResource: DocumentResource) {
    this.loadingSubject.next(true);
    this.documentAuditTrailService
      .getDocumentAuditTrials(documentResource)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((resp: HttpResponse<DocumentAuditTrail[]>) => {
        const paginationParam = new ResponseHeader();
        paginationParam.pageSize = parseInt(resp.headers.get('pageSize'));
        paginationParam.totalCount = parseInt(resp.headers.get('totalCount'));
        paginationParam.skip = parseInt(resp.headers.get('skip'));
        this.responseHeaderSubject.next(paginationParam);
        const documentAuditTrails = [...resp.body];
        this._count = documentAuditTrails.length;
        this.documentAuditTrailsSubject.next(documentAuditTrails);
      });
  }
}
