import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LanguagesListComponent } from './languages-list/languages-list.component';
import { AuthGuard } from '@core/security/auth.guard';
import { ManageLanguageComponent } from './manage-language/manage-language.component';
import { ManageLanguageResolverService } from './manage-language/manage-language.resolver';

const routes: Routes = [
  {
    path: '',
    component: LanguagesListComponent,
    canActivate: [AuthGuard],
    data: { claimType: 'SETTING_MANAGE_LANGUAGE' },
  },
  {
    path: 'add',
    component: ManageLanguageComponent,
    data: { claimType: 'SETTING_MANAGE_LANGUAGE' },
    canActivate: [AuthGuard],
  },
  {
    path: 'manage/:id',
    component: ManageLanguageComponent,
    resolve: {
      language: ManageLanguageResolverService,
    },
    data: { claimType: 'SETTING_MANAGE_LANGUAGE' },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LanguagesRoutingModule { }
