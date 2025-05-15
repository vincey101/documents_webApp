import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentPermission } from '@core/domain-classes/document-permission';
import { PermissionUserRole } from '@core/domain-classes/permission-user-role';
import { Role } from '@core/domain-classes/role';
import { User } from '@core/domain-classes/user';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { DocumentPermissionService } from '../document-permission.service';

@Component({
  selector: 'app-document-permission-multiple',
  templateUrl: './document-permission-multiple.component.html',
  styleUrls: ['./document-permission-multiple.component.scss'],
})
export class DocumentPermissionMultipleComponent
  extends BaseComponent
  implements OnInit {
  documentPermissions: DocumentPermission[] = [];
  documents: DocumentInfo[];
  users: User[] = [];
  roles: Role[] = [];
  permissionForm: UntypedFormGroup;
  minDate: Date = new Date();
  constructor(
    private documentPermissionService: DocumentPermissionService,
    private toastrService: ToastrService,
    private commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: DocumentInfo[],
    private dialogRef: MatDialogRef<DocumentPermissionMultipleComponent>,
    private fb: UntypedFormBuilder,
    private translationService: TranslationService
  ) {
    super();
  }
  ngOnInit() {
    this.documents = this.data;
    this.getUsers();
    this.getRoles();
    this.createFormGroup();
  }
  createFormGroup() {
    this.permissionForm = this.fb.group({
      roles: [],
      users: [],
      isTimeBound: [false],
      startDate: [],
      endDate: [],
      isAllowDownload: [false],
    });
  }

  timeBoundChange(event: MatCheckboxChange) {
    if (event.checked) {
      this.permissionForm.get('startDate').setValidators([Validators.required]);
      this.permissionForm.get('endDate').setValidators([Validators.required]);
      this.permissionForm.updateValueAndValidity();
    } else {
      this.permissionForm.get('startDate').clearValidators();
      this.permissionForm.get('startDate').updateValueAndValidity();
      this.permissionForm.get('endDate').clearValidators();
      this.permissionForm.get('endDate').updateValueAndValidity();
    }
  }

  buildObject() {
    const permissionUserRole: PermissionUserRole = {
      roles: this.permissionForm.get('roles').value ?? [],
      users: this.permissionForm.get('users').value ?? [],
      isTimeBound: this.permissionForm.get('isTimeBound').value,
      startDate: this.permissionForm.get('startDate').value,
      endDate: this.permissionForm.get('endDate').value,
      isAllowDownload: this.permissionForm.get('isAllowDownload').value,
      documents: this.documents.map((c) => c.id),
    };
    return permissionUserRole;
  }
  saveDocumentUserPermission() {
    if (!this.permissionForm.valid) {
      this.permissionForm.markAllAsTouched();
      return;
    }
    const permissionUserRole = this.buildObject();
    if (
      permissionUserRole.roles.length === 0 &&
      permissionUserRole.users.length === 0
    ) {
      this.toastrService.error(
        this.translationService.getValue('PLEASE_SELECT_EITHER_ROLES_OR_USERS')
      );
      return;
    }
    this.sub$.sink = this.documentPermissionService
      .multipleDocumentsToUsersAndRoles(permissionUserRole)
      .subscribe(() => {
        this.toastrService.success(
          this.translationService.getValue(
            'DOCUMENTS_PERMISSION_ASSIGN_TO_USERS_AND_ROLES'
          )
        );
        this.dialogRef.close();
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

  closeDialog() {
    this.dialogRef.close();
  }
}
