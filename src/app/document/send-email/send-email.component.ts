import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentOperation } from '@core/domain-classes/document-operation';
import { SendEmail } from '@core/domain-classes/send-email';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { EmailSendService } from './email-send.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-send-email',
  templateUrl:'./send-email.component.html',
  styleUrls: ['./send-email.component.scss'],
})
export class SendEmailComponent extends BaseComponent implements OnInit {
  emailForm: UntypedFormGroup;
  public editor: any = ClassicEditor;
  constructor(
    private fb: UntypedFormBuilder,
    private toastrService: ToastrService,
    private emailSendService: EmailSendService,
    @Inject(MAT_DIALOG_DATA) public data: DocumentInfo,
    private dialogRef: MatDialogRef<SendEmailComponent>,
    private commonService: CommonService,
    private translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createEmailForm();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  createEmailForm() {
    this.emailForm = this.fb.group({
      id: [''],
      toAddress: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      body: ['', [Validators.required]],
      documentId: [this.data.id, [Validators.required]],
    });
  }

  sendEmail() {
    if (!this.emailForm.valid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.sub$.sink = this.emailSendService
      .sendEmail(this.buildObject())
      .subscribe(
        () => {
          this.addDocumentTrail();
          this.toastrService.success(
            this.translationService.getValue('EMAIL_SENT_SUCCESSFULLY')
          );
        });
  }

  buildObject() {
    const sendEmail: SendEmail = {
      documentId: this.emailForm.get('documentId').value,
      email: this.emailForm.get('toAddress').value,
      subject: this.emailForm.get('subject').value,
      message: this.emailForm.get('body').value,
    };
    return sendEmail;
  }

  addDocumentTrail() {
    const objDocumentAuditTrail: DocumentAuditTrail = {
      documentId: this.data.id,
      operationName: DocumentOperation.Send_Email.toString(),
    };
    this.sub$.sink = this.commonService
      .addDocumentAuditTrail(objDocumentAuditTrail)
      .subscribe(() => {
        this.dialogRef.close();
      });
  }
}
