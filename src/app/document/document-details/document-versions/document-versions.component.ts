import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DocumentVersion } from '@core/domain-classes/documentVersion';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentService } from '../../document.service';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DocumentView } from '@core/domain-classes/document-view';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { OverlayPanel } from '@shared/overlay-panel/overlay-panel.service';
import { BasePreviewComponent } from '@shared/base-preview/base-preview.component';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { DocumentOperation } from '@core/domain-classes/document-operation';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from '@core/services/translation.service';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { CommonService } from '@core/services/common.service';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { SharedModule } from '@shared/shared.module';
import { DocumentUploadNewVersionComponent } from '../../document-upload-new-version/document-upload-new-version.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-document-versions',
  standalone: true,
  imports: [TranslateModule,
    NgFor,
    NgIf,
    MatIconModule,
    SharedModule
  ],
  templateUrl: './document-versions.component.html',
  styleUrl: './document-versions.component.scss'
})
export class DocumentVersionsComponent implements OnChanges {
  @Input() documentId: string = '';
  @Input() data: DocumentInfo;
  @Input() shouldLoad = false;
  documentVersions: DocumentVersion[] = [];

  overlay = inject(OverlayPanel);
  toastrService = inject(ToastrService);
  translationService = inject(TranslationService);
  commonService = inject(CommonService);
  documentService = inject(DocumentService);
  commandDialogService = inject(CommonDialogService);
  dialog = inject(MatDialog);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shouldLoad'] && this.shouldLoad) {
      this.getDocumentVersions();
    }
  }

  getDocumentVersions() {
    this.documentService
      .getDocumentVersion(this.documentId)
      .subscribe((documentVersions: DocumentVersion[]) => {
        this.documentVersions = documentVersions;
      });

  }

  uploadNewVersion() {
    const dialogRef = this.dialog.open(DocumentUploadNewVersionComponent, {
      width: '800px',
      maxHeight: '70vh',
      data: Object.assign({}, this.data),
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.getDocumentVersions();
      }
    });
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
    this.commonService.downloadDocument(docuView).subscribe(
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
    this.commonService
      .addDocumentAuditTrail(objDocumentAuditTrail)
      .subscribe();
  }

  restoreDocumentVersion(version: DocumentVersion) {
    this.commandDialogService
      .deleteConformationDialog(
        `${this.translationService.getValue(
          'ARE_YOU_SURE_YOU_WANT_TO_RESTORE_THIS_TO_CURRENT_VERSION'
        )}?`
      )
      .subscribe((isTrue) => {
        if (isTrue) {
          this.documentService
            .restoreDocumentVersion(this.data.id, version.id)
            .subscribe(() => {
              this.toastrService.success(this.translationService.getValue('VERSION_RESTORED_SUCCESSFULLY'));
              this.getDocumentVersions();
            });
        }
      });
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
}
