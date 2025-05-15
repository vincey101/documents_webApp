import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormArray, UntypedFormGroup, FormGroup, Validators, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { BaseComponent } from '../base.component';
import { ClientStore } from '../client/client-store';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { DocumentService } from '../document/document.service';
import { User } from '@core/domain-classes/user';
import { Role } from '@core/domain-classes/role';
import { DocumentOperation } from '@core/domain-classes/document-operation';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { AllowFileExtension } from '@core/domain-classes/allow-file-extension';
import { catchError, concatMap, from, of } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { Direction } from '@angular/cdk/bidi';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime-ex';
import { SecurityService } from '@core/security/security.service';
import { CategoryStore } from '../category/store/category-store';
import { DocumentStatusStore } from '../document-status/store/document-status.store';
import { DocumentMetaData } from '@core/domain-classes/documentMetaData';

@Component({
  selector: 'app-bulk-document-upload',
  standalone: true,
  imports: [
    TranslateModule,
    SharedModule,
    MatDialogModule,
    MatSelectModule,
    ReactiveFormsModule,
    FeatherModule,
    RouterModule,
    NgSelectModule,
    MatButtonModule,
    CommonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    FormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
  ],
  templateUrl: './bulk-document-upload.component.html',
  styleUrl: './bulk-document-upload.component.scss'
})
export class BulkDocumentUploadComponent extends BaseComponent implements OnInit {
  documentForm: UntypedFormGroup;
  extension = '';
  users: User[];
  roles: Role[];
  allowFileExtension: AllowFileExtension[] = [];
  fileData: any;
  loading: boolean = false;
  resultArray: any = [];
  minDate: Date;
  isS3Supported = false;

  @ViewChild('file') fileInput: any;
  @Output() onSaveDocument: EventEmitter<DocumentInfo> =
    new EventEmitter<DocumentInfo>();
  categoryStore = inject(CategoryStore);
  public clientStore = inject(ClientStore);
  private fb = inject(UntypedFormBuilder);
  private cd = inject(ChangeDetectorRef);
  private commonService = inject(CommonService);
  private translationService = inject(TranslationService);
  private documentService = inject(DocumentService);
  documentStatusStore = inject(DocumentStatusStore);
  counter: number;
  direction: Direction;
  document: DocumentInfo;

  constructor(private securityService: SecurityService,) {
    super();
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.createDocumentForm();
    this.documentMetaTagsArray.push(this.buildDocumentMetaTag());
    this.getUsers();
    this.getRoles();
    this.getAllAllowFileExtension();
  }

  get fileInputs(): FormArray {
    return (<FormArray>this.documentForm.get('files')) as FormArray;
  }

  get rolePermissionFormGroup() {
    return this.documentForm.get('rolePermissionForm') as FormGroup;
  }

  get userPermissionFormGroup() {
    return this.documentForm.get('userPermissionForm') as FormGroup;
  }

  get documentMetaTagsArray(): FormArray {
    return <FormArray>this.documentForm.get('documentMetaTags');
  }

