import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentShareableLink } from '@core/domain-classes/document-shareable-link';
import { BaseComponent } from 'src/app/base.component';

@Component({
  selector: 'app-document-link-preview-password',
  templateUrl: './document-link-preview-password.component.html',
  styleUrls: ['./document-link-preview-password.component.scss'],
})
export class DocumentLinkPreviewPasswordComponent
  extends BaseComponent
  implements OnInit
{
  documentLinkForm: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<DocumentLinkPreviewPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DocumentShareableLink,
    private fb: UntypedFormBuilder
  ) {
    super();
  }

  ngOnInit(): void {
    this.createDocumentLinkForm();
  }

  createDocumentLinkForm() {
    this.documentLinkForm = this.fb.group({
      password: ['', [Validators.required]],
    });
  }

  checkPassword() {
    if (this.documentLinkForm.valid) {
      const password = this.documentLinkForm.get('password').value;
      this.dialogRef.close(password);
    } else {
      this.documentLinkForm.markAllAsTouched();
    }
  }
}
