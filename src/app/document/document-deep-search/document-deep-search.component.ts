import { SelectionModel } from '@angular/cdk/collections';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { Category } from '@core/domain-classes/category';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { DocumentCategory } from '@core/domain-classes/document-category';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentOperation } from '@core/domain-classes/document-operation';
import { DocumentView } from '@core/domain-classes/document-view';
import { DocumentVersion } from '@core/domain-classes/documentVersion';
import { CategoryService } from 'src/app/category/category.service';
import { ClonerService } from '@core/services/clone.service';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { BasePreviewComponent } from '@shared/base-preview/base-preview.component';
import { OverlayPanel } from '@shared/overlay-panel/overlay-panel.service';
import { ToastrService } from 'ngx-toastr';
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
import { DocumentDeleteDialogComponent } from 'src/app/document-delete-dialog/document-delete-dialog.component';
import { SharableLinkComponent } from '../sharable-link/sharable-link.component';
import { DocumentShareableLink } from '@core/domain-classes/document-shareable-link';

@Component({
  selector: 'app-document-deep-search',
  templateUrl: './document-deep-search.component.html',
  styleUrl: './document-deep-search.component.scss',
})
export class DocumentDeepSearchComponent
  extends BaseComponent
  implements OnInit {
  documents: DocumentInfo[] = [];
  displayedColumns: string[] = [
    'select',
    'action',
    'name',
    'categoryName',
    'location',
    'companyName',
    'statusName',
    'createdDate',
    'createdBy',
  ];
  dataSource = [];
  categories: Category[] = [];
  selection = new SelectionModel<DocumentInfo>(true, []);
  searchQuery = '';

  constructor(
    private documentService: DocumentService,
    private commonDialogService: CommonDialogService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    public overlay: OverlayPanel,
    public clonerService: ClonerService,
    private translationService: TranslationService,
    private commonService: CommonService,
    private toastrService: ToastrService
  ) {
    super();
  }

  ngOnInit(): void {
    this.getCategories();
  }

  searchDocuments(showNotFoundMessage = false): void {
    if (this.searchQuery) {
      this.sub$.sink = this.documentService
        .getDocumentsByDeepSearch(this.searchQuery)
        .subscribe({
          next: (resp: DocumentInfo[]) => {
            if (resp.length > 0) {
              this.dataSource = [...resp];
            } else {
              this.dataSource = [];
              if (showNotFoundMessage) {
                this.toastrService.warning(
                  this.translationService.getValue('NO_DOCUMENTS_FOUND')
                );
              }
            }
          }
        });
    } else {
      this.dataSource = [];
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected === numRows;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.forEach((row) => this.selection.select(row));
  }

  getCategories(): void {
    this.categoryService.getAllCategoriesForDropDown().subscribe((c) => {
      this.categories = [...c];
    });
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
              this.searchDocuments();
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
            this.searchDocuments();
          });
      }
    });
  }

  editDocument(documentInfo: DocumentInfo) {
    const documentCategories: DocumentCategory = {
      document: documentInfo,
      categories: this.categories,
      clients:[]
    };
    const dialogRef = this.dialog.open(DocumentEditComponent, {
      width: '600px',
      data: Object.assign({}, documentCategories),
    });

    this.sub$.sink = dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'loaded') {
        this.searchDocuments();
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
        this.searchDocuments();
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
        this.searchDocuments();
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
      maxHeight: '80vh',
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
            this.searchDocuments();
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
              this.searchDocuments();
              this.toastrService.success(
                this.translationService.getValue(
                  'DOCUMENT_PAGE_INDEXING_IS_DELETED'
                )
              );
            });
        }
      });
  }
}
