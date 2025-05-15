import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHelperListComponent } from './page-helper-list/page-helper-list.component';
import { PageHelperListPresentationComponent } from './page-helper-list-presentation/page-helper-list-presentation.component';
import { ManagePageHelperComponent } from './manage-page-helper/manage-page-helper.component';
import { PageHelperRoutingModule } from './page-helper-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { SharedModule } from '@shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { PageHelperDetailResolverService } from './page-helper-detail-resolver';
import { FeatherModule } from 'angular-feather';

@NgModule({
  declarations: [
    PageHelperListComponent,
    PageHelperListPresentationComponent,
    ManagePageHelperComponent
  ],
  imports: [
    CommonModule,
    PageHelperRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatDialogModule,
    SharedModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatButtonModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatIconModule,
    CKEditorModule,
    FeatherModule
  ],
  providers: [
    PageHelperDetailResolverService
  ]
})
export class PageHelperModule { }
