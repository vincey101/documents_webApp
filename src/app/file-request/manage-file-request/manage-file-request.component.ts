import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AbstractControlOptions,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FileRequest } from '@core/domain-classes/file-request';
import { FileType } from '@core/domain-classes/file-type.enum';
import { TranslationService } from '@core/services/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { FileRequestService } from '../file-request.service';
import { FileSizes } from '../../core/domain-classes/file-sizes.enum';
import { FileSizeLabelDirective } from '../file-size-label.directive';
import { FileRequestInfo } from '@core/domain-classes/file-request-info';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime-ex';

@Component({
  selector: 'app-manage-file-request',
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
    CommonModule,
    RouterModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    FeatherModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FileSizeLabelDirective,
    SharedModule,
  ],
  templateUrl: './manage-file-request.component.html',
  styleUrl: './manage-file-request.component.scss',
})
export class ManageFileRequestComponent
  extends BaseComponent
  implements OnInit {
  baseUrl = `${window.location.protocol}//${window.location.host}/file-requests/preview/`;
  isEditMode: boolean = false;
  minDate = new Date();
  fileRequestForm: FormGroup;
  fileTypes: { key: string; value: number }[] = [];
  get extensions(): FormArray {
    return this.fileRequestForm.get('extensions') as FormArray;
  }
  passwordFieldType: string = 'password';

  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private fileRequestService: FileRequestService,
    private toastrService: ToastrService,
    private translationService: TranslationService
  ) {
    super();
  }

  createFileRequestForm(): void {
    this.fileRequestForm = this.fb.group(
      {
        id: [''],
        isLinkExpiryTime: [false],
        linkExpiryTime: [''],
        hasPassword: [false],
        password: [''],
        subject: ['', Validators.required],
        email: ['', Validators.email],
        maxDocument: [1, Validators.required],
        sizeInMb: [FileSizes.LessThan5MB],
        fileType: [[], Validators.required],
        baseUrl: [this.baseUrl],
      },
      {
        validators: [this.checkData],
      } as AbstractControlOptions
    );
  }

  checkData(group: UntypedFormGroup) {
    let hasPassword = group.get('hasPassword').value;
    let password = group.get('password').value;
    const data = {};
    if (hasPassword && !password) {
      data['passwordValidator'] = true;
    }
    return data;
  }

  ngOnInit(): void {
    this.fileTypes = this.getEnumValues(FileType);
    this.createFileRequestForm();
    this.sub$.sink = this.activeRoute.data.subscribe(
      (data: { fileRequest: FileRequestInfo }) => {
        if (data.fileRequest) {
          this.isEditMode = true;
          let fileExtensions = data.fileRequest.allowExtension
            ? data.fileRequest.allowExtension.split(',').filter(c => c).map(ext => ext && FileType[ext.trim()])
            : [];
          fileExtensions = [...new Set(fileExtensions)]
          this.fileRequestForm.patchValue({
            id: data.fileRequest.id,
            subject: data.fileRequest.subject,
            email: data.fileRequest.email,
            maxDocument: data.fileRequest.maxDocument,
            sizeInMb: data.fileRequest.sizeInMb,
            isLinkExpiryTime: data.fileRequest.linkExpiryTime ? true : false,
            linkExpiryTime: data.fileRequest.linkExpiryTime ? new Date(data.fileRequest.linkExpiryTime) : null,
            hasPassword: data.fileRequest.hasPassword,
            password: data.fileRequest.password,
            fileType: fileExtensions,
            baseUrl: this.baseUrl,
          });
        }
      }
    );
  }

  fileSizeOptions = Object.keys(FileSizes)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      label: '',
      value: FileSizes[key as keyof typeof FileSizes]
    }));

  getEnumValues(enumObj: any): { key: string; value: number }[] {
    return Object.keys(enumObj)
      .filter((key) => isNaN(Number(key)))
      .map((key) => ({
        key: key,
        value: enumObj[key],
      }));
  }

  saveFileRequest() {
    if (this.fileRequestForm.valid) {
      const fileRequest = this.createBuildObject();
      if (this.isEditMode) {
        this.sub$.sink = this.fileRequestService
          .updateFileRequest(fileRequest)
          .subscribe(() => {
            this.toastrService.success(
              this.translationService.getValue(
                'FILE_REQUEST_UPDATED_SUCCESSFULLY'
              )
            );
            this.router.navigate(['/file-request']);
          });
      } else {
        this.sub$.sink = this.fileRequestService
          .addFileRequest(fileRequest)
          .subscribe(() => {
            this.toastrService.success(
              this.translationService.getValue(
                'FILE_REQUEST_CREATED_SUCCESSFULLY'
              )
            );
            this.router.navigate(['/file-request']);
          });
      }
    } else {
      this.fileRequestForm.markAllAsTouched();
    }
  }

  createBuildObject(): FileRequest {
    const id = this.fileRequestForm.get('id').value;
    const selectedFileTypes = this.fileRequestForm.get('fileType').value;

    const data: FileRequest = {
      id: id,
      subject: this.fileRequestForm.get('subject').value,
      email: this.fileRequestForm.get('email').value,
      maxDocument: this.fileRequestForm.get('maxDocument').value,
      sizeInMb: this.fileRequestForm.get('sizeInMb').value,
      isLinkExpired: false,
      hasPassword: false,
      password: this.fileRequestForm.get('hasPassword').value
        ? this.fileRequestForm.get('password').value
        : '',
      linkExpiryTime: this.fileRequestForm.get('isLinkExpiryTime').value ?
        this.fileRequestForm.get('linkExpiryTime').value : null,
      fileExtension: selectedFileTypes,
      baseUrl: this.baseUrl,
    };
    return data;
  }

}
