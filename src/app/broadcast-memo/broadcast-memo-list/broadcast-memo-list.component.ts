import { SelectionModel } from '@angular/cdk/collections';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { Category } from '@core/domain-classes/category';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { DocumentCategory } from '@core/domain-classes/document-category';
import { ResponseHeader } from '@core/domain-classes/document-header';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentOperation } from '@core/domain-classes/document-operation';
import { DocumentResource } from '@core/domain-classes/document-resource';
import { DocumentView } from '@core/domain-classes/document-view';
import { DocumentVersion } from '@core/domain-classes/documentVersion';
import { CategoryService } from 'src/app/category/category.service';
import { ClonerService } from '@core/services/clone.service';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { BasePreviewComponent } from '@shared/base-preview/base-preview.component';
import { OverlayPanel } from '@shared/overlay-panel/overlay-panel.service';
import { ToastrService } from 'ngx-toastr';
import { fromEvent, merge, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BaseComponent } from 'src/app/base.component';
import { DocumentCommentComponent } from '../document-comment/document-comment.component';
import { DocumentEditComponent } from '../document-edit/document-edit.component';
import { DocumentPermissionListComponent } from '../document-permission/document-permission-list/document-permission-list.component';
import { DocumentPermissionMultipleComponent } from '../document-permission/document-permission-multiple/document-permission-multiple.component';
import { DocumentReminderComponent } from '../document-reminder/document-reminder.component';
import { DocumentUploadNewVersionComponent } from '../document-upload-new-version/document-upload-new-version.component';
import { DocumentVersionHistoryComponent } from '../document-version-history/document-version-history.component';
import { DocumentService } from '../document.service';
import { SendEmailComponent } from '../send-email/send-email.component';
import { DocumentDataSource } from './document-datasource';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Direction } from '@angular/cdk/bidi';
import { DocumentDeleteDialogComponent } from 'src/app/document-delete-dialog/document-delete-dialog.component';
import { SharableLinkComponent } from '../sharable-link/sharable-link.component';
import { DocumentShareableLink } from '@core/domain-classes/document-shareable-link';
import { ClientStore } from 'src/app/client/client-store';
import { DocumentStatusStore } from 'src/app/document-status/store/document-status.store';
import { CategoryStore } from 'src/app/category/store/category-store';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss'],
  viewProviders: [DatePipe],
})
export class DocumentListComponent
  extends BaseComponent
  implements OnInit, AfterViewInit {
  dataSource: DocumentDataSource;
  documents: DocumentInfo[] = [];
  displayedColumns: string[] = [
    'select',
    'action',
    'name',
    'categoryName',
    'statusName',
    'createdDate',
    'modifiedDate',
    'dueDate',
    'createdBy',
  ];
  footerToDisplayed = ['footer'];
  documentResource: DocumentResource;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: ElementRef;
  @ViewChild('metatag') metatag: ElementRef;
  createdDate = new FormControl('');
  selection = new SelectionModel<DocumentInfo>(true, []);
  max = new Date();
  direction: Direction;
  public clientStore = inject(ClientStore);
  documentStatusStore = inject(DocumentStatusStore);
  categoryStore = inject(CategoryStore);

  constructor(
    private documentService: DocumentService,
    private commonDialogService: CommonDialogService,
    private dialog: MatDialog,
    public overlay: OverlayPanel,
    public clonerService: ClonerService,
    private translationService: TranslationService,
    private commonService: CommonService,
    private toastrService: ToastrService
  ) {
    super();
    this.documentResource = new DocumentResource();
    this.documentResource.pageSize = 10;
    this.documentResource.orderBy = 'createdDate desc';
  }

  ngOnInit(): void {
    this.dataSource = new DocumentDataSource(this.documentService);
    this.dataSource.loadDocuments(this.documentResource);
    this.getResourceParameter();
    this.getLangDir();
  }

  getLangDir() {
    this.sub$.sink = this.translationService.lanDir$.subscribe(
      (c: Direction) => (this.direction = c)
    );
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    this.sub$.sink = merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.documentResource.skip =
            this.paginator.pageIndex * this.paginator.pageSize;
          this.documentResource.pageSize = this.paginator.pageSize;
          this.documentResource.orderBy =
            this.sort.active + ' ' + this.sort.direction;
          this.dataSource.loadDocuments(this.documentResource);
          this.selection.clear();
        })
      )
      .subscribe();

    this.sub$.sink = fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.documentResource.skip = 0;
          this.documentResource.name = this.input.nativeElement.value;
          this.dataSource.loadDocuments(this.documentResource);
          this.selection.clear();
        })
      )
      .subscribe();

    this.sub$.sink = fromEvent(this.metatag.nativeElement, 'keyup')
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.documentResource.skip = 0;
          this.documentResource.metaTags = this.metatag.nativeElement.value;
          this.dataSource.loadDocuments(this.documentResource);
        })
      )
      .subscribe();
    this.sub$.sink = this.createdDate.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        tap((value: any) => {
          this.paginator.pageIndex = 0;
          this.documentResource.skip = 0;
          if (value) {
            this.documentResource.createDate = new Date(value).toISOString();
          } else {
            this.documentResource.createDate = null;
          }
          this.documentResource.skip = 0;
          this.paginator.pageIndex = 0;
          this.dataSource.loadDocuments(this.documentResource);
        })
      )
      .subscribe();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  onCategoryChange(filtervalue: string) {
    if (filtervalue) {
      this.documentResource.categoryId = filtervalue;
    } else {
      this.documentResource.categoryId = '';
    }
    this.documentResource.skip = 0;
    this.paginator.pageIndex = 0;
    this.dataSource.loadDocuments(this.documentResource);
  }

  onStorageChange(filtervalue: string) {
    if (filtervalue) {
      this.documentResource.location = filtervalue;
    } else {
      this.documentResource.location = '';
    }
    this.documentResource.skip = 0;
    this.paginator.pageIndex = 0;
    this.dataSource.loadDocuments(this.documentResource);
  }

  onClientChange(filterValue: string) {
    if (filterValue) {
      this.documentResource.clientId = filterValue;
    } else {
      this.documentResource.clientId = '';
    }
    this.documentResource.skip = 0;
    this.paginator.pageIndex = 0;
    this.dataSource.loadDocuments(this.documentResource);
  }

  onDocumentStatusChange(filterValue: string) {
    if (filterValue) {
      this.documentResource.statusId = filterValue;
    } else {
      this.documentResource.statusId = '';
    }
    this.documentResource.skip = 0;
    this.paginator.pageIndex = 0;
    this.dataSource.loadDocuments(this.documentResource);
  }

  getResourceParameter() {
    this.sub$.sink = this.dataSource.responseHeaderSubject$.subscribe(
      (c: ResponseHeader) => {
        if (c) {
          this.documentResource.pageSize = c.pageSize;
          this.documentResource.skip = c.skip;
          this.documentResource.totalCount = c.totalCount;
        }
      }
    );
  }

  archiveDocument(document: DocumentInfo) {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_ARCHIVE'),
        document.name
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.sub$.sink = this.documentService
            .archiveDocument(document.id)
            .subscribe(() => {
              this.addDocumentTrail(
                document.id,
                DocumentOperation.Archived.toString()
              );
              this.toastrService.success(
                this.translationService.getValue(
                  'DOCUMENT_ARCHIVED_SUCCESSFULLY'
                )
              );
              this.dataSource.loadDocuments(this.documentResource);
            });
        }
      });
  }

  deleteDocument(document: DocumentInfo) {
    const dialogRef = this.dialog.open(DocumentDeleteDialogComponent, {
      width: '50vw',
      maxHeight: '70vh',
    });

    dialogRef.afterClosed().subscribe((isTrue: boolean) => {
      if (isTrue) {
        this.sub$.sink = this.documentService
          .deleteDocument(document.id)
          .subscribe(() => {
            this.addDocumentTrail(
              document.id,
              DocumentOperation.Deleted.toString()
            );
            this.toastrService.success(
              this.translationService.getValue('DOCUMENT_DELETED_SUCCESSFULLY')
            );
            this.dataSource.loadDocuments(this.documentResource);
          });
      }
    });
  }

  getDocuments(): void {
    this.sub$.sink = this.documentService
      .getDocuments(this.documentResource)
      .subscribe(
        (resp: HttpResponse<DocumentInfo[]>) => {
          const paginationParam = JSON.parse(
            resp.headers.get('X-Pagination')
          ) as ResponseHeader;
          this.documentResource.pageSize = paginationParam.pageSize;
          this.documentResource.skip = paginationParam.skip;
          this.documents = [...resp.body];
        },
      );
  }

  editDocument(documentInfo: DocumentInfo) {
    const documentCategories: DocumentCategory = {
      document: documentInfo,
      categories: this.categoryStore.categories(),
      clients: this.clientStore.clients(),
    };
    const dialogRef = this.dialog.open(DocumentEditComponent, {
      width: '600px',
      data: Object.assign({}, documentCategories),
    });

    this.sub$.sink = dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'loaded') {
        this.dataSource.loadDocuments(this.documentResource);
      }
    });
  }

  addComment(document: Document) {
    const dialogRef = this.dialog.open(DocumentCommentComponent, {
      width: '800px',
      maxHeight: '70vh',
      data: Object.assign({}, document),
    });

    this.sub$.sink = dialogRef.afterClosed().subscribe((isCommentChanged: boolean) => {
      if (isCommentChanged) {
        this.dataSource.loadDocuments(this.documentResource);
      }
    });
  }

  manageDocumentPermission(documentInfo: DocumentInfo) {
    this.dialog.open(DocumentPermissionListComponent, {
      data: documentInfo,
      width: '80vw',
      maxHeight: '80vh',
    });
  }
  onSharedSelectDocument() {
    const dialogRef = this.dialog.open(DocumentPermissionMultipleComponent, {
      data: this.selection.selected,
      width: '80vw',
      maxHeight: '80vh',
    });
    this.sub$.sink = dialogRef.afterClosed().subscribe((result: boolean) => {
      this.selection.clear();
    });
  }

  uploadNewVersion(document: Document) {
    const dialogRef = this.dialog.open(DocumentUploadNewVersionComponent, {
      width: '800px',
      maxHeight: '70vh',
      data: Object.assign({}, document),
    });

    this.sub$.sink = dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.dataSource.loadDocuments(this.documentResource);
      }
    });
  }

  downloadDocument(documentInfo: DocumentInfo) {
    const docuView: DocumentView = {
      documentId: documentInfo.id,
      name: '',
      extension: documentInfo.url.split('.')[1],
      isVersion: false,
      isFromPublicPreview: false,
      isPreviewDownloadEnabled: false,
      isFromFileRequest: false,
    };
    this.sub$.sink = this.commonService.downloadDocument(docuView).subscribe(
      (event: HttpEvent<Blob>) => {
        if (event.type === HttpEventType.Response) {
          this.addDocumentTrail(
            documentInfo.id,
            DocumentOperation.Download.toString()
          );
          this.downloadFile(event, documentInfo);
        }
      },
      () => {
        this.toastrService.error(
          this.translationService.getValue('ERROR_WHILE_DOWNLOADING_DOCUMENT')
        );
      }
    );
  }

  addDocumentTrail(id: string, operation: string) {
    const objDocumentAuditTrail: DocumentAuditTrail = {
      documentId: id,
      operationName: operation,
    };
    this.sub$.sink = this.commonService
      .addDocumentAuditTrail(objDocumentAuditTrail)
      .subscribe();
  }

  sendEmail(documentInfo: DocumentInfo) {
    this.dialog.open(SendEmailComponent, {
      data: documentInfo,
      width: '80vw',
    });
  }

  addReminder(documentInfo: DocumentInfo) {
    this.dialog.open(DocumentReminderComponent, {
      data: documentInfo,
      width: '80vw',
      maxHeight: '90vh',
    });
  }

  onDocumentView(document: DocumentInfo) {
    const urls = document.url.split('.');
    const extension = urls[1];
    const documentView: DocumentView = {
      documentId: document.id,
      name: document.name,
      extension: extension,
      isVersion: false,
      isFromPublicPreview: false,
      isPreviewDownloadEnabled: false,
      isFromFileRequest: false,
    };
    this.overlay.open(BasePreviewComponent, {
      position: 'center',
      origin: 'global',
      panelClass: ['file-preview-overlay-container', 'white-background'],
      data: documentView,
    });
  }

  private downloadFile(data: HttpResponse<Blob>, documentInfo: DocumentInfo) {
    const downloadedFile = new Blob([data.body], { type: data.body.type });
    const urls = documentInfo.name.split('.');
    const extension = documentInfo.url.split('.');
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.download = `${urls[0]}.${extension[1]}`;
    a.href = URL.createObjectURL(downloadedFile);
    a.target = '_blank';
    a.click();
    document.body.removeChild(a);
  }

  onVersionHistoryClick(document: DocumentInfo): void {
    const documentInfo = this.clonerService.deepClone<DocumentInfo>(document);
    this.sub$.sink = this.documentService
      .getDocumentVersion(document.id)
      .subscribe((documentVersions: DocumentVersion[]) => {
        documentInfo.documentVersions = documentVersions;
        const dialogRef = this.dialog.open(DocumentVersionHistoryComponent, {
          width: '800px',
          maxHeight: '70vh',
          panelClass: 'full-width-dialog',
          data: Object.assign({}, documentInfo),
        });
        dialogRef.afterClosed().subscribe((isRestore: boolean) => {
          if (isRestore) {
            this.dataSource.loadDocuments(this.documentResource);
          }
        });
      });
  }

  onCreateShareableLink(document: DocumentInfo) {
    this.sub$.sink = this.documentService
      .getDocumentShareableLink(document.id)
      .subscribe((link: DocumentShareableLink) => {
        this.dialog.open(SharableLinkComponent, {
          width: '500px',
          data: { document, link },
        });
      });
  }

  addIndexing(document: DocumentInfo) {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue(
          'ARE_YOU_SURE_WANT_TO_ADD_DOCUMENT_PAGE_INDEXING'
        ),
        document.name
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.documentService
            .addDcoumentToDeepSearch(document.id)
            .subscribe(() => {
              this.toastrService.success(
                this.translationService.getValue(
                  'DOCUMENT_PAGE_INDEXING_IS_ADDED'
                )
              );
            });
        }
      });
  }

  removeIndexing(document: DocumentInfo) {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(
        `${this.translationService.getValue(
          'ARE_YOU_SURE_WANT_TO_REMOVE_DOCUMENT_PAGE_INDEXING'
        )} ${document.name}`,
        this.translationService.getValue('DEEP_SEARCH_REMOVE_NOTE')
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.documentService
            .removeDocumentFromDeepSearch(document.id)
            .subscribe(() => {
              this.toastrService.success(
                this.translationService.getValue(
                  'DOCUMENT_PAGE_INDEXING_IS_DELETED'
                )
              );
            });
        }
      });
  }

  getCurrentDate(): Date {
    return new Date();
  }

  isCompletedOrInProgress(statusName: string): boolean {
    if (!statusName) return false;
    
    const lowerStatus = statusName.toLowerCase();
    return lowerStatus === 'in progress' || 
           lowerStatus === 'completed' ||
           lowerStatus === 'complete' ||
           lowerStatus === 'done' ||
           lowerStatus === 'finished';
  }
}
