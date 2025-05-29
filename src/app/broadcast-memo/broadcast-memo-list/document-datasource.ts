import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { HttpResponse } from '@angular/common/http';
import { ResponseHeader } from '@core/domain-classes/document-header';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentResource } from '@core/domain-classes/document-resource';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { DocumentService } from '../document.service';

export class DocumentDataSource implements DataSource<DocumentInfo> {
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

  constructor(private documentService: DocumentService) {}

  connect(collectionViewer: CollectionViewer): Observable<DocumentInfo[]> {
    return this.documentsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.documentsSubject.complete();
    this.loadingSubject.complete();
  }

  loadDocuments(documentResource: DocumentResource) {
    this.loadingSubject.next(true);

    this.documentService
      .getDocuments(documentResource)
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
        const indexableExtensions = [
          'pdf',
          'doc',
          'docx',
          'xls',
          'xlsx',
          'txt',
        ];
        this._data.forEach((doc) => {
          doc.location = doc.location ?? 'local';
          doc.isIndexable = indexableExtensions.includes(
            doc.url.split('.').pop()
          );
        });
        this._count = this._data.length;
        this.documentsSubject.next(this._data);
      });
  }
}
