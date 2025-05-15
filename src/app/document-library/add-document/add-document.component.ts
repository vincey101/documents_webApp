import { Direction } from '@angular/cdk/bidi';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  FormArray,
  UntypedFormBuilder,
  Validators,
  FormGroup,
  UntypedFormControl,
} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { AllowFileExtension } from '@core/domain-classes/allow-file-extension';
import { Category } from '@core/domain-classes/category';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentOperation } from '@core/domain-classes/document-operation';
import { DocumentMetaData } from '@core/domain-classes/documentMetaData';
import { FileInfo } from '@core/domain-classes/file-info';
import { Role } from '@core/domain-classes/role';
import { User } from '@core/domain-classes/user';
import { SecurityService } from '@core/security/security.service';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { ClientStore } from 'src/app/client/client-store';
import { DocumentService } from 'src/app/document/document.service';
import { DocumentStatusStore } from 'src/app/document-status/store/document-status.store';
import { CategoryStore } from 'src/app/category/store/category-store';

@Component({
  selector: 'app-add-document',
  templateUrl: './add-document.component.html',
  styleUrls: ['./add-document.component.css'],
})
export class AddDocumentComponent extends BaseComponent implements OnInit {
  document: DocumentInfo;
  documentForm: UntypedFormGroup;
  extension = '';
  allowFileExtension: AllowFileExtension[] = [];
  documentSource: string;
  progress = 0;
  message = '';
  fileInfo: FileInfo;
  isFileUpload = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fileData: any;
  users: User[];
  roles: Role[];
  minDate: Date;
  isS3Supported = false;
  direction: Direction;
  documentStatusStore = inject(DocumentStatusStore);
  categoryStore = inject(CategoryStore);
  get documentMetaTagsArray(): FormArray {
    return <FormArray>this.documentForm.get('documentMetaTags');
  }

  clientStore = inject(ClientStore);

  constructor(
    private fb: UntypedFormBuilder,
    private cd: ChangeDetectorRef,
    private commonService: CommonService,
    private documentService: DocumentService,
    private router: Router,
    private translationService: TranslationService,
    private toastrService: ToastrService,
    private securityService: SecurityService
  ) {
    super();
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.createDocumentForm();
    this.documentMetaTagsArray.push(this.buildDocumentMetaTag());
    this.getUsers();
    this.getRoles();
    this.getCompanyProfile();
    this.getLangDir();
    this.getAllAllowFileExtension();
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

  getUsers() {
    this.sub$.sink = this.commonService
      .getUsersForDropdown()
      .subscribe((users: User[]) => (this.users = users));
  }

  getRoles() {
    this.sub$.sink = this.commonService
      .getRolesForDropdown()
      .subscribe((roles: Role[]) => (this.roles = roles));
  }

  getAllAllowFileExtension() {
    this.commonService
      .getAllowFileExtensions()
      .subscribe((allowFileExtension: AllowFileExtension[]) => {
        this.allowFileExtension = allowFileExtension;
      });
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

  createDocumentForm() {
    this.documentForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      categoryId: ['', [Validators.required]],
      url: ['', [Validators.required]],
      extension: ['', [Validators.required]],
      documentMetaTags: this.fb.array([]),
      selectedRoles: [],
      selectedUsers: [],
      location: [],
      clientId: [''],
      statusId: [''],
      rolePermissionForm: this.fb.group({
        isTimeBound: new UntypedFormControl(false),
        startDate: [''],
        endDate: [''],
        isAllowDownload: new UntypedFormControl(false),
      }),
      userPermissionForm: this.fb.group({
        isTimeBound: new UntypedFormControl(false),
        startDate: [''],
        endDate: [''],
        isAllowDownload: new UntypedFormControl(false),
      }),
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

  buildDocumentMetaTag(): FormGroup {
    return this.fb.group({
      id: [''],
      documentId: [''],
      metatag: [''],
    });
  }

  get rolePermissionFormGroup() {
    return this.documentForm.get('rolePermissionForm') as FormGroup;
  }

  get userPermissionFormGroup() {
    return this.documentForm.get('userPermissionForm') as FormGroup;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  SaveDocument() {
    if (this.documentForm.valid) {
      const doc = this.buildDocumentObject();
      this.documentService.addDocument(doc).subscribe((documentInfo) => {
        this.addDocumentTrail(documentInfo as DocumentInfo);
        this.toastrService.success(
          this.translationService.getValue('DOCUMENT_SAVE_SUCCESSFULLY')
        );
      });
      this;
    } else {
      this.documentForm.markAllAsTouched();
    }
  }

  addDocumentTrail(document: DocumentInfo) {
    const objDocumentAuditTrail: DocumentAuditTrail = {
      documentId: document.id,
      operationName: DocumentOperation.Created.toString(),
    };
    this.sub$.sink = this.commonService
      .addDocumentAuditTrail(objDocumentAuditTrail)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  buildDocumentObject(): DocumentInfo {
    const documentMetaTags = this.documentMetaTagsArray.getRawValue();
    const document: DocumentInfo = {
      categoryId: this.documentForm.get('categoryId').value,
      description: this.documentForm.get('description').value,
      statusId: this.documentForm.get('statusId').value,
      name: this.documentForm.get('name').value,
      url: this.fileData.fileName,
      documentMetaDatas: [...documentMetaTags],
      fileData: this.fileData,
      extension: this.extension,
      location: this.documentForm.get('location').value,
      clientId: this.documentForm.get('clientId').value ?? '',
    };
    const selectedRoles: Role[] =
      this.documentForm.get('selectedRoles').value ?? [];
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

    const selectedUsers: User[] =
      this.documentForm.get('selectedUsers').value ?? [];
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

  upload(files) {
    if (files.length === 0) return;
    this.extension = files[0].name.split('.').pop();
    if (!this.fileExtesionValidation(this.extension)) {
      this.fileUploadExtensionValidation('');
      this.cd.markForCheck();
      return;
    } else {
      this.fileUploadExtensionValidation('valid');
    }

    this.fileData = files[0];
    this.documentForm.get('url').setValue(files[0].name);
    this.documentForm.get('name').setValue(files[0].name);
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
