import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyProfile, OpenAiApi, S3Config } from '@core/domain-classes/company-profile';
import { SecurityService } from '@core/security/security.service';
import { TranslationService } from '@core/services/translation.service';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from '../base.component';
import { CompanyProfileService } from './company-profile.service';
import { CommonService } from '@core/services/common.service';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';

@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.css'],
})
export class CompanyProfileComponent extends BaseComponent implements OnInit {
  companyProfileForm: UntypedFormGroup;
  localStorageForm: UntypedFormGroup;
  openAiApiKeyForm: UntypedFormGroup;
  imgSrc: string | ArrayBuffer = '';
  smallLogoSrc: string | ArrayBuffer = '';
  bannerSrc: string | ArrayBuffer = '';
  private oldS3Profile: S3Config;
  private oldCompanyProfile: CompanyProfile;
  constructor(
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private companyProfileService: CompanyProfileService,
    private router: Router,
    private toastrService: ToastrService,
    private securityService: SecurityService,
    public translationService: TranslationService,
    private commonDialogService: CommonDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createform();
    this.createLocalStorageform();
    this.createOpenAiApiKeyform();
    this.route.data.subscribe(
      (data: { profile: CompanyProfile; s3Profile: S3Config; openAikey: OpenAiApi }) => {
        this.oldS3Profile = data.s3Profile;
        this.oldCompanyProfile = data.profile;
        this.companyProfileForm.patchValue(data.profile);
        this.localStorageForm.patchValue(data.s3Profile);
        this.localStorageForm.patchValue(data.s3Profile);
        this.openAiApiKeyForm.patchValue(data.openAikey);

        if (data.profile.logoUrl) {
          this.imgSrc = environment.apiUrl + data.profile.logoUrl;
        }

        if (data.profile.bannerUrl) {
          this.bannerSrc = environment.apiUrl + data.profile.bannerUrl;
        }

        if (data.profile.smallLogoUrl) {
          this.smallLogoSrc = environment.apiUrl + data.profile.smallLogoUrl;
        }
      }
    );
  }

  removeRequired() {
    this.localStorageForm.get('amazonS3key').clearValidators();
    this.localStorageForm.get('amazonS3secret').clearValidators();
    this.localStorageForm.get('amazonS3region').clearValidators();
    this.localStorageForm.get('amazonS3bucket').clearValidators();

    this.localStorageForm.get('amazonS3key').updateValueAndValidity();
    this.localStorageForm.get('amazonS3secret').updateValueAndValidity();
    this.localStorageForm.get('amazonS3region').updateValueAndValidity();
    this.localStorageForm.get('amazonS3bucket').updateValueAndValidity();
  }

  createform() {
    this.companyProfileForm = this.fb.group({
      id: [''],
      title: ['', [Validators.required]],
      logoUrl: [''],
      imageData: [],
      bannerUrl: [''],
      bannerData: [''],
      smallLogoData: [''],
    });
  }

  createLocalStorageform() {
    this.localStorageForm = this.fb.group({
      id: [''],
      amazonS3key: ['', [Validators.required]],
      amazonS3secret: ['', [Validators.required]],
      amazonS3region: ['', [Validators.required]],
      amazonS3bucket: ['', [Validators.required]],
      location: ['local'],
    });

    this.localStorageForm.get('location').valueChanges.subscribe((value) => {
      if (value === 'local') {
        this.removeRequired();
      } else {
        this.localStorageForm
          .get('amazonS3key')
          .setValidators([Validators.required]);
        this.localStorageForm
          .get('amazonS3secret')
          .setValidators([Validators.required]);
        this.localStorageForm
          .get('amazonS3region')
          .setValidators([Validators.required]);
        this.localStorageForm
          .get('amazonS3bucket')
          .setValidators([Validators.required]);

        this.localStorageForm.get('amazonS3key').updateValueAndValidity();
        this.localStorageForm.get('amazonS3secret').updateValueAndValidity();
        this.localStorageForm.get('amazonS3region').updateValueAndValidity();
        this.localStorageForm.get('amazonS3bucket').updateValueAndValidity();
      }
    });
  }

