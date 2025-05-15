import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit, Renderer2 } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PipesModule } from '@shared/pipes/pipes.module';
import { SharedModule } from '@shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FileRequestService } from '../../file-request.service';
import { FileRequestInfo } from '@core/domain-classes/file-request-info';
import { TranslateModule } from '@ngx-translate/core';
import { FileRequestDocumentService } from '../../file-request-document.service';
import { FileRequestDocumentInfo } from '../../../core/domain-classes/file-request-document-info';
import { AllowFileExtension } from '@core/domain-classes/allow-file-extension';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { FileRequestDocument } from '../../../core/domain-classes/file-request-document';
import { FileType } from '@core/domain-classes/file-type.enum';
import { FileRequestDocumentStatusPipe } from '../../file-request-document-status.pipe';
import { SecurityService } from '@core/security/security.service';
import { StatusColorDirective } from '../../status-color.directive';
import { BaseComponent } from 'src/app/base.component';

@Component({
  selector: 'app-file-request-link-preview',
  standalone: true,
  imports: [
    SharedModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    OverlayModule,
    NgxDocViewerModule,
    NgxExtendedPdfViewerModule,
    PipesModule,
    MatDialogModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    StatusColorDirective,
    MatFormFieldModule,
    FeatherModule,
    FileRequestDocumentStatusPipe
  ],
  templateUrl: './file-request-link-preview.component.html',
  styleUrls: ['./file-request-link-preview.component.scss'],
})
export class FileRequestLinkPreviewComponent extends BaseComponent implements OnInit {
  @Input() documents: any[] = [];
  logoUrl?: string;
  isLinkExpired = false;
  fileRequestInfo: FileRequestInfo;
  fileRequestDocuments: FileRequestDocument[] = [];
  uploadForm: FormGroup;
  requiresPassword = false;
  isPasswordVerified = false;
  subject: string;
  requestedBy: string;
  extension: string;
  allowFileExtension: AllowFileExtension[] = [];
  uploadedFiles: File[] = [];
  uploadedFileNames: string[] = [];
  isLoading = false;

  get fileInputs(): FormArray {
    return this.uploadForm.get('files') as FormArray;
  }

  addFileInput() {
    this.fileInputs.push(this.createFileGroup());
  }

  removeFileInput(index: number) {
    if (index > 0) {
      this.fileInputs.removeAt(index);
      this.uploadedFiles.splice(index, 1);
      this.uploadedFileNames.splice(index, 1);
    }
  }
  documentLinkForm: FormGroup;
  isPasswordInvalid = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private fileRequestService: FileRequestService,
    private fileRequestDocumentService: FileRequestDocumentService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private translationService: TranslationService,
    private toastrService: ToastrService,
    private securityService: SecurityService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.createFileRequestLinkForm();
    this.uploadForm = this.fb.group({
      files: this.fb.array([this.createFileGroup()]),
    });

