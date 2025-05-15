import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DocumentResource } from '@core/domain-classes/document-resource';
import { BaseComponent } from 'src/app/base.component';
import { ArchivedDocumentDataSource } from './archived-document-datasource';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Category } from '@core/domain-classes/category';
import { ResponseHeader } from '@core/domain-classes/document-header';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { ClonerService } from '@core/services/clone.service';
import { OverlayPanel } from '@shared/overlay-panel/overlay-panel.service';
import {
  Observable,
  merge,
  tap,
  fromEvent,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import { ArchiveDocumentService } from '../archive-document.service';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { TranslationService } from '@core/services/translation.service';
import { DocumentView } from '@core/domain-classes/document-view';
import { BasePreviewComponent } from '@shared/base-preview/base-preview.component';
import { CommonService } from '@core/services/common.service';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { DocumentOperation } from '@core/domain-classes/document-operation';
import { ToastrService } from 'ngx-toastr';
import { DocumentService } from 'src/app/document/document.service';
import { MatDialog } from '@angular/material/dialog';
import { DocumentDeleteDialogComponent } from 'src/app/document-delete-dialog/document-delete-dialog.component';
import { Direction } from '@angular/cdk/bidi';
import { DocumentStatusStore } from 'src/app/document-status/store/document-status.store';
import { CategoryStore } from 'src/app/category/store/category-store';

@Component({
  selector: 'app-archived-document-list',
  templateUrl: './archived-document-list.component.html',
  styleUrls: ['./archived-document-list.component.scss'],
})
export class ArchivedDocumentListComponent
  extends BaseComponent
  implements OnInit, AfterViewInit {
  dataSource: ArchivedDocumentDataSource;
  documents: DocumentInfo[] = [];
  displayedColumns: string[] = [
    'action',
    'name',
    'categoryName',
    'location',
    'statusName',
    'deletedAt',
    'deletedBy',
  ];
  footerToDisplayed = ['footer'];
  documentResource: DocumentResource;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: ElementRef;
  @ViewChild('metatag') metatag: ElementRef;
  selection = new SelectionModel<DocumentInfo>(true, []);
  max = new Date();
  direction: Direction;
  documentStatusStore = inject(DocumentStatusStore);
  categoryStore = inject(CategoryStore);

  constructor(
    private archiveDocumentService: ArchiveDocumentService,
    private documentService: DocumentService,
    public overlay: OverlayPanel,
    public clonerService: ClonerService,
    private commonDialogService: CommonDialogService,
    private translationService: TranslationService,
    private commonService: CommonService,
    private toastrService: ToastrService,
    private dialog: MatDialog
  ) {
    super();
    this.documentResource = new DocumentResource();
    this.documentResource.pageSize = 10;
    this.documentResource.orderBy = 'deletedAt desc';
  }

  ngOnInit(): void {
    this.dataSource = new ArchivedDocumentDataSource(
      this.archiveDocumentService
    );
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

  onDocumentStatusChange(filtervalue: string) {
    if (filtervalue) {
      this.documentResource.statusId = filtervalue;
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

  restoreDocument(id: string) {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_RESOTRE')
      )
      .subscribe((isTrue) => {
        if (isTrue) {
          this.sub$.sink = this.archiveDocumentService
            .restoreDocument(id)
            .subscribe(() => {
              this.addDocumentTrail(id, DocumentOperation.Restored.toString());
              this.toastrService.success(
                this.translationService.getValue(
                  'DOCUMENT_RESTORED_SUCCESSFULLY'
                )
              );
              this.dataSource.loadDocuments(this.documentResource);
            });
        }
      });
  }

  deleteDocument(id: string) {
    const dialogRef = this.dialog.open(DocumentDeleteDialogComponent, {
      width: '50vw',
      maxHeight: '70vh',
    });

    dialogRef.afterClosed().subscribe((isTrue) => {
      if (isTrue) {
        this.sub$.sink = this.documentService
          .deleteDocument(id)
          .subscribe(() => {
            this.addDocumentTrail(id, DocumentOperation.Deleted.toString());
            this.toastrService.success(
              this.translationService.getValue('DOCUMENT_DELETED_SUCCESSFULLY')
            );
            this.dataSource.loadDocuments(this.documentResource);
          });
      }
    });
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
}
