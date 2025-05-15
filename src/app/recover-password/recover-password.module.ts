import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RecoverPasswordRoutingModule } from './recover-password-routing.module';
import { RecoverPasswordComponent } from './recover-password.component';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    RecoverPasswordComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RecoverPasswordRoutingModule,
    TranslateModule,
    MatButtonModule
  ]
})
export class RecoverPasswordModule { }
