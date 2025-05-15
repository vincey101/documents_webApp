import { Component, inject, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentPermissionService } from '../../document-permission/document-permission.service';
import { DocumentPermission } from '@core/domain-classes/document-permission';
import { NgIf } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from '@shared/shared.module';
import { MatDialog } from '@angular/material/dialog';
import { DocumentUserPermission } from '@core/domain-classes/document-user-permission';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { DocumentRolePermission } from '@core/domain-classes/document-role-permission';
import { ManageUserPermissionComponent } from '../../document-permission/manage-user-permission/manage-user-permission.component';
import { ManageRolePermissionComponent } from '../../document-permission/manage-role-permission/manage-role-permission.component';
import { CommonService } from '@core/services/common.service';
import { User } from '@core/domain-classes/user';
import { Role } from '@core/domain-classes/role';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime-ex';

@Component({
  selector: 'app-document-permissions',
  standalone: true,
  imports: [
    NgIf,
    FeatherModule,
    MatTableModule,
    TranslateModule,
    MatPaginatorModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
  ],
  templateUrl: './document-permissions.component.html',
  styleUrl: './document-permissions.component.scss'
})

export class DocumentPermissionsComponent implements OnChanges {
  @Input() documentId: string;
  @Input() shouldLoad = false;
  documentPermissions: DocumentPermission[] = [];
  dialog = inject(MatDialog);
  documentPermissionService = inject(DocumentPermissionService);
  commonDialogService = inject(CommonDialogService);
  translationService = inject(TranslationService);
  toastrService = inject(ToastrService);
  commonService = inject(CommonService);
  users: User[] = [];
  roles: Role[] = [];
  isUserLoaded = false;
  isRoleLoaded = false;
  permissionsDataSource: MatTableDataSource<DocumentPermission>;
  @ViewChild('userPermissionsPaginator') userPermissionsPaginator: MatPaginator;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shouldLoad'] && this.shouldLoad) {
      this.getDocumentPrmission();
    }
  }

  getDocumentPrmission() {
    this.documentPermissionService
      .getDoucmentPermission(this.documentId)
      .subscribe((permission: DocumentPermission[]) => {
        this.documentPermissions = permission;
        this.permissionsDataSource = new MatTableDataSource(
          this.documentPermissions
        );
        this.permissionsDataSource.paginator = this.userPermissionsPaginator;
      });
  }

  deleteDocumentUserPermission(permission: DocumentUserPermission) {
    this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE')
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.documentPermissionService
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
    this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE')
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.documentPermissionService
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
    if (this.isUserLoaded) {
      this.openUserPermissionDialog();
    }
    else {
      this.commonService
        .getUsersForDropdown()
        .subscribe((users: User[]) => {
          this.users = users;
          this.isUserLoaded = true;
          this.openUserPermissionDialog();
        });
    }
  }

  openUserPermissionDialog(): void {
    const dialogRef = this.dialog.open(ManageUserPermissionComponent, {
      width: '600px',
      data: Object.assign({ users: this.users, documentId: this.documentId }),
    });
    dialogRef.afterClosed().subscribe((result: Screen) => {
      if (result) {
        this.getDocumentPrmission();
      }
    });
  }

  addDocumentRolePermission(): void {
    if (this.isRoleLoaded) {
      this.openRolePermissionDialog();
    }
    else {
      this.commonService
        .getRolesForDropdown()
        .subscribe((roles: Role[]) => {
          this.roles = roles;
          this.isRoleLoaded = true;
          this.openRolePermissionDialog();
        });
    }
  }

  openRolePermissionDialog(): void {
    const dialogRef = this.dialog.open(ManageRolePermissionComponent, {
      width: '600px',
      data: Object.assign({ roles: this.roles, documentId: this.documentId }),
    });

    dialogRef.afterClosed().subscribe((result: Screen) => {
      if (result) {
        this.getDocumentPrmission();
      }
    });
  }
}
