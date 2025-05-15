import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../user/user.service';
import { TranslationService } from '@core/services/translation.service';
import { User } from '@core/domain-classes/user';
import { SecurityService } from '@core/security/security.service';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss'],
})
export class RecoverPasswordComponent extends BaseComponent implements OnInit {
  resetPasswordForm: FormGroup;
  logoImage = '';
  bannerImage = '';
  constructor(
    private activeRoute: ActivatedRoute,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private translationService: TranslationService,
    private securityService: SecurityService
  ) {
    super();
    this.companyProfileSubscription();
  }

  ngOnInit(): void {
    this.activeRoute.data.subscribe(
      (data: { user: User }) => {
        if (data.user.email) {
          this.createResetPasswordForm();
          this.resetPasswordForm.get('userName').setValue(data.user.email);
        } else {
          this.toastrService.error(
            this.translationService.getValue('WORNG_LINK_OR_LINK_IS_EXPIRED')
          );
          this.router.navigate(['/login']);
        }
      },
      () => this.router.navigate(['/login'])
    );
  }

  createResetPasswordForm() {
    this.resetPasswordForm = this.fb.group(
      {
        userName: [{ value: '', disabled: true }, [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validator: this.checkPasswords,
      }
    );
  }

  checkPasswords(group: UntypedFormGroup) {
    const pass = group.get('password').value;
    const confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { notSame: true };
  }

  resetPassword() {
    if (!this.resetPasswordForm.valid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }
    const resetPasswordData = this.resetPasswordForm.getRawValue();
    this.userService.recoverPassword(resetPasswordData).subscribe(
      (d) => {
        this.toastrService.success(
          this.translationService.getValue('SUCCESSFULLY_RESET_PASSWORD')
        );
        this.router.navigate(['/login']);
      }
    );
  }

  companyProfileSubscription() {
    this.securityService.companyProfile.subscribe((profile) => {
      if (profile) {
        this.logoImage = profile.logoUrl;
        this.bannerImage = profile.bannerUrl;
      }
    });
  }
}
