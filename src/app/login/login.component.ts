import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { BaseComponent } from '../base.component';
import { Router } from '@angular/router';
import { UserAuth } from '@core/domain-classes/user-auth';
import { SecurityService } from '@core/security/security.service';
import { ToastrService } from 'ngx-toastr';
import { CommonError } from '@core/error-handler/common-error';
import { Direction } from '@angular/cdk/bidi';
import { TranslationService } from '@core/services/translation.service';
import { DOCUMENT } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from '@core/services/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends BaseComponent implements OnInit {
  loginFormGroup: UntypedFormGroup;
  lat: number;
  lng: number;
  logoImage = '';
  bannerImage = '';
  direction: Direction;
  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private securityService: SecurityService,
    private toastr: ToastrService,
    private translationService: TranslationService,
    private commonService: CommonService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private matDialogRef: MatDialog
  ) {
    super();
    this.companyProfileSubscription();
    this.getLangDir();
  }

  ngOnInit(): void {
    this.matDialogRef.closeAll();
    this.createFormGroup();
    navigator.geolocation.getCurrentPosition((position) => {
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
    });
  }

  getLangDir() {
    this.sub$.sink = this.translationService.lanDir$.subscribe(
      (c: Direction) => {
        this.direction = c;
        if (this.direction == 'rtl') {
          this.renderer.addClass(this.document.body, 'rtl');
        } else {
          this.renderer.removeClass(this.document.body, 'rtl');
        }
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

  onLoginSubmit() {
    if (this.loginFormGroup.valid) {
      const userObject = {
        email: this.loginFormGroup.get('userName').value,
        password: this.loginFormGroup.get('password').value,
      };
      this.sub$.sink = this.securityService.login(userObject).subscribe(
        (c: UserAuth) => {
          this.getAllAllowFileExtension();
          this.toastr.success('User login successfully.');
          if (this.securityService.hasClaim('dashboard_view_dashboard')) {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        },
        (err: CommonError) => {
          this.toastr.error(err.error['message']);
        }
      );
    } else {
      this.loginFormGroup.markAllAsTouched();
    }
  }

  createFormGroup(): void {
    this.loginFormGroup = this.fb.group({
      userName: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  getAllAllowFileExtension() {
    this.commonService
      .getAllowFileExtensions()
      .subscribe();
  }
}