    this.sub$.sink = this.route.data.subscribe(
      (data: { fileRequest: FileRequestInfo }) => {
        if (data.fileRequest == null) {
          this.isLinkExpired = true;
          return;
        }
        this.isLinkExpired = data.fileRequest.isLinkExpired;
        if (!this.isLinkExpired) {
          if (data.fileRequest) {
            this.fileRequestInfo = data.fileRequest;
            this.fileRequestDocuments = data.fileRequest.fileRequestDocuments || [];
            this.requiresPassword = data.fileRequest.hasPassword;
          }
        };
      }
    );
    this.getAllAllowFileExtension();
    this.companyProfileSubscription();
  }

  getAllAllowFileExtension() {
    this.commonService.allowFileExtension$.subscribe(
      (allowFileExtension: AllowFileExtension[]) => {
        if (allowFileExtension) {
          this.allowFileExtension = allowFileExtension;
        }
      }
    );
  }

  createFileRequestLinkForm() {
    this.documentLinkForm = this.fb.group({
      password: ['', [Validators.required]],
    });
  }

  checkPassword() {
    if (this.documentLinkForm.valid) {
      const password = this.documentLinkForm.get('password').value;
      this.fileRequestService.verifyPassword(this.fileRequestInfo.id, password).subscribe({
        next: (result: boolean) => {
          this.isPasswordVerified = result;
          if (result) {
            this.documentLinkForm.reset();
          } else {
            this.toastrService.error(this.translationService.getValue('INVALID_PASSWORD'));
            this.documentLinkForm.get('password').setErrors({ invalid: true });
          }
        },
        error: () => {
          this.documentLinkForm.get('password').setErrors({ invalid: true });
        },
      });
    } else {
      this.documentLinkForm.markAllAsTouched();
    }
  }

  createFileGroup() {
    return this.fb.group({
      name: ['', [Validators.required]],
      file: ['', [Validators.required]],
    });
  }

  createBuildObject(): FileRequestDocumentInfo {
    const id = this.fileRequestInfo.id;
    const files = this.fileInputs.controls.map((x) => x.get('file').value);
    const names = this.fileInputs.controls.map((x) => x.get('name').value);
    const data: FileRequestDocumentInfo = {
      fileRequestId: id,
      files: files,
      names: names,
    };
    return data;
  }

  getLinkInfo() {
    this.fileRequestService.getFileRequestData(this.fileRequestInfo.id).subscribe({
      next: (fileRequestInfo: FileRequestInfo) => {
        this.isLinkExpired = fileRequestInfo.isLinkExpired;
        if (!this.isLinkExpired) {
          this.fileRequestInfo = fileRequestInfo;
          this.fileRequestDocuments = fileRequestInfo.fileRequestDocuments || [];
          this.requiresPassword = fileRequestInfo.hasPassword;
        }
      },
      error: () => {
        this.isLinkExpired = true;
      },
    });
  }

  onFileUpload() {
    if (this.fileRequestDocuments.length >= this.fileRequestInfo?.maxDocument) {
      this.toastrService.success(
        this.translationService.getValue('MAXIMUM_FILE_UPLOADED')
      );
      return;
    }
    if (this.uploadForm.valid) {
      this.isLoading = true;
      const fileRequestDocument: FileRequestDocumentInfo = {
        fileRequestId: this.fileRequestInfo.id,
        files: this.uploadedFiles,
        names: this.uploadedFileNames,
      };
      this.fileRequestDocumentService.addFileRequestDocument(fileRequestDocument)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.toastrService.success(
              this.translationService.getValue('FILE_UPLOADED_SUCCESSFULLY')
            );
            this.uploadedFiles = [];
            this.uploadedFileNames = [];
            this.fileInputs.clear();
            this.getLinkInfo();
          },
          error: () => {
            this.isLoading = false;
          },
        });
    } else {
      this.uploadForm.markAllAsTouched();
    }
  }

  async onFileSelected(event: Event, index: number) {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement?.files?.[0];
    if (file) {
      const fileSizeInMb = file.size / (1024 * 1024);
      if (fileSizeInMb > this.fileRequestInfo.sizeInMb) {
        this.uploadedFiles[index] = null;
        this.uploadedFileNames[index] = null;
        this.fileInputs.at(index).get('file').setErrors({ sizeExceeded: true });
        this.uploadForm.updateValueAndValidity();
        return;
      }

      if (this.validateFileExtension(file)) {
        this.uploadedFiles[index] = file;
        this.uploadedFileNames[index] = file.name;
        this.fileInputs.at(index).get('file').setErrors(null);
        this.fileInputs.at(index).get('name').setErrors(null);
      } else {
        this.uploadedFiles[index] = null;
        this.uploadedFileNames[index] = null;
        this.fileInputs.at(index).get('file').setErrors({ invalidExtension: true });
        this.uploadForm.updateValueAndValidity();
        return;
      }
    }
  }

  validateFileExtension(file: File): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!this.fileExtesionValidation(extension)) return false;
    const allowedFileTypes = this.fileRequestInfo.allowExtension
      .split(',')
      .map((type) => type.trim());
    const allowedFileTypeEnumValues = allowedFileTypes.map((type) => {
      const enumKey = type as keyof typeof FileType;
      return FileType[enumKey];
    });

    const data = this.allowFileExtension.some(
      (fileType) =>
        allowedFileTypeEnumValues.includes(fileType.fileType) && fileType.extensions.includes(extension));
    return data;
  }

  fileExtesionValidation(extension: string): boolean {
    const allowTypeExtenstion = this.allowFileExtension.find((c) =>
      c.extensions.split(',').some((ext) => ext.toLowerCase() === extension.toLowerCase())
    );
    return allowTypeExtenstion ? true : false;
  }

  mobileMenuSidebarOpen(event: Event, className: string) {
    const hasClass = (event.target as HTMLInputElement).classList.contains(
      className
    );
    if (hasClass) {
      this.renderer.removeClass(this.document.body, className);
    } else {
      this.renderer.addClass(this.document.body, className);
    }
  }

  companyProfileSubscription() {
    this.securityService.companyProfile.subscribe((profile) => {
      if (profile) {
        this.logoUrl = profile.logoUrl ?? null;
      }
    });
  }

}
