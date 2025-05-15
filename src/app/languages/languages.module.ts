import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguagesListComponent } from './languages-list/languages-list.component';
import { LanguagesRoutingModule } from './languages.routing.module';
import { SharedModule } from '@shared/shared.module';
import { ManageLanguageComponent } from './manage-language/manage-language.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [LanguagesListComponent, ManageLanguageComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LanguagesRoutingModule,
    SharedModule,
    MatTableModule,
    MatCardModule,
    MatCheckboxModule,
  ],
})
export class LanguagesModule {}
