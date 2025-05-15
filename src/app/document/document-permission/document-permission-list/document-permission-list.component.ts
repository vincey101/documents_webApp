import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentPermission } from '@core/domain-classes/document-permission';
import { DocumentRolePermission } from '@core/domain-classes/document-role-permission';
import { DocumentUserPermission } from '@core/domain-classes/document-user-permission';
import { Role } from '@core/domain-classes/role';
import { User } from '@core/domain-classes/user';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { DocumentPermissionService } from '../document-permission.service';
import { ManageRolePermissionComponent } from '../manage-role-permission/manage-role-permission.component';
import { ManageUserPermissionComponent } from '../manage-user-permission/manage-user-permission.component';

@Component({
  selector: 'app-document-permission-list',
  templateUrl: './document-permission-list.component.html',
  styleUrls: ['./document-permission-list.component.scss'],
})
export class DocumentPermissionListComponent
  extends BaseComponent
  implements OnInit {
  documentPermissions: DocumentPermission[] = [];
  document: DocumentInfo;
  users: User[] = [];
  roles: Role[] = [];
  documentPermissionsColumns = [
    'action',
    'type',
    'isAllowDownload',
    'name',
    'email',
    'startDate',
    'endDate',
  ];
  footerToDisplayed = ['footer'];
  permissionsDataSource: MatTableDataSource<DocumentPermission>;
  @ViewChild('userPermissionsPaginator') userPermissionsPaginator: MatPaginator;

  constructor(
    private documentPermissionService: DocumentPermissionService,
    private route: ActivatedRoute,
    private commonDialogService: CommonDialogService,
    private toastrService: ToastrService,
    private dialog: MatDialog,
    private commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: DocumentInfo,
    private dialogRef: MatDialogRef<DocumentPermissionListComponent>,
    private translationService: TranslationService
  ) {
    super();
    this.document = data;
  }

  ngOnInit(): void {
    this.sub$.sink = this.route.params.subscribe(() => {
      this.getDocumentPrmission();
      this.getUsers();
      this.getRoles();
    });
  }

  getDocumentPrmission() {
    this.sub$.sink = this.documentPermissionService
      .getDoucmentPermission(this.document.id)
      .subscribe((permission: DocumentPermission[]) => {
        this.documentPermissions = permission;
        this.permissionsDataSource = new MatTableDataSource(
          this.documentPermissions
        );
        this.permissionsDataSource.paginator = this.userPermissionsPaginator;
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

  deleteDocumentUserPermission(permission: DocumentUserPermission) {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE')
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.sub$.sink = this.documentPermissionService
            .deleteDocumentUserPermission(permission.id)
            .subscribe(() => {
              this.toastrService.success(
                this.translationService.getValue(
                  'PERMISSION_DELETED_SUCCESSFULLY'
                )
              );
              this.getDocumentPrmission();
            });
        }
      });
  }

  deleteDocumentRolePermission(permission: DocumentRolePermission) {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE')
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.sub$.sink = this.documentPermissionService
            .deleteDocumentRolePermission(permission.id)
            .subscribe(() => {
              this.toastrService.success(
                this.translationService.getValue(
                  'PERMISSION_DELETED_SUCCESSFULLY'
                )
              );
              this.getDocumentPrmission();
            });
        }
      });
  }

  addDocumentUserPermission(): void {
    const dialogRef = this.dialog.open(ManageUserPermissionComponent, {
      width: '600px',
      data: Object.assign({ users: this.users, documentId: this.document.id }),
    });
    this.sub$.sink = dialogRef.afterClosed().subscribe((result: Screen) => {
      if (result) {
        this.getDocumentPrmission();
      }
    });
  }

  addDocumentRolePermission(): void {
    const dialogRef = this.dialog.open(ManageRolePermissionComponent, {
      width: '600px',
      data: Object.assign({ roles: this.roles, documentId: this.document.id }),
    });

    this.sub$.sink = dialogRef.afterClosed().subscribe((result: Screen) => {
      if (result) {
        this.getDocumentPrmission();
      }
    });
  }

  applyPermissionFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    const userPermissions = this.documentPermissions.filter(
      (d: any) =>
        (d.type == 'User' &&
          (d.user.firstName.toLocaleLowerCase().includes(filterValue) ||
            d.user.lastName.toLocaleLowerCase().includes(filterValue) ||
            d.user.email.toLocaleLowerCase().includes(filterValue))) ||
        (d.type == 'Role' &&
          d.role.name.toLocaleLowerCase().includes(filterValue))
    );
    this.permissionsDataSource = new MatTableDataSource(userPermissions);
    this.permissionsDataSource.paginator = this.userPermissionsPaginator;
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