  createOpenAiApiKeyform() {
    this.openAiApiKeyForm = this.fb.group({
      id: [''],
      openApiKey: [''],
    });
  }


  saveCompanyProfile() {
    if (this.companyProfileForm.invalid) {
      this.companyProfileForm.markAllAsTouched();
      return;
    }
    const companyProfile: CompanyProfile =
      this.companyProfileForm.getRawValue();
    this.companyProfileService.updateCompanyProfile(companyProfile).subscribe(
      (companyProfile: CompanyProfile) => {
        if (companyProfile.languages) {
          companyProfile.languages.forEach((lan) => {
            lan.imageUrl = `${environment.apiUrl}${lan.imageUrl}`;
          });
        }
        this.securityService.updateProfile(companyProfile);
        this.toastrService.success(
          this.translationService.getValue(
            'COMPANY_PROFILE_UPDATED_SUCCESSFULLY'
          )
        );
        this.router.navigate(['dashboard']);
      });
  }

  saveLocalStorage() {
    if (this.localStorageForm.invalid) {
      this.localStorageForm.markAllAsTouched();
      return;
    }
    const companyProfile: S3Config = this.localStorageForm.getRawValue();
    if (
      this.oldCompanyProfile.location === 's3' &&
      companyProfile.location === 's3' &&
      this.oldS3Profile !== companyProfile
    ) {
      this.commonDialogService
        .deleteConformationDialog(
          this.translationService.getValue('CHANGE_S3_SETTING_MESSAGE')
        )
        .subscribe((isTrue: boolean) => {
          if (isTrue) {
            this.updateStorage(companyProfile);
          }
        });
    } else {
      this.updateStorage(companyProfile);
    }
  }

  saveOpenAiApiKey() {
    const openAiApi: OpenAiApi = this.openAiApiKeyForm.getRawValue();

    this.companyProfileService.saveOpenAiKey(openAiApi).subscribe(
      () => {
        this.toastrService.success(
          this.translationService.getValue(
            'COMPANY_PROFILE_UPDATED_SUCCESSFULLY'
          )
        );
        this.router.navigate(['dashboard']);
      });
  }

  updateStorage(companyProfile) {
    this.companyProfileService.updateLocalStorage(companyProfile).subscribe(
      () => {
        this.oldCompanyProfile.location = companyProfile.location;
        this.securityService.updateProfile(this.oldCompanyProfile);
        this.toastrService.success(
          this.translationService.getValue(
            'OPEN_AI_API_KEY_VALUE_SAVE_SUCCESSFULLY'
          )
        );
        this.router.navigate(['dashboard']);
      });
  }

  onFileSelect($event) {
    const fileSelected: File = $event.target.files[0];
    if (!fileSelected) {
      return;
    }
    const mimeType = fileSelected.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(fileSelected);
    reader.onload = (_event) => {
      this.imgSrc = reader.result;
      this.companyProfileForm.patchValue({
        imageData: reader.result.toString(),
        logoUrl: fileSelected.name,
      });
      $event.target.value = '';
    };
  }

  triggerLogoIconUpload(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  onLogoIconUpload($event): void {
    const fileSelected: File = $event.target.files[0];
    if (!fileSelected) {
      return;
    }
    const mimeType = fileSelected.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(fileSelected);
    reader.onload = (_event) => {
      this.smallLogoSrc = reader.result;
      this.companyProfileForm.patchValue({
        smallLogoData: reader.result.toString()
      });
      $event.target.value = '';
    };
  }

  onBannerChange($event) {
    const fileSelected: File = $event.target.files[0];
    if (!fileSelected) {
      return;
    }
    const mimeType = fileSelected.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(fileSelected);
    reader.onload = (_event) => {
      this.bannerSrc = reader.result;
      this.companyProfileForm.patchValue({
        bannerData: reader.result.toString(),
        bannerUrl: fileSelected.name,
      });
      $event.target.value = '';
    };
  }
}
