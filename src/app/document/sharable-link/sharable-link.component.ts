import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentShareableLink } from '@core/domain-classes/document-shareable-link';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { DocumentService } from '../document.service';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'app-sharable-link',
  templateUrl: './sharable-link.component.html',
  styleUrls: ['./sharable-link.component.scss'],
})
export class SharableLinkComponent extends BaseComponent implements OnInit {
  documentLinkForm: UntypedFormGroup;
  isEditMode = false;
  isResetLink = false;
  minDate = new Date();
  baseUrl = `${window.location.protocol}//${window.location.host}/preview/`;
  constructor(
    public dialogRef: MatDialogRef<SharableLinkComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { document: DocumentInfo; link: DocumentShareableLink },
    private fb: UntypedFormBuilder,
    private documentService: DocumentService,
    private toastrService: ToastrService,
    private commonDialogService: CommonDialogService,
    private translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createDocumentLinkForm();
    if (this.data.link) {
      if (this.data.link.id) {
        this.isEditMode = true;
        this.pathValue();
      }
    }
  }

  pathValue() {
    this.documentLinkForm.patchValue(this.data.link);
    this.documentLinkForm
      .get('linkCode')
      .setValue(`${this.baseUrl}${this.data.link.linkCode}`);
    if (this.data.link.linkExpiryTime) {
      this.documentLinkForm.get('isLinkExpiryTime').setValue(true);
    }

    if (this.data.link.password) {
      this.documentLinkForm.get('isPassword').setValue(true);
    }
  }

  createDocumentLinkForm() {
    this.documentLinkForm = this.fb.group(
      {
        id: [''],
        isLinkExpiryTime: new UntypedFormControl(false),
        linkExpiryTime: [''],
        isPassword: new UntypedFormControl(false),
        password: [''],
        linkCode: [''],
        isAllowDownload: new UntypedFormControl(false),
      },
      {
        validator: this.checkData,
      }
    );
  }

  checkData(group: UntypedFormGroup) {
    const isLinkExpiryTime = group.get('isLinkExpiryTime').value;
    const linkExpiryTime = group.get('linkExpiryTime').value;
    const isPassword = group.get('isPassword').value;
    const password = group.get('password').value;
    const data = {};
    if (isLinkExpiryTime && !linkExpiryTime) {
      data['linkExpiryTimeValidator'] = true;
    }
    if (isPassword && !password) {
      data['passwordValidator'] = true;
    }
    return data;
  }

  openLinkSettings() {
    this.isResetLink = !this.isResetLink;
  }

  createLink() {
    if (!this.documentLinkForm.valid) {
      this.documentLinkForm.markAllAsTouched();
      return;
    }
    const link = this.createBuildObject();
    this.sub$.sink = this.documentService
      .createDocumentShareableLink(link)
      .subscribe({
        next: (data: DocumentShareableLink) => {
          this.toastrService.success(
            this.translationService.getValue('LINK_GENERATED_SUCCESSFULLY')
          );
          this.data.link = data;
          this.isEditMode = true;
          this.isResetLink = false;
          this.pathValue();
        },
      });
  }

  deleteDocumentLink() {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE')
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.sub$.sink = this.documentService
            .deleteDocumentShareableLInk(this.data.link.id)
            .subscribe({
              next: () => {
                this.toastrService.success(
                  this.translationService.getValue(
                    'DOCUMENT_LINK_DELETED_SUCCESSFULLY'
                  )
                );
                this.dialogRef.close();
              },
            });
        }
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  createBuildObject(): DocumentShareableLink {
    const id: string = this.documentLinkForm.get('id').value;
    let linkCode: string = this.documentLinkForm.get('linkCode').value;
    if (linkCode) {
      linkCode = linkCode.replace(this.baseUrl, '');
    }
    const link: DocumentShareableLink = {
      id: id,
      documentId: this.data.document.id,
      isAllowDownload: this.documentLinkForm.get('isAllowDownload').value,
      password: this.documentLinkForm.get('isPassword').value
        ? this.documentLinkForm.get('password').value
        : '',
      linkExpiryTime: this.documentLinkForm.get('isLinkExpiryTime').value
        ? this.documentLinkForm.get('linkExpiryTime').value
        : '',
      linkCode: linkCode,
    };
    return link;
  }
}
