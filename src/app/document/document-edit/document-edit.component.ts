import { Component, inject, Inject, Input, OnInit } from '@angular/core';
import {
  FormArray,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category } from '@core/domain-classes/category';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentOperation } from '@core/domain-classes/document-operation';
import { DocumentMetaData } from '@core/domain-classes/documentMetaData';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { DocumentService } from '../document.service';
import { Direction } from '@angular/cdk/bidi';
import { ClientStore } from 'src/app/client/client-store';
import { DocumentStatusStore } from 'src/app/document-status/store/document-status.store';
import { CategoryStore } from 'src/app/category/store/category-store';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss'],
})
export class DocumentEditComponent extends BaseComponent implements OnInit {
  document: DocumentInfo;
  documentForm: UntypedFormGroup;
  extension = '';
  @Input() categories: Category[];
  @Input() documentInfo: DocumentInfo;
  documentSource: string;
  direction: Direction;
  documentstatusStore = inject(DocumentStatusStore);
  categoryStore = inject(CategoryStore);

  get documentMetaTagsArray(): FormArray {
    return <FormArray>this.documentForm.get('documentMetaTags');
  }
  public clientStore = inject(ClientStore);

  constructor(
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<DocumentEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastrService: ToastrService,
    private documentService: DocumentService,
    private commonService: CommonService,
    private translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createDocumentForm();
    this.pushValuesDocumentMetatagArray();
    this.patchDocumentForm();
    this.getLangDir();
  }

  getLangDir() {
    this.sub$.sink = this.translationService.lanDir$.subscribe(
      (c: Direction) => (this.direction = c)
    );
  }

  patchDocumentForm() {
    this.documentForm.patchValue(this.data.document,this.data.documentMetaDatas);
  }

  createDocumentForm() {
    this.documentForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      categoryId: ['', [Validators.required]],
      documentMetaTags: this.fb.array([]),
      clientId: [''],
      statusId: [''],
    });
  }

  SaveDocument() {
    if (this.documentForm.valid) {
      this.sub$.sink = this.documentService
        .updateDocument(this.buildDocumentObject())
        .subscribe((c) => {
          this.toastrService.success(
            this.translationService.getValue('DOCUMENT_UPDATE_SUCCESSFULLY')
          );
          this.addDocumentTrail();
        });
    } else {
      this.markFormGroupTouched(this.documentForm);
    }
  }

  addDocumentTrail() {
    const objDocumentAuditTrail: DocumentAuditTrail = {
      documentId: this.data.document.id,
      operationName: DocumentOperation.Modified.toString(),
    };
    this.sub$.sink = this.commonService
      .addDocumentAuditTrail(objDocumentAuditTrail)
      .subscribe(() => {
        this.dialogRef.close('loaded');
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private markFormGroupTouched(formGroup: UntypedFormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  buildDocumentObject(): DocumentInfo {
    const documentMetaTags = this.documentMetaTagsArray.value;
    const document: DocumentInfo = {
      id: this.data.document.id,
      categoryId: this.documentForm.get('categoryId').value,
      clientId: this.documentForm.get('clientId').value,
      statusId: this.documentForm.get('statusId').value,
      description: this.documentForm.get('description').value,
      name: this.documentForm.get('name').value,
      documentMetaDatas: [...documentMetaTags],
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

  buildDocumentMetaTag(): FormGroup {
    return this.fb.group({
      id: [''],
      documentId: [''],
      metatag: [''],
    });
  }

  pushValuesDocumentMetatagArray() {
    this.sub$.sink = this.documentService
      .getdocumentMetadataById(this.data.document.id)
      .subscribe((result: DocumentMetaData[]) => {
        if (result.length > 0) {
          result.map((documentMetatag) => {
            this.documentMetaTagsArray.push(
              this.editDocmentMetaData(documentMetatag)
            );
          });
        } else {
          this.documentMetaTagsArray.push(this.buildDocumentMetaTag());
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

  editDocmentMetaData(documentMetatag: DocumentMetaData): FormGroup {
    return this.fb.group({
      id: [documentMetatag.id],
      documentId: [documentMetatag.documentId],
      metatag: [documentMetatag.metatag],
    });
  }
}
