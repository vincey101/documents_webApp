import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { User } from '@core/domain-classes/user';
import { UserAuth } from '@core/domain-classes/user-auth';
import { SecurityService } from '@core/security/security.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css'],
})
export class MyProfileComponent extends BaseComponent implements OnInit {
  userForm: UntypedFormGroup;
  user: UserAuth;
  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    private userService: UserService,
    private toastrService: ToastrService,
    private dialog: MatDialog,
    private securityService: SecurityService,
    private translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createUserForm();
    this.user = this.securityService.getUserDetail();
    if (this.user) {
      this.userForm.patchValue(this.user.user);
    }
  }

  createUserForm() {
    this.userForm = this.fb.group({
      id: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
    });
  }

  updateProfile() {
    if (this.userForm.valid) {
      const user = this.createBuildObject();
      this.sub$.sink = this.userService
        .updateUserProfile(user)
        .subscribe((user: User) => {
          this.user.user.firstName = user.firstName;
          this.user.user.lastName = user.lastName;
          this.user.user.phoneNumber = user.phoneNumber;
          this.toastrService.success(
            this.translationService.getValue('PROFILE_UPDATED_SUCCESSFULLY')
          );
          this.securityService.setUserDetail(this.user);
          this.router.navigate(['/']);
        });
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  createBuildObject(): User {
    const user: User = {
      id: this.userForm.get('id').value,
      firstName: this.userForm.get('firstName').value,
      lastName: this.userForm.get('lastName').value,
      email: this.userForm.get('email').value,
      phoneNumber: this.userForm.get('phoneNumber').value,
      userName: this.userForm.get('email').value,
    };
    return user;
  }

  changePassword(): void {
    this.dialog.open(ChangePasswordComponent, {
      width: '350px',
      data: Object.assign({}, this.user.user),
    });
  }
}
