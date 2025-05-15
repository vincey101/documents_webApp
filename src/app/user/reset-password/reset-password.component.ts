import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '@core/domain-classes/user';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent extends BaseComponent implements OnInit {
  resetPasswordForm: UntypedFormGroup;
  constructor(
    private userService: UserService,
    private fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<ResetPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private toastrService: ToastrService,
    private translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createResetPasswordForm();
    this.resetPasswordForm.get('email').setValue(this.data.userName);
  }

  createResetPasswordForm() {
    this.resetPasswordForm = this.fb.group(
      {
        email: [{ value: '', disabled: true }],
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
    if (this.resetPasswordForm.valid) {
      this.sub$.sink = this.userService
        .resetPassword(this.createBuildObject())
        .subscribe((d) => {
          this.toastrService.success(
            this.translationService.getValue('SUCCESSFULLY_RESET_PASSWORD')
          );
          this.dialogRef.close();
        });
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }

  createBuildObject(): User {
    return {
      email: this.resetPasswordForm.get('email').value,
      password: this.resetPasswordForm.get('password').value,
      userName: this.resetPasswordForm.get('email').value,
    };
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
