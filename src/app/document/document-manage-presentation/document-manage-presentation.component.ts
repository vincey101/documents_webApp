import { Direction } from '@angular/cdk/bidi';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  UntypedFormGroup,
  FormArray,
  UntypedFormBuilder,
  Validators,
  FormGroup,
  UntypedFormControl,
} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AllowFileExtension } from '@core/domain-classes/allow-file-extension';
import { Category } from '@core/domain-classes/category';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentMetaData } from '@core/domain-classes/documentMetaData';
import { FileInfo } from '@core/domain-classes/file-info';
import { Role } from '@core/domain-classes/role';
import { User } from '@core/domain-classes/user';
import { SecurityService } from '@core/security/security.service';
import { CategoryService } from '@core/services/category.service';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { BaseComponent } from 'src/app/base.component';
import { ClientStore } from 'src/app/client/client-store';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Editor } from '@ckeditor/ckeditor5-core';
import { OpenAIService } from '@core/services/openai.service';

@Component({
  selector: 'app-document-manage-presentation',
  templateUrl: './document-manage-presentation.component.html',
  styleUrls: ['./document-manage-presentation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentManagePresentationComponent
  extends BaseComponent
  implements OnInit {
  document: DocumentInfo;
  documentForm: UntypedFormGroup;
  extension = '';
  categories: Category[] = [];
  allCategories: Category[] = [];
  documentSource: string;
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onSaveDocument: EventEmitter<DocumentInfo> =
    new EventEmitter<DocumentInfo>();
  progress = 0;
  message = '';
  fileInfo: FileInfo;
  isFileUpload = false;
  fileData: any;
  users: User[];
  roles: Role[];
  allowFileExtension: AllowFileExtension[] = [];
  minDate: Date;
  isS3Supported = false;
  direction: Direction;
  clientStore = inject(ClientStore);
  get documentMetaTagsArray(): FormArray {
    return <FormArray>this.documentForm.get('documentMetaTags');
  }
  public Editor = ClassicEditor;
  public editorConfig = {
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'alignment:left',
        'alignment:center',
        'alignment:right',
        'alignment:justify',
        '|',
        'outdent',
        'indent',
        '|',
        'blockQuote',
        'undo',
        'redo'
      ]
    },
    placeholder: 'Type the content here...'
  };
  public showAiPrompt = false;
  public aiPrompt = '';
  public isGenerating = false;
  public showModal = false;
  public errorMessage = '';

  constructor(
    private fb: UntypedFormBuilder,
    private httpClient: HttpClient,
    private cd: ChangeDetectorRef,
    private categoryService: CategoryService,
    private commonService: CommonService,
    private securityService: SecurityService,
    private translationService: TranslationService,
    private openAIService: OpenAIService
  ) {
    super();
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.createDocumentForm();
    this.getCategories();
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

  getCategories() {
    this.categoryService.getAllCategoriesForDropDown().subscribe((c) => {
      this.categories = c;
      this.setDeafLevel();
    });
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

  setDeafLevel(parent?: Category, parentId?: string) {
    const children = this.categories.filter((c) => c.parentId == parentId);
    if (children.length > 0) {
      children.map((c, index) => {
        c.deafLevel = parent ? parent.deafLevel + 1 : 0;
        c.index =
          (parent ? parent.index : 0) + index * Math.pow(0.1, c.deafLevel);
        this.allCategories.push(c);
        this.setDeafLevel(c, c.id);
      });
    }
    return parent;
  }

  onDocumentChange($event: any) {
    const files = $event.target.files || $event.srcElement.files;
    const file_url = files[0];
    this.extension = file_url.name.split('.').pop();
    if (this.fileExtesionValidation(this.extension)) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.documentSource = e.target.result;
        this.fileUploadValidation('upload');
      };
      reader.readAsDataURL(file_url);
    } else {
      this.documentSource = null;
      this.fileUploadValidation('');
    }
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
      c.extensions.toLowerCase().includes(extension.toLowerCase())
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
      selectedToUsers: [],
      selectedThroughUsers: [],
      location: [''],
      clientId: [''],
      rolePermissionForm: this.fb.group({
        isTimeBound: new UntypedFormControl(false),
        startDate: [''],
        endDate: [''],
        isAllowDownload: new UntypedFormControl(false),
      }),
      toUserPermissionForm: this.fb.group({
        isTimeBound: new UntypedFormControl(false),
        startDate: [''],
        endDate: [''],
        isAllowDownload: new UntypedFormControl(false),
      }),
      throughUserPermissionForm: this.fb.group({
        isTimeBound: new UntypedFormControl(false),
        startDate: [''],
        endDate: [''],
        isAllowDownload: new UntypedFormControl(false),
      }),
      templateType: ['template1', Validators.required],
      subject: ['', Validators.required],
      content: ['', Validators.required],
    });
    this.companyProfileSubscription();

    // Subscribe to content changes for preview with change detection
    this.documentForm.get('content').valueChanges.subscribe(value => {
      // Trigger change detection to update preview
      this.cd.markForCheck();
    });
    
    // Subscribe to subject changes for preview
    this.documentForm.get('subject').valueChanges.subscribe(value => {
      // Trigger change detection to update preview
      this.cd.markForCheck();
    });
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

  get toUserPermissionFormGroup() {
    return this.documentForm.get('toUserPermissionForm') as UntypedFormGroup;
  }

  get throughUserPermissionFormGroup() {
    return this.documentForm.get('throughUserPermissionForm') as UntypedFormGroup;
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

  SaveDocument() {
    if (this.documentForm.valid) {
      this.onSaveDocument.emit(this.buildDocumentObject());
    } else {
      this.documentForm.markAllAsTouched();
    }
  }

  buildDocumentObject(): DocumentInfo {
    const documentMetaTags = this.documentMetaTagsArray.getRawValue();
    const document: DocumentInfo = {
      categoryId: this.documentForm.get('categoryId').value,
      description: this.documentForm.get('description').value,
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

    const selectedToUsers: User[] =
      this.documentForm.get('selectedToUsers').value ?? [];
    if (selectedToUsers?.length > 0) {
      document.documentUserPermissions = selectedToUsers.map((user) => {
        return Object.assign(
          {},
          {
            id: '',
            documentId: '',
            userId: user.id,
          },
          this.toUserPermissionFormGroup.value
        );
      });
    }

    const selectedThroughUsers: User[] =
      this.documentForm.get('selectedThroughUsers').value ?? [];
    if (selectedThroughUsers?.length > 0) {
      document.documentUserPermissions = selectedThroughUsers.map((user) => {
        return Object.assign(
          {},
          {
            id: '',
            documentId: '',
            userId: user.id,
          },
          this.throughUserPermissionFormGroup.value
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

  toUserTimeBoundChange(event: MatCheckboxChange) {
    if (event.checked) {
      this.toUserPermissionFormGroup.get('startDate').setValidators([Validators.required]);
      this.toUserPermissionFormGroup.get('endDate').setValidators([Validators.required]);
    } else {
      this.toUserPermissionFormGroup.get('startDate').clearValidators();
      this.toUserPermissionFormGroup.get('endDate').clearValidators();
      this.toUserPermissionFormGroup.get('startDate').setValue(null);
      this.toUserPermissionFormGroup.get('endDate').setValue(null);
    }
    this.toUserPermissionFormGroup.get('startDate').updateValueAndValidity();
    this.toUserPermissionFormGroup.get('endDate').updateValueAndValidity();
  }

  throughUserTimeBoundChange(event: MatCheckboxChange) {
    if (event.checked) {
      this.throughUserPermissionFormGroup.get('startDate').setValidators([Validators.required]);
      this.throughUserPermissionFormGroup.get('endDate').setValidators([Validators.required]);
    } else {
      this.throughUserPermissionFormGroup.get('startDate').clearValidators();
      this.throughUserPermissionFormGroup.get('endDate').clearValidators();
      this.throughUserPermissionFormGroup.get('startDate').setValue(null);
      this.throughUserPermissionFormGroup.get('endDate').setValue(null);
    }
    this.throughUserPermissionFormGroup.get('startDate').updateValueAndValidity();
    this.throughUserPermissionFormGroup.get('endDate').updateValueAndValidity();
  }

  getCategoryName(categoryId: string): string {
    const category = this.allCategories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  }

  getSelectedRolesString(): string {
    const selectedRoles = this.documentForm.get('selectedRoles').value;
    if (!selectedRoles || selectedRoles.length === 0) return '';
    return selectedRoles.map(role => role.name).join(', ');
  }
  
   getSelectedThroughUsersString(): string {
    const selectedThroughUsers = this.documentForm?.get('selectedThroughUsers')?.value;
    if (!selectedThroughUsers || selectedThroughUsers.length === 0) {
      return '';
    }
    return selectedThroughUsers.map(user => `${user.firstName} ${user.lastName}`).join(', ');
  }

  getCurrentUser(): string {
    const authObj = JSON.parse(localStorage.getItem('authObj'));
    if (authObj && authObj.user) {
      return `${authObj.user.firstName} ${authObj.user.lastName}`;
    }
    return '';
  }

  getCurrentDate(): Date {
    return new Date();
  }

  onEditorChange(event: any): void {
    // Force change detection to update preview immediately
    this.cd.detectChanges();
  }

  openAiModal(): void {
    this.aiPrompt = '';
    this.isGenerating = false;
    this.showModal = true;
    
    // Focus on the textarea once the modal is shown
    setTimeout(() => {
      const promptTextarea = document.getElementById('aiPromptInput') as HTMLTextAreaElement;
      if (promptTextarea) {
        promptTextarea.focus();
      }
    }, 500);
  }

  closeAiModal(): void {
    this.showModal = false;
    this.errorMessage = '';
  }

  generateContent(): void {
    if (!this.aiPrompt.trim() || this.isGenerating) return;

    this.isGenerating = true;
    this.errorMessage = '';

    this.openAIService.generateContent(this.aiPrompt).subscribe({
      next: (response) => {
        if (response && response.content) {
          // Get the current content
          const currentContent = this.documentForm.get('content').value || '';
          // Append the new content
          const newContent = currentContent + (currentContent ? '\n\n' : '') + response.content;
          // Update the form control
          this.documentForm.patchValue({
            content: newContent
          });
          this.isGenerating = false;
          this.closeAiModal();
        } else {
          this.errorMessage = 'Invalid response from AI service';
          this.isGenerating = false;
        }
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Error generating content:', error);
        this.errorMessage = error.message || 'Error connecting to AI service. Please try again.';
        this.isGenerating = false;
        this.cd.detectChanges();
      }
    });
  }
}
