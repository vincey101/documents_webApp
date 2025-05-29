import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';

import { UserListComponent } from './user-list/user-list.component';
import { ManageUserComponent } from './manage-user/manage-user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserDetailResolverService } from './user-detail-resolver';
import { UserPermissionComponent } from './user-permission/user-permission.component';
import { UserPermissionPresentationComponent } from './user-permission-presentation/user-permission-presentation.component';
import { SharedModule } from '@shared/shared.module';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    UserListComponent,
    ManageUserComponent,
    UserPermissionComponent,
    UserPermissionPresentationComponent,
    ResetPasswordComponent,
    MyProfileComponent,
    ChangePasswordComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatDialogModule,
    MatSlideToggleModule,
    SharedModule,
    MatMenuModule,
    MatButtonModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatIconModule,
    NgSelectModule,
  ],
  providers: [UserDetailResolverService],
})
export class UserModule {}
