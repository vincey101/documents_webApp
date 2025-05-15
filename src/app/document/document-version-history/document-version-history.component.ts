import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentOperation } from '@core/domain-classes/document-operation';
import { DocumentView } from '@core/domain-classes/document-view';
import { DocumentVersion } from '@core/domain-classes/documentVersion';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { BasePreviewComponent } from '@shared/base-preview/base-preview.component';
import { OverlayPanel } from '@shared/overlay-panel/overlay-panel.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { DocumentService } from '../document.service';
import { SecurityService } from '@core/security/security.service';

@Component({
  selector: 'app-document-version-history',
  templateUrl:'./document-version-history.component.html',
  styleUrls: ['./document-version-history.component.scss'],
})
export class DocumentVersionHistoryComponent extends BaseComponent {
  documentVersions: DocumentVersion[] = [];
  isDownloadFlag = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DocumentInfo,
    private overlay: OverlayPanel,
    public dialogRef: MatDialogRef<DocumentVersionHistoryComponent>,
    private toastrService: ToastrService,
    private documentService: DocumentService,
    private commonService: CommonService,
    private translationService: TranslationService,
    private commandDialogService: CommonDialogService,
    private securityService: SecurityService
  ) {
    super();
    this.getIsDownloadFlag();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onDocumentView(document: DocumentInfo) {
    const urls = document.url.split('.');
    const extension = urls[1];
    const documentView: DocumentView = {
      documentId: document.id,
      name: this.data.name,
      extension: extension,
      isVersion: true,
      id: this.data.id,
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

  restoreDocumentVersion(version: DocumentVersion) {
    this.sub$.sink = this.commandDialogService
      .deleteConformationDialog(
        `${this.translationService.getValue(
          'ARE_YOU_SURE_YOU_WANT_TO_RESTORE_THIS_TO_CURRENT_VERSION'
        )}?`
      )
      .subscribe((isTrue) => {
        if (isTrue) {
          this.sub$.sink = this.documentService
            .restoreDocumentVersion(this.data.id, version.id)
            .subscribe(() => {
              this.toastrService.success(
                this.translationService.getValue(
                  'VERSION_RESTORED_SUCCESSFULLY'
                )
              );
              this.dialogRef.close(true);
            });
        }
      });
  }

  downloadDocument(version: DocumentVersion) {
    const docuView: DocumentView = {
      documentId: version.id,
      name: '',
      extension: version.url.split('.')[1],
      isVersion: true,
      isFromPublicPreview: false,
      isPreviewDownloadEnabled: false,
      isFromFileRequest: false,
    };
    this.sub$.sink = this.commonService.downloadDocument(docuView).subscribe(
      (event: HttpEvent<Blob>) => {
        if (event.type === HttpEventType.Response) {
          this.addDocumentTrail(
            this.data.id,
            DocumentOperation.Download.toString()
          );
          this.downloadFile(event, version);
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

  private downloadFile(data: HttpResponse<Blob>, version: DocumentVersion) {
    const downloadedFile = new Blob([data.body], { type: data.body.type });
    const urls = this.data.name.split('.');
    const extension = version.url.split('.');
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.download = `${urls[0]}.${extension[1]}`;
    a.href = URL.createObjectURL(downloadedFile);
    a.target = '_blank';
    a.click();
    document.body.removeChild(a);
  }

  getIsDownloadFlag() {
    if (this.securityService.hasClaim('ALL_DOCUMENTS_DOWNLOAD_DOCUMENT')) {
      this.isDownloadFlag = true;
      return;
    }

    this.sub$.sink = this.commonService
      .isDownloadFlag(this.data.id)
      .subscribe((c) => {
        this.isDownloadFlag = c;
      });
  }
}
