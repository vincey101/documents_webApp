import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, Inject, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AllowFileExtension } from '@core/domain-classes/allow-file-extension';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentOperation } from '@core/domain-classes/document-operation';
import { DocumentMetaData } from '@core/domain-classes/documentMetaData';
import { FileRequestDocument } from '@core/domain-classes/file-request-document';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { PipesModule } from '@shared/pipes/pipes.module';
import { SharedModule } from '@shared/shared.module';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { DocumentLibraryRoutingModule } from 'src/app/document-library/document-library-routing.module';
import { FileRequestDocumentService } from '../file-request-document.service';
import { FileRequestDocumentApprove } from '@core/domain-classes/file-request-document-apporve';
import { NgSelectModule } from '@ng-select/ng-select';
import { SecurityService } from '@core/security/security.service';
import { Direction } from '@angular/cdk/bidi';
import { ClientStore } from 'src/app/client/client-store';
import { CategoryStore } from 'src/app/category/store/category-store';
import { DocumentStatusStore } from 'src/app/document-status/store/document-status.store';

@Component({
  selector: 'app-approve-document',
  standalone: true,
  imports: [CommonModule,
    SharedModule,
    ReactiveFormsModule,
    DocumentLibraryRoutingModule,
    MatTableModule,
    MatDialogModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatInputModule,
    MatCheckboxModule,
    FormsModule,
    PipesModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatExpansionModule,
    NgSelectModule,
    MatTooltipModule,],
  templateUrl: './approve-document.component.html',
  styleUrl: './approve-document.component.scss'
})
export class ApproveDocumentComponent extends BaseComponent implements OnInit {
  document: DocumentInfo;
  documentForm: UntypedFormGroup;
  extension: string = '';
  isS3Supported = false;
  direction: Direction;
  public clientStore = inject(ClientStore);
  allowFileExtension: AllowFileExtension[] = [];
  @Output() onSaveDocument: EventEmitter<DocumentInfo> =
    new EventEmitter<DocumentInfo>();
  categoryStore = inject(CategoryStore);
  documentStatusStore = inject(DocumentStatusStore);

  get documentMetaTagsArray(): FormArray {
    return <FormArray>this.documentForm.get('documentMetaTags');
  }
  constructor(
    private fb: UntypedFormBuilder,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: FileRequestDocument,
    private dialogRef: MatDialogRef<ApproveDocumentComponent>,
    private commonService: CommonService,
    private securityService: SecurityService,
    private toastrService: ToastrService,
    private fileRequestDocumentService: FileRequestDocumentService,
    private translationService: TranslationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.extension = this.data.url.split('.')[1];
    this.createDocumentForm();
    this.getCompanyProfile();
    this.getLangDir();
    this.documentMetaTagsArray.push(this.buildDocumentMetaTag());
  }

  getLangDir() {
    this.sub$.sink = this.translationService.lanDir$.subscribe(
      (c: Direction) => (this.direction = c)
    );
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
      name: [this.data.name, [Validators.required]],
      description: [''],
      categoryId: ['', [Validators.required]],
      statusId: [''],
      storageSettingId: [''],
      clientId: [''],
      url: [this.data.url, [Validators.required]],
      extension: [this.extension, [Validators.required]],
      documentMetaTags: this.fb.array([]),
    });
    this.companyProfileSubscription();
  }

  companyProfileSubscription() {
    this.securityService.companyProfile.subscribe((profile) => {
      if (profile) {
        this.documentForm.get('storageSettingId').setValue(profile.location ?? 'local');
      }
    });
  }

  buildDocumentMetaTag(): FormGroup {
    return this.fb.group({
      id: [''],
      documentId: [''],
      metatag: [''],
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

  editDocmentMetaData(documentMetatag: DocumentMetaData): FormGroup {
    return this.fb.group({
      id: [documentMetatag.id],
      documentId: [documentMetatag.documentId],
      metatag: [documentMetatag.metatag],
    });
  }

  saveDocument() {
    if (this.documentForm.valid) {
      const document = this.buildDocumentObject();
      this.sub$.sink = this.fileRequestDocumentService
        .approveDocument(document)
        .subscribe(() => {
          this.toastrService.success(
            this.translationService.getValue('FILE_APPROVE_SUCCESSFULLY')
          );
          this.dialogRef.close(document.categoryId);
        });
    } else {
      this.markFormGroupTouched(this.documentForm);
    }
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

  closeDialog() {
    this.dialogRef.close();
  }

  addDocumentTrail(id: string) {
    const objDocumentAuditTrail: DocumentAuditTrail = {
      documentId: id,
      operationName: DocumentOperation.Created.toString(),
    };

    this.sub$.sink = this.commonService
      .addDocumentAuditTrail(objDocumentAuditTrail)
      .subscribe((c) => {
        this.dialogRef.close(true);
      });
  }

  private markFormGroupTouched(formGroup: UntypedFormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  buildDocumentObject(): FileRequestDocumentApprove {
    const documentMetaTags = this.documentMetaTagsArray.value;
    const document: FileRequestDocumentApprove = {
      categoryId: this.documentForm.get('categoryId').value ?? '',
      statusId: this.documentForm.get('statusId').value ?? '',
      clientId: this.documentForm.get('clientId').value ?? '',
      storageSettingId: this.documentForm.get('storageSettingId').value ?? '',
      description: this.documentForm.get('description').value,
      name: this.documentForm.get('name').value,
      fileRequestId: this.data.fileRequestId,
      fileRequestDocumentId: this.data.id,
      url: this.data.url,
      documentMetaDatas: [...documentMetaTags],
      extension: this.data.url.split('.')[1],
    };
    return document;
  }

}
