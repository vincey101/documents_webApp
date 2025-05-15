import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../user/user.service';
import { TranslationService } from '@core/services/translation.service';
import { SecurityService } from '@core/security/security.service';
import { BaseComponent } from '../base.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent extends BaseComponent implements OnInit {
  loginFormGroup: UntypedFormGroup;
  logoImage = '';
  bannerImage = '';

  constructor(
    private fb: UntypedFormBuilder,
    private translationService: TranslationService,
    private userService: UserService,
    private securityService: SecurityService,
    private toastr: ToastrService,
    private router: Router
  ) {
    super();
    this.companyProfileSubscription();
  }

  ngOnInit(): void {
    this.createFormGroup();
  }

  createFormGroup(): void {
    this.loginFormGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onLoginSubmit() {
    if (this.loginFormGroup.valid) {
      const url = `${window.location.protocol}//${window.location.host}`;
      const userObject = Object.assign(this.loginFormGroup.value);
      userObject.userName = userObject.email;
      userObject.hostUrl = url;
      this.userService.sendResetPasswordLink(userObject).subscribe({
        next: (c) => {
          this.toastr.success(
            this.translationService.getValue('EMAIL_SENT_SUCCESSFULLY')
          );
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.loginFormGroup.markAllAsTouched();
    }
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
