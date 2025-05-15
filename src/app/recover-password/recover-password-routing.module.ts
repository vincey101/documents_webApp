import { NgModule } from '@angular/core';
import { RecoverPasswordComponent } from './recover-password.component';
import { RouterModule, Routes } from '@angular/router';
import { RecoverPasswordResolverService } from './recover-password-resolver';



const routes: Routes = [
  {
    path: ':id',
    component: RecoverPasswordComponent,
    resolve: { user: RecoverPasswordResolverService },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecoverPasswordRoutingModule { }
