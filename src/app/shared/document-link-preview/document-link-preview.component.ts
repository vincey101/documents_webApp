import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { DocumentShareableLink } from '@core/domain-classes/document-shareable-link';
import { ClonerService } from '@core/services/clone.service';
import { CommonService } from '@core/services/common.service';
import { OverlayPanel } from '@shared/overlay-panel/overlay-panel.service';
import { ToastrService } from 'ngx-toastr';
import { DocumentLinkPreviewPasswordComponent } from './document-link-preview-password/document-link-preview-password.component';
import { DocumentService } from 'src/app/document/document.service';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentView } from '@core/domain-classes/document-view';
import { BasePreviewComponent } from '@shared/base-preview/base-preview.component';

@Component({
  selector: 'app-document-link-preview',
  templateUrl: './document-link-preview.component.html',
  styleUrls: ['./document-link-preview.component.scss'],
})
export class DocumentLinkPreviewComponent implements OnInit {
  isLinkExpired = false;
  code: string;
  constructor(
    private route: ActivatedRoute,
    public toastrService: ToastrService,
    public documentService: DocumentService,
    public commonService: CommonService,
    public overlay: OverlayPanel,
    public dialog: MatDialog,
    public commonDialogService: CommonDialogService,
    public clonerService: ClonerService
  ) {}

  ngOnInit(): void {
    this.code = this.route.snapshot.params['code'];
    this.getLinkInfo();
  }

  getLinkInfo() {
    this.documentService.getLinkInfoByCode(this.code).subscribe({
      next: (info: DocumentShareableLink) => {
        if (info.isLinkExpired) {
          this.isLinkExpired = true;
        } else {
          this.getDocument(info);
        }
      },
      error: () => {
        this.isLinkExpired = true;
      },
    });
  }

  getDocument(info: DocumentShareableLink) {
    this.documentService.getDocumentByCode(info.linkCode).subscribe(
      (document: DocumentInfo) => {
        const urls = document.url.split('.');
        const extension = urls[1];
        const documentView: DocumentView = {
          documentId: info.linkCode,
          name: document.name,
          extension: extension,
          isVersion: false,
          isFromPublicPreview: true,
          isPreviewDownloadEnabled: document.isAllowDownload,
          isFromFileRequest: false,
        };
        if (info.hasPassword) {
          this.openForgotPasswordDialog(info, documentView);
        } else {
          this.overlay.open(BasePreviewComponent, {
            position: 'center',
            origin: 'global',
            panelClass: ['file-preview-overlay-container', 'white-background'],
            data: documentView,
            closeOnBackdropClick: false,
          });
        }
      },
      () => {
        this.isLinkExpired = true;
      }
    );
  }

  openForgotPasswordDialog(
    info: DocumentShareableLink,
    documentView: DocumentView
  ) {
    const dialogRef = this.dialog.open(DocumentLinkPreviewPasswordComponent, {
      data: { linkInfo: info, docView: documentView },
      disableClose: true,
      backdropClass: 'black-background',
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((password: string) => {
      documentView.linkPassword = password;
      const overlayRef = this.overlay.open(BasePreviewComponent, {
        position: 'center',
        origin: 'global',
        panelClass: ['file-preview-overlay-container', 'white-background'],
        data: documentView,
        closeOnBackdropClick: false,
      });

      overlayRef.afterClosed().subscribe(() => {
        this.openForgotPasswordDialog(info, documentView);
      });
    });
  }
}
