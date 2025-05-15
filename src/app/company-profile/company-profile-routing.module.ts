import { NgModule } from '@angular/core';
import { CompanyProfileComponent } from './company-profile.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/security/auth.guard';
import { CompanyProfileResolver } from './company-profile.resolver';
import { S3Resolver } from './s3-profile.resolver';
import { OpenAiKeyResolver } from './open-ai-key.resolver';

const routes: Routes = [
  {
    path: '',
    component: CompanyProfileComponent,
    data: {
      claimType: ['SETTING_MANAGE_PROFILE', 'SETTINGS_STORAGE_SETTINGS', 'SETTINGS_MANAGE_OPEN_AI_API_KEY'],
    },
    canActivate: [AuthGuard],
    resolve: {
      profile: CompanyProfileResolver,
      s3Profile: S3Resolver,
      openAikey: OpenAiKeyResolver
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyProfileRoutingModule { }
