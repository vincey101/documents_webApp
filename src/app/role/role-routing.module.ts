import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@core/security/auth.guard';
import { ManageRoleComponent } from './manage-role/manage-role.component';
import { RoleDetailResolverService } from './role-detail.resolver';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleUsersComponent } from './role-users/role-users.component';

const routes: Routes = [
  {
    path: '',
    component: RoleListComponent,
    data: { claimType: 'ROLE_VIEW_ROLES' },
    canActivate: [AuthGuard],
  },
  {
    path: 'manage/:id',
    component: ManageRoleComponent,
    resolve: { role: RoleDetailResolverService },
    data: { claimType: 'ROLE_EDIT_ROLE' },
    canActivate: [AuthGuard],
  },
  {
    path: 'manage',
    component: ManageRoleComponent,
    data: { claimType: 'ROLE_CREATE_ROLE' },
    canActivate: [AuthGuard],
  },
  {
    path: 'users',
    component: RoleUsersComponent,
    data: { claimType: 'USER_ASSIGN_USER_ROLE' },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleRoutingModule { }
