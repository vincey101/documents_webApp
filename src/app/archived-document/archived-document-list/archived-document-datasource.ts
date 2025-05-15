import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { HttpResponse } from '@angular/common/http';
import { ResponseHeader } from '@core/domain-classes/document-header';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentResource } from '@core/domain-classes/document-resource';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { DocumentService } from 'src/app/document/document.service';
import { ArchiveDocumentService } from '../archive-document.service';

export class ArchivedDocumentDataSource implements DataSource<DocumentInfo> {
  private documentsSubject = new BehaviorSubject<DocumentInfo[]>([]);
  private responseHeaderSubject = new BehaviorSubject<ResponseHeader>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();
  private _count = 0;

  public get count(): number {
    return this._count;
  }

  public responseHeaderSubject$ = this.responseHeaderSubject.asObservable();

  private _data: DocumentInfo[];
  public get data(): DocumentInfo[] {
    return this._data;
  }
  public set data(v: DocumentInfo[]) {
    this._data = v;
  }

  constructor(private archiveDocumentService: ArchiveDocumentService) {}

  connect(collectionViewer: CollectionViewer): Observable<DocumentInfo[]> {
    return this.documentsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.documentsSubject.complete();
    this.loadingSubject.complete();
  }

  loadDocuments(documentResource: DocumentResource) {
    this.loadingSubject.next(true);

    this.archiveDocumentService
      .getArchiveDocuments(documentResource)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((resp: HttpResponse<DocumentInfo[]>) => {
        const paginationParam = new ResponseHeader();
        paginationParam.pageSize = parseInt(resp.headers.get('pageSize'));
        paginationParam.totalCount = parseInt(resp.headers.get('totalCount'));
        paginationParam.skip = parseInt(resp.headers.get('skip'));
        this.responseHeaderSubject.next({ ...paginationParam });
        this._data = [...resp.body];
        this._count = this._data.length;
        this.documentsSubject.next(this._data);
      });
  }
}
