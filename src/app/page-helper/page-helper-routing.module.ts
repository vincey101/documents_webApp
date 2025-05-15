import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageHelperListComponent } from './page-helper-list/page-helper-list.component';
import { ManagePageHelperComponent } from './manage-page-helper/manage-page-helper.component';
import { AuthGuard } from '@core/security/auth.guard';
import { PageHelperDetailResolverService } from './page-helper-detail-resolver';

const routes: Routes = [
  {
    path: '',
    component: PageHelperListComponent,
    data: { claimType: 'PAGE_HELPER_MANAGE_PAGE_HELPER' },
    canActivate: [AuthGuard],
  },
  {
    path: 'manage/:id',
    component: ManagePageHelperComponent,
    resolve: { pageHelper: PageHelperDetailResolverService },
    data: { claimType: 'PAGE_HELPER_MANAGE_PAGE_HELPER' },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PageHelperRoutingModule { }
