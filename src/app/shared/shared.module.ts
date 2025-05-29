import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { BasePreviewComponent } from './base-preview/base-preview.component';
import { HasClaimDirective } from './has-claim.directive';
import { PipesModule } from './pipes/pipes.module';
import { ImagePreviewComponent } from './image-preview/image-preview.component';
import { OfficeViewerComponent } from './office-viewer/office-viewer.component';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { TextPreviewComponent } from './text-preview/text-preview.component';
import { AudioPreviewComponent } from './audio-preview/audio-preview.component';
import { VideoPreviewComponent } from './video-preview/video-preview.component';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from './material.module';
import { FeatherIconsModule } from './feather-icons.module';
import { NoPreviewAvailableComponent } from './no-preview-available/no-preview-available.component';
import { DocumentLinkPreviewComponent } from './document-link-preview/document-link-preview.component';
import { DocumentLinkPreviewPasswordComponent } from './document-link-preview/document-link-preview-password/document-link-preview-password.component';
import { PageHelpPreviewComponent } from './page-help-preview/page-help-preview.component';
import { PageHelpTextComponent } from './page-help-text/page-help-text.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatButtonModule } from '@angular/material/button';
@NgModule({
  declarations: [
    HasClaimDirective,
    ImagePreviewComponent,
    BasePreviewComponent,
    PdfViewerComponent,
    TextPreviewComponent,
    OfficeViewerComponent,
    AudioPreviewComponent,
    VideoPreviewComponent,
    NoPreviewAvailableComponent,
    DocumentLinkPreviewComponent,
    DocumentLinkPreviewPasswordComponent,
    PageHelpPreviewComponent,
    PageHelpTextComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    OverlayModule,
    NgxExtendedPdfViewerModule,
    PipesModule,
    TranslateModule,
    FeatherIconsModule,
    MatIconModule,
    MatDialogModule,
    CKEditorModule,
    MatButtonModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    FeatherIconsModule,
    HasClaimDirective,
    OverlayModule,
    ImagePreviewComponent,
    BasePreviewComponent,
    AudioPreviewComponent,
    VideoPreviewComponent,
    NoPreviewAvailableComponent,
    TranslateModule,
    PipesModule,
    PageHelpTextComponent,
  ],
})
export class SharedModule {}
