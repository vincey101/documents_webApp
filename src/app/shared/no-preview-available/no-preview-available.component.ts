import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { DocumentOperation } from '@core/domain-classes/document-operation';
import { DocumentView } from '@core/domain-classes/document-view';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';

@Component({
  selector: 'app-no-preview-available',
  templateUrl: './no-preview-available.component.html',
  styleUrls: ['./no-preview-available.component.scss'],
})
export class NoPreviewAvailableComponent extends BaseComponent {
  @Input() document: DocumentView;
  @Input() isDownloadFlag = false;
  constructor(
    private translationService: TranslationService,
    private toastrService: ToastrService,
    private commonService: CommonService
  ) {
    super();
  }

  download() {
    this.sub$.sink = this.commonService
      .downloadDocument(this.document)
      .subscribe({
        next: (event: HttpEvent<Blob>) => {
          if (event.type === HttpEventType.Response) {
            this.addDocumentTrail(
              this.document.isVersion
                ? this.document.id
                : this.document.documentId,
              DocumentOperation.Download.toString()
            );
            this.downloadFile(event, this.document);
          }
        },
        error: () => {
          this.toastrService.error(
            this.translationService.getValue('ERROR_WHILE_DOWNLOADING_DOCUMENT')
          );
        },
      });
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

  private downloadFile(data: HttpResponse<Blob>, doc: DocumentView) {
    const downloadedFile = new Blob([data.body], { type: data.body.type });
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.download = doc.name;
    a.href = URL.createObjectURL(downloadedFile);
    a.target = '_blank';
    a.click();
    document.body.removeChild(a);
  }
}
