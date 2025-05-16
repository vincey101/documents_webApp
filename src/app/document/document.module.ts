import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentRoutingModule } from './document-routing.module';
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentManageComponent } from './document-manage/document-manage.component';
import { DocumentManagePresentationComponent } from './document-manage-presentation/document-manage-presentation.component';
import { DocumentEditComponent } from './document-edit/document-edit.component';
import { MatSortModule } from '@angular/material/sort';
import { SharedModule } from '@shared/shared.module';
import { DocumentPermissionModule } from './document-permission/document-permission.module';
import { SendEmailComponent } from './send-email/send-email.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DocumentReminderComponent } from './document-reminder/document-reminder.component';
import { MatIconModule } from '@angular/material/icon';
import { DocumentCommentComponent } from './document-comment/document-comment.component';
import { DocumentUploadNewVersionComponent } from './document-upload-new-version/document-upload-new-version.component';
import { DocumentVersionHistoryComponent } from './document-version-history/document-version-history.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
} from 'ng-pick-datetime-ex';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharableLinkComponent } from './sharable-link/sharable-link.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DocumentDeepSearchComponent } from './document-deep-search/document-deep-search.component';

@NgModule({
  declarations: [
    DocumentListComponent,
    DocumentManageComponent,
    DocumentManagePresentationComponent,
    DocumentEditComponent,
    SendEmailComponent,
    DocumentReminderComponent,
    DocumentCommentComponent,
    DocumentUploadNewVersionComponent,
    DocumentVersionHistoryComponent,
    SharableLinkComponent,
    DocumentDeepSearchComponent,
  ],
  imports: [
    CommonModule,
    DocumentRoutingModule,
    ReactiveFormsModule,
    MatTableModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    SharedModule,
    MatProgressBarModule,
    DocumentPermissionModule,
    MatCheckboxModule,
    MatMenuModule,
    CKEditorModule,
    MatChipsModule,
    MatRadioModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgSelectModule,
    ClipboardModule,
  ],
})
export class DocumentModule {}