  createDocumentForm() {
    this.documentForm = this.fb.group({
      name: [''],
      description: [''],
      categoryId: ['', [Validators.required]],
      url: [''],
      extension: [''],
      documentMetaTags: this.fb.array([]),
      location: [''],
      clientId: [''],
      statusId: [''],
      selectedRoles: [],
      selectedUsers: [],
      files: this.fb.array([]),
      rolePermissionForm: this.fb.group({
        isTimeBound: new UntypedFormControl(false),
        startDate: [''],
        endDate: [''],
        isAllowDownload: [false],
      }),
      userPermissionForm: this.fb.group({
        isTimeBound: new UntypedFormControl(false),
        startDate: [''],
        endDate: [''],
        isAllowDownload: [false],
      }),
    });
    this.companyProfileSubscription();
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

  companyProfileSubscription() {
    this.securityService.companyProfile.subscribe((profile) => {
      if (profile) {
        this.documentForm.get('location').setValue(profile.location ?? 'local');
      }
    });
  }

  getUsers() {
    this.sub$.sink = this.commonService
      .getUsersForDropdown()
      .subscribe((users: User[]) => (this.users = users));
  }

  getRoles() {
    this.sub$.sink = this.commonService
      .getRoles()
      .subscribe((roles: Role[]) => (this.roles = roles));
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

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.resultArray = [];
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.extension = file.name.split('.').pop();
        const isValidExtension = this.fileExtesionValidation(this.extension);
        this.fileInputs.push(
          this.fb.group({
            fileName: [file.name],
            file: [file],
            name: [file.name, Validators.required],
            extension: [isValidExtension ? this.extension : '', [Validators.required]],
            message: [''],
            isSuccess: [false],
            isLoading: [false],
          })
        );
      }
      this.cd.markForCheck();
    }
  }

  // Remove a file from the selected list
  removeFile(index: number): void {
    this.fileInputs.removeAt(index);
  }

  fileExtesionValidation(extension: string): boolean {
    const allowTypeExtenstion = this.allowFileExtension.find((c) =>
      c.extensions.split(',').some((ext) => ext.toLowerCase() === extension.toLowerCase())
    );
    return allowTypeExtenstion ? true : false;
  }

  private markFormGroupTouched(formGroup: UntypedFormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  saveFilesAndDocument() {
    if (this.documentForm.valid) {
      this.loading = true;
      this.counter = 0;
      const concatObservable$ = [];
      this.fileInputs.controls.map(
        (control) => {
          if (!control.get('isSuccess').value) {
            const documentObj = this.buildDocumentObject();
            documentObj.url = control.get('fileName').value;
            documentObj.name = control.get('name').value;
            documentObj.extension = control.get('extension').value;
            documentObj.fileData = control.get('file').value;
            concatObservable$.push(this.documentService.addDocument({ ...documentObj }));
          }
        });
      if (concatObservable$.length === 0) {
        return;
      }
      this.resultArray = [];
      from(concatObservable$)
        .pipe(
          concatMap((obs, index) => {
            this.fileInputs.at(index).patchValue({
              isLoading: true
            })
            return obs.pipe(
              catchError(err => {
                return of(`${typeof (err.messages[0]) == 'string' ? err.messages[0] : err.friendlyMessage}`);
              })
            )
          })
        )
        .subscribe({
          next: (document: DocumentInfo | string) => {
            this.counter++;
            this.fileInputs.at(this.counter - 1).patchValue({
              isLoading: false
            });
            if (typeof document === 'string') {
              this.resultArray.push({
                isSuccess: false,
                message: document,
                name: this.fileInputs.at(this.counter - 1).get('name').value
              })
            } else {
              this.addDocumentTrail(document.id);
              this.resultArray.push({
                isSuccess: true,
                name: this.fileInputs.at(this.counter - 1).get('name').value,
                message: this.translationService.getValue('DOCUMENT_SAVE_SUCCESSFULLY')
              });
            }
            if (this.counter === this.fileInputs.length) {
              while (this.fileInputs.controls.length) {
                this.fileInputs.removeAt(0);
              }
              this.loading = false;
              this.fileInput.nativeElement.value = '';
            }
          }
        });
    } else {
      this.markFormGroupTouched(this.documentForm);
      return;
    }
  }

  addDocumentTrail(id: string) {
    const objDocumentAuditTrail: DocumentAuditTrail = {
      documentId: id,
      operationName: DocumentOperation.Created.toString(),
    };
    this.sub$.sink = this.commonService
      .addDocumentAuditTrail(objDocumentAuditTrail)
      .subscribe((c) => {
        this.loading = false;
      });
  }

  buildDocumentObject(): DocumentInfo {
    const files = this.fileInputs.getRawValue();
    const documentMetaTags = this.documentMetaTagsArray.getRawValue();
    const document: DocumentInfo = {
      categoryId: this.documentForm.get('categoryId').value ?? '',
      location: this.documentForm.get('location').value,
      clientId: this.documentForm.get('clientId').value ?? '',
      statusId: this.documentForm.get('statusId').value ?? '',
      description: this.documentForm.get('description').value ?? '',
      documentMetaDatas: [...documentMetaTags],
    };
    const selectedRoles: Role[] = this.documentForm.get('selectedRoles').value ?? [];
    if (selectedRoles?.length > 0) {
      document.documentRolePermissions = selectedRoles.map((role) => {
        return Object.assign(
          {},
          {
            id: '',
            documentId: '',
            roleId: role.id,
          },
          this.rolePermissionFormGroup.value
        );
      });
    }
    const selectedUsers: User[] = this.documentForm.get('selectedUsers').value ?? [];
    if (selectedUsers?.length > 0) {
      document.documentUserPermissions = selectedUsers.map((user) => {
        return Object.assign(
          {},
          {
            id: '',
            documentId: '',
            userId: user.id,
          },
          this.userPermissionFormGroup.value
        );
      });
    }
    return document;
  }

  roleTimeBoundChange(event: MatCheckboxChange) {
    if (event.checked) {
      this.rolePermissionFormGroup
        .get('startDate')
        .setValidators([Validators.required]);
      this.rolePermissionFormGroup
        .get('endDate')
        .setValidators([Validators.required]);
    } else {
      this.rolePermissionFormGroup.get('startDate').clearValidators();
      this.rolePermissionFormGroup.get('startDate').updateValueAndValidity();
      this.rolePermissionFormGroup.get('endDate').clearValidators();
      this.rolePermissionFormGroup.get('endDate').updateValueAndValidity();
    }
  }

  userTimeBoundChange(event: MatCheckboxChange) {
    if (event.checked) {
      this.userPermissionFormGroup
        .get('startDate')
        .setValidators([Validators.required]);
      this.userPermissionFormGroup
        .get('endDate')
        .setValidators([Validators.required]);
    } else {
      this.userPermissionFormGroup.get('startDate').clearValidators();
      this.userPermissionFormGroup.get('startDate').updateValueAndValidity();
      this.userPermissionFormGroup.get('endDate').clearValidators();
      this.userPermissionFormGroup.get('endDate').updateValueAndValidity();
    }
  }

}
