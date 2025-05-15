import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '@core/domain-classes/user';
import { SecurityService } from '@core/security/security.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent extends BaseComponent implements OnInit {
  changePasswordForm: UntypedFormGroup;
  constructor(
    private userService: UserService,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<ChangePasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private toastrService: ToastrService,
    private securityService: SecurityService,
    private translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createChangePasswordForm();
    this.changePasswordForm.get('email').setValue(this.data.email);
  }

  createChangePasswordForm() {
    this.changePasswordForm = this.fb.group(
      {
        email: [{ value: '', disabled: true }],
        oldPasswordPassword: ['', [Validators.required]],
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

  changePassword() {
    if (this.changePasswordForm.valid) {
      this.sub$.sink = this.userService
        .changePassword(this.createBuildObject())
        .subscribe((d) => {
          this.toastrService.success(
            this.translationService.getValue('SUCCESSFULLY_CHANGED_PASSWORD')
          );
          this.securityService.logout();
          this.dialogRef.close();
        });
    } else {
      this.changePasswordForm.markAllAsTouched();
    }
  }

  createBuildObject() {
    return {
      email: '',
      oldPassword: this.changePasswordForm.get('oldPasswordPassword').value,
      newPassword: this.changePasswordForm.get('password').value,
      userName: this.changePasswordForm.get('email').value,
    };
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
