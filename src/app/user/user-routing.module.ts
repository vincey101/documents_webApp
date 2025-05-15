import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@core/security/auth.guard';
import { ManageUserComponent } from './manage-user/manage-user.component';
import { UserDetailResolverService } from './user-detail-resolver';
import { UserListComponent } from './user-list/user-list.component';
import { UserPermissionComponent } from './user-permission/user-permission.component';

const routes: Routes = [
  {
    path: '',
    component: UserListComponent,
    data: { claimType: 'USER_VIEW_USERS' },
    canActivate: [AuthGuard],
  },
  {
    path: 'manage/:id',
    component: ManageUserComponent,
    resolve: { user: UserDetailResolverService },
    data: { claimType: 'USER_EDIT_USER' },
    canActivate: [AuthGuard],
  },
  {
    path: 'manage',
    component: ManageUserComponent,
    data: { claimType: 'USER_CREATE_USER' },
    canActivate: [AuthGuard],
  },
  {
    path: 'permission/:id',
    component: UserPermissionComponent,
    resolve: { user: UserDetailResolverService },
    data: { claimType: 'USER_ASSIGN_PERMISSION' },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
