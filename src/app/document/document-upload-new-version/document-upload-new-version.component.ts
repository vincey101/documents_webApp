import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentVersion } from '@core/domain-classes/documentVersion';
import { FileInfo } from '@core/domain-classes/file-info';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { DocumentService } from '../document.service';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { AllowFileExtension } from '@core/domain-classes/allow-file-extension';
import { CommonService } from '@core/services/common.service';

@Component({
  selector: 'app-document-upload-new-version',
  templateUrl: './document-upload-new-version.component.html',
  styleUrls: ['./document-upload-new-version.component.scss'],
})
export class DocumentUploadNewVersionComponent
  extends BaseComponent
  implements OnInit {
  documentForm: UntypedFormGroup;
  allowFileExtension: AllowFileExtension[] = [];
  extension = '';
  isFileUpload = false;
  showProgress = false;
  progress = 0;
  fileInfo: FileInfo;
  fileData: any;
  constructor(
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DocumentInfo,
    private httpClient: HttpClient,
    private cd: ChangeDetectorRef,
    private dialogRef: MatDialogRef<DocumentUploadNewVersionComponent>,
    private documentService: DocumentService,
    private toastrService: ToastrService,
    private commonService: CommonService,
    private translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createDocumentForm();
    this.getAllAllowFileExtension();
  }

  createDocumentForm() {
    this.documentForm = this.fb.group({
      url: ['', [Validators.required]],
      extension: ['', [Validators.required]],
    });
  }

  getAllAllowFileExtension() {
    this.sub$.sink = this.commonService.allowFileExtension$.subscribe(
      (allowFileExtension: AllowFileExtension[]) => {
        if (allowFileExtension) {
          this.allowFileExtension = allowFileExtension;
        }
      }
    );
  }

  upload(files) {
    if (files.length === 0) return;
    this.extension = files[0].name.split('.').pop();
    this.documentForm.get('url').setValue(files[0].name);
    if (!this.fileExtesionValidation(this.extension)) {
      this.fileUploadExtensionValidation('');
      this.cd.markForCheck();
      return;
    } else {
      this.fileUploadExtensionValidation('valid');
    }

    this.fileData = files[0];
  }

  fileUploadValidation(fileName: string) {
    this.documentForm.patchValue({
      url: fileName,
    });
    this.documentForm.get('url').markAsTouched();
    this.documentForm.updateValueAndValidity();
  }

  fileUploadExtensionValidation(extension: string) {
    this.documentForm.patchValue({
      extension: extension,
    });
    this.documentForm.get('extension').markAsTouched();
    this.documentForm.updateValueAndValidity();
  }

  fileExtesionValidation(extension: string): boolean {
    const allowTypeExtenstion = this.allowFileExtension.find((c) =>
      c.extensions.split(',').some((ext) => ext.toLowerCase() === extension.toLowerCase())
    );
    return allowTypeExtenstion ? true : false;
  }

  SaveDocument() {
    if (this.documentForm.invalid) {
      this.documentForm.markAllAsTouched();
      return;
    }

    const documentversion: DocumentVersion = {
      documentId: this.data.id,
      url: this.fileData.fileName,
      fileData: this.fileData,
      extension: this.extension,
      location: this.data.location,
    };
    this.sub$.sink = this.documentService
      .saveNewVersionDocument(documentversion)
      .subscribe(() => {
        this.toastrService.success(
          this.translationService.getValue('DOCUMENT_SAVE_SUCCESSFULLY')
        );
        this.dialogRef.close(true);
      });
  }

  closeDialog() {
    this.dialogRef.close(false);
  }
}
