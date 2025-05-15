import { Component, inject, Input, OnInit } from '@angular/core';
import { FileRequestInfo } from '../../core/domain-classes/file-request-info';
import { FileRequestDocument } from '../../core/domain-classes/file-request-document';
import { FileRequestDocumentService } from '../file-request-document.service';
import { CommonDialogService } from '../../core/common-dialog/common-dialog.service';
import { TranslationService } from '../../core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { CommonError } from '../../core/error-handler/common-error';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FeatherModule } from 'angular-feather';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from '@shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { DocumentView } from '@core/domain-classes/document-view';
import { BasePreviewComponent } from '@shared/base-preview/base-preview.component';
import { OverlayPanel } from '@shared/overlay-panel/overlay-panel.service';
import { FileRequestDocumentStatusPipe } from '../file-request-document-status.pipe';
import { PipesModule } from '@shared/pipes/pipes.module';
import { MatDialog } from '@angular/material/dialog';
import { ApproveDocumentComponent } from '../approve-document/approve-document.component';
import { FileRequestDocumentStatus } from '@core/domain-classes/file-request-document-status.enum';
import { StatusColorDirective } from '../status-color.directive';
import { SecurityService } from '@core/security/security.service';

@Component({
  selector: 'app-file-request-document-list',
  standalone: true,
  imports: [FormsModule,
    TranslateModule,
    CommonModule,
    RouterModule,
    MatButtonModule,
    ReactiveFormsModule,
    FeatherModule,
    MatIconModule,
    MatCardModule,
    SharedModule,
    MatFormFieldModule,
    PipesModule,
    FileRequestDocumentStatusPipe,
    StatusColorDirective,
    MatTableModule,
    MatInputModule],
  templateUrl: './file-request-document-list.component.html',
  styleUrl: './file-request-document-list.component.scss'
})
export class FileRequestDocumentListComponent implements OnInit {
  @Input() fileRequestInfo: FileRequestInfo;
  fileRequestDocuments: FileRequestDocument[] = [];
  fileRequestDocumentStatus = FileRequestDocumentStatus;
  displayedColumns: string[] = ['action', 'fileUrl', 'status', 'createdDate', 'reason'];
  securityService = inject(SecurityService);

  private fileRequestDocumentService = inject(FileRequestDocumentService);
  private overlay = inject(OverlayPanel);
  private commonDialogService = inject(CommonDialogService);
  private translationService = inject(TranslationService);
  private toastrService = inject(ToastrService);
  private dialog = inject(MatDialog);


  ngOnInit(): void {
    this.getFileRequestDocuments();
  }

  onDocumentView(fileRequestDocument: FileRequestDocument) {
    const fileUrl = fileRequestDocument?.url.split('.');
    const extension = fileUrl[1];
    const documentView: DocumentView = {
      documentId: fileRequestDocument.id,
      name: fileRequestDocument.name,
      extension: extension,
      isVersion: false,
      isFromPublicPreview: false,
      isPreviewDownloadEnabled: false,
      isFromFileRequest: true,
    };
    this.overlay.open(BasePreviewComponent, {
      position: 'center',
      origin: 'global',
      panelClass: ['file-preview-overlay-container', 'white-background'],
      data: documentView,
    });
  }

  getFileRequestDocuments() {
    const fileRequestId = this.fileRequestInfo?.id;
    if (fileRequestId) {
      this.fileRequestDocumentService.getFileRequestDocument(fileRequestId)
        .subscribe({
          next: (response: FileRequestDocument[] | CommonError) => {
            if (Array.isArray(response)) {
              if (response.length > 0) {
                this.fileRequestDocuments = response;
              }
            }
          },
          error: (error: any) => { }
        });
    }
  }

  approveDocument(fileRequestDocument: FileRequestDocument) {
    const dialogRef = this.dialog.open(ApproveDocumentComponent, {
      data: fileRequestDocument,
      maxWidth: '60vw',
      maxHeight: '80vh',
    });
    dialogRef.afterClosed().subscribe((result: string) => {
      if (result) {
        this.getFileRequestDocuments();
      }
    });
  }

  rejectFileRequestDocument(fileRequestDocument: FileRequestDocument) {
    this.commonDialogService.deleteConfirmWithCommentDialog(
      `${this.translationService.getValue(
        'ARE_YOU_SURE_YOU_WANT_TO_REJECT'
      )} ${fileRequestDocument.name} ?`
    ).subscribe((commentFlag: any) => {
      if (commentFlag) {
        fileRequestDocument.reason = commentFlag.comment;
        this.fileRequestDocumentService.rejectFileRequestDocument(fileRequestDocument)
          .subscribe({
            next: (response: FileRequestDocument) => {
              if (response) {
                this.toastrService.success(
                  this.translationService.getValue('FILE_REJECTED_SUCCESSFULLY')
                );
                this.getFileRequestDocuments();
              }
            }
          });
      }
    });
  }
}
