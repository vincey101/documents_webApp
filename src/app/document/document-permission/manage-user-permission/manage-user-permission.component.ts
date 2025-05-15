import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentUserPermission } from '@core/domain-classes/document-user-permission';
import { User } from '@core/domain-classes/user';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { DocumentPermissionService } from '../document-permission.service';

@Component({
  selector: 'app-manage-user-permission',
  templateUrl: './manage-user-permission.component.html',
  styleUrls: ['./manage-user-permission.component.scss'],
})
export class ManageUserPermissionComponent
  extends BaseComponent
  implements OnInit
{
  minDate: Date;
  permissionForm: UntypedFormGroup;
  constructor(
    private documentPermissionService: DocumentPermissionService,
    private toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { users: User[]; documentId: string },
    private dialogRef: MatDialogRef<ManageUserPermissionComponent>,
    private fb: UntypedFormBuilder,
    private translationService: TranslationService
  ) {
    super();
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.createUserPermissionForm();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  createUserPermissionForm() {
    this.permissionForm = this.fb.group({
      isTimeBound: new UntypedFormControl(false),
      startDate: [''],
      endDate: [''],
      isAllowDownload: new UntypedFormControl(false),
      selectedUsers: [],
    });
  }

  timeBoundChange(event: MatCheckboxChange) {
    if (event.checked) {
      this.permissionForm.get('startDate').setValidators([Validators.required]);
      this.permissionForm.get('endDate').setValidators([Validators.required]);
    } else {
      this.permissionForm.get('startDate').clearValidators();
      this.permissionForm.get('startDate').updateValueAndValidity();
      this.permissionForm.get('endDate').clearValidators();
      this.permissionForm.get('endDate').updateValueAndValidity();
    }
  }

  saveDocumentUserPermission() {
    if (!this.permissionForm.valid) {
      this.permissionForm.markAllAsTouched();
      return;
    }
    const selectedUsers: User[] =
      this.permissionForm.get('selectedUsers').value ?? [];
    if (selectedUsers?.length == 0) {
      this.toastrService.error(
        this.translationService.getValue('PLEASE_SELECT_ATLEAST_ONE_USER')
      );
      return;
    }
    const documentUserPermission: DocumentUserPermission[] = selectedUsers.map(
      (user) => {
        return Object.assign(
          {},
          {
            id: '',
            documentId: this.data.documentId,
            userId: user.id,
          },
          this.permissionForm.value
        );
      }
    );

    this.sub$.sink = this.documentPermissionService
      .addDocumentUserPermission(documentUserPermission)
      .subscribe(() => {
        this.toastrService.success(
          this.translationService.getValue('PERMISSION_ADDED_SUCCESSFULLY')
        );
        this.dialogRef.close(true);
      });
  }

  onNoClick() {
    this.dialogRef.close();
  }
}
