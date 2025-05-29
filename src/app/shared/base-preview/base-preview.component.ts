import { Direction } from '@angular/cdk/bidi';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { DocumentOperation } from '@core/domain-classes/document-operation';
import { DocumentView } from '@core/domain-classes/document-view';
import { ClonerService } from '@core/services/clone.service';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { environment } from '@environments/environment';
import { OVERLAY_PANEL_DATA } from '@shared/overlay-panel/overlay-panel-data';
import { OverlayPanelRef } from '@shared/overlay-panel/overlay-panel-ref';
import { OverlayPanel } from '@shared/overlay-panel/overlay-panel.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';

@Component({
  selector: 'app-base-preview',
  templateUrl: './base-preview.component.html',
  styleUrls: ['./base-preview.component.scss'],
})
export class BasePreviewComponent extends BaseComponent implements OnInit {
  type = '';
  currentDoc: DocumentView;
  isDownloadFlag = false;
  direction: Direction;

  constructor(
    public overlay: OverlayPanel,
    private commonService: CommonService,
    @Inject(OVERLAY_PANEL_DATA) public data: DocumentView,
    private clonerService: ClonerService,
    private overlayRef: OverlayPanelRef,
    private toastrService: ToastrService,
    private translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.onDocumentView(this.data);
    this.getLangDir();
  }

  getLangDir() {
    this.sub$.sink = this.translationService.lanDir$.subscribe(
      (c: Direction) => {
        this.direction = c;
      }
    );
  }

  closeToolbar() {
    this.overlayRef.close();
  }

  onDocumentView(document: DocumentView) {
    this.currentDoc = this.clonerService.deepClone<DocumentView>(document);
    const allowExtesions = environment.allowExtesions;
    const allowTypeExtenstion = allowExtesions.find((c) =>
      c.extentions.find(
        (ext) => ext.toLowerCase() === document.extension.toLowerCase()
      )
    );
    this.type = allowTypeExtenstion ? allowTypeExtenstion.type : '';
    if (!document.isFromPublicPreview && !document.isFromFileRequest) {
      this.getIsDownloadFlag(document);
      this.addDocumentTrail(
        document.isVersion ? document.id : document.documentId,
        DocumentOperation.Read.toString()
      );
    } else {
      this.isDownloadFlag = document.isPreviewDownloadEnabled;
    }
  }

  addDocumentTrail(documentId: string, operation: string) {
    const objDocumentAuditTrail: DocumentAuditTrail = {
      documentId: documentId,
      operationName: operation,
    };

    this.sub$.sink = this.commonService
      .addDocumentAuditTrail(objDocumentAuditTrail)
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .subscribe(() => {});
  }

  getIsDownloadFlag(document: DocumentView) {
    this.sub$.sink = this.commonService
      .isDownloadFlag(this.data.isVersion ? document.id : document.documentId)
      .subscribe((c) => {
        this.isDownloadFlag = c;
      });
  }

  downloadDocument(documentView: DocumentView) {
    const docView = this.clonerService.deepClone<DocumentView>(this.currentDoc);
    docView.isVersion = documentView.isVersion;
    this.sub$.sink = this.commonService.downloadDocument(docView).subscribe({
      next: (event: HttpEvent<Blob>) => {
        if (event.type === HttpEventType.Response) {
          if (!documentView.isFromPublicPreview && !documentView.isFromFileRequest) {
            this.addDocumentTrail(
              documentView.isVersion
                ? documentView.id
                : documentView.documentId,
              DocumentOperation.Download.toString()
            );
          }
          this.downloadFile(event, documentView);
        }
      },
      error: () => {
        this.toastrService.error(
          this.translationService.getValue('ERROR_WHILE_DOWNLOADING_DOCUMENT')
        );
      },
    });
  }

  private downloadFile(data: HttpResponse<Blob>, documentView: DocumentView) {
    const downloadedFile = new Blob([data.body], { type: data.body.type });
    const urls = documentView.name.split('.');
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.download = `${urls[0]}.${documentView.extension}`;
    a.href = URL.createObjectURL(downloadedFile);
    a.target = '_blank';
    a.click();
    document.body.removeChild(a);
  }
}
