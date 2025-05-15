import { Direction } from '@angular/cdk/bidi';
import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit, Signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Category } from '@core/domain-classes/category';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentOperation } from '@core/domain-classes/document-operation';
import { DocumentMetaData } from '@core/domain-classes/documentMetaData';
import { SecurityService } from '@core/security/security.service';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { CategoryStore } from 'src/app/category/store/category-store';
import { ClientStore } from 'src/app/client/client-store';
import { DocumentService } from 'src/app/document/document.service';

@Component({
  selector: 'app-add-document',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    ToastrModule,
    CommonModule,
    FeatherModule,
    SharedModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    NgSelectModule
  ],
  templateUrl: './add-document.component.html',
  styleUrl: './add-document.component.scss'
})
export class AddDocumentComponent extends BaseComponent implements OnInit {
  document: DocumentInfo;
  documentForm: FormGroup;
  extension: string = '';
  documentSource: string;
  direction: Direction;
  isS3Supported = false;
  categoryStore = inject(CategoryStore);

  get documentMetaTagsArray(): FormArray {
    return <FormArray>this.documentForm.get('documentMetaTags');
  }

  public clientStore = inject(ClientStore);
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddDocumentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { file: File },
    private toastrService: ToastrService,
    private documentService: DocumentService,
    private translationService: TranslationService,
    private securityService: SecurityService,
    private commonService: CommonService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.getCompanyProfile();
    this.createDocumentForm();
    this.documentMetaTagsArray.push(this.buildDocumentMetaTag());
  }

  getCompanyProfile() {
    this.securityService.companyProfile.subscribe((profile) => {
      if (profile) {
        this.isS3Supported = profile.location == 's3';
      }
    });
  }

  createDocumentForm() {
    this.documentForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      categoryId: [{ value: '', disabled: false }, [Validators.required]],
      clientId: [''],
      location: [''],
      documentMetaTags: this.fb.array([]),
    });
    this.companyProfileSubscription();
  }

  companyProfileSubscription() {
    this.securityService.companyProfile.subscribe((profile) => {
      if (profile) {
        this.documentForm.get('location').setValue(profile.location ?? 'local');
      }
    });
  }

  saveDocument() {
    if (this.documentForm.valid) {
      this.documentService.addDocument(this.buildDocumentObject())
        .subscribe((c: DocumentInfo) => {
          this.document = c;
          this.toastrService.success(
            this.translationService.getValue('DOCUMENT_SAVE_SUCCESSFULLY')
          );
          this.addDocumentTrail();
        });
    } else {
      this.documentForm.markAllAsTouched();
    }
  }

  addDocumentTrail() {
    const objDocumentAuditTrail: DocumentAuditTrail = {
      documentId: this.document.id,
      operationName: DocumentOperation.Created.toString(),
    };

    this.sub$.sink = this.commonService.addDocumentAuditTrail(objDocumentAuditTrail)
      .subscribe((c) => {
        this.dialogRef.close(true);
      });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onMetatagChange(event: any, index: number) {
    const email = this.documentMetaTagsArray.at(index).get('metatag').value;
    if (!email) {
      return;
    }
    const emailControl = this.documentMetaTagsArray.at(index).get('metatag');
    emailControl.setValidators([Validators.required]);
    emailControl.updateValueAndValidity();
  }

  buildMetaTagObject(): DocumentMetaData[] {
    const documentMetaTags = this.documentMetaTagsArray.getRawValue().length > 0 ? this.documentMetaTagsArray.getRawValue() : [];
    const metaTagObjects: DocumentMetaData[] = documentMetaTags.map((tag) => {
      return {
        id: tag.id,
        documentId: tag.documentId,
        documentMetaTagId: tag.documentMetaTagId,
        metatag: tag.metatag,
        metaTagDate: tag.metaTagDate?.toString() === 'Invalid Date' ? null : tag.metaTagDate ? new Date(tag.metaTagDate).toISOString() : null,
        metaTagType: tag.metaTagType
      };
    });
    return metaTagObjects;

  }

  buildDocumentObject(): DocumentInfo {
    const document: DocumentInfo = {
      categoryId: this.documentForm.get('categoryId').value,
      description: this.documentForm.get('description').value,
      name: this.documentForm.get('name').value,
      fileData: this.data.file,
      extension: "pdf",
      location: this.documentForm.get('location').value,
      clientId: this.documentForm.get('clientId').value ?? '',
      documentMetaDatas: [...this.buildMetaTagObject()],
    };
    return document;
  }
  onDocumentCancel() {
    this.dialogRef.close('canceled');
  }

  onAddAnotherMetaTag() {
    const documentMetaTag: DocumentMetaData = {
      id: '',
      documentId: this.document && this.document.id ? this.document.id : '',
      metatag: '',
    };
    this.documentMetaTagsArray.insert(
      0,
      this.editDocmentMetaData(documentMetaTag)
    );
  }

  onDeleteMetaTag(index: number) {
    this.documentMetaTagsArray.removeAt(index);
  }

  editDocmentMetaData(documentMetatag: DocumentMetaData): FormGroup {
    return this.fb.group({
      id: [documentMetatag.id],
      documentId: [documentMetatag.documentId],
      metatag: [documentMetatag.metatag],
    });
  }

  buildDocumentMetaTag(): FormGroup {
    return this.fb.group({
      id: [''],
      documentId: [''],
      documentMetaTagId: [''],
      metatag: [''],
      metaTagDate: [null],
      metaTagType: [0]
    });
  }
}
