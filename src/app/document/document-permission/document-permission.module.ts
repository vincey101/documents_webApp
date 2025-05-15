import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentPermissionListComponent } from './document-permission-list/document-permission-list.component';
import { DocumentPermissionRoutingModule } from './document-permission-routing.module';
import { ManageUserPermissionComponent } from './manage-user-permission/manage-user-permission.component';
import { ManageRolePermissionComponent } from './manage-role-permission/manage-role-permission.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocumentPermissionMultipleComponent } from './document-permission-multiple/document-permission-multiple.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
} from 'ng-pick-datetime-ex';
import { SharedModule } from '@shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    DocumentPermissionListComponent,
    ManageUserPermissionComponent,
    ManageRolePermissionComponent,
    DocumentPermissionMultipleComponent,
  ],
  imports: [
    DocumentPermissionRoutingModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    CommonModule,
    MatTableModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatInputModule,
    MatTabsModule,
    MatCheckboxModule,
    MatChipsModule,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgSelectModule
  ],
  exports: [
    DocumentPermissionListComponent,
    ManageUserPermissionComponent,
    ManageRolePermissionComponent,
    DocumentPermissionMultipleComponent,
  ],
})
export class DocumentPermissionModule {}
