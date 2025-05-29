import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { User } from '@core/domain-classes/user';
import { CommonError } from '@core/error-handler/common-error';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent extends BaseComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = [
    'action',
    'email',
    'firstName',
    'lastName',
    'department',
    'phoneNumber',
  ];
  constructor(
    private userService: UserService,
    private toastrService: ToastrService,
    private commonService: CommonService,
    private commonDialogService: CommonDialogService,
    private dialog: MatDialog,
    private router: Router,
    private translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.getUsers();
  }

  deleteUser(user: User) {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE'),
        user.userName
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.sub$.sink = this.userService
            .deleteUser(user.id)
            .subscribe(() => {
              this.toastrService.success(
                this.translationService.getValue('USER_DELETED_SUCCESSFULLY')
              );
              this.getUsers();
            });
        }
      });
  }

  getUsers(): void {
    this.sub$.sink = this.commonService.getUsers().subscribe(
      (data: User[]) => {
        this.users = data;
      },
      (err: CommonError) => {
        err.messages.forEach((msg) => {
          this.toastrService.error(msg);
        });
      }
    );
  }

  resetPassword(user: User): void {
    this.dialog.open(ResetPasswordComponent, {
      width: '350px',
      data: Object.assign({}, user),
    });
  }

  editUser(userId: string) {
    this.router.navigate(['/users/manage', userId]);
  }
  userPermission(userId: string) {
    this.router.navigate(['/users/permission', userId]);
  }
}
