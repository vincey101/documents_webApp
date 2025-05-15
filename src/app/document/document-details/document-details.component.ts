import { Component, inject, OnInit } from '@angular/core';

import { DocumentInfo } from '@core/domain-classes/document-info';
import { TranslateModule } from '@ngx-translate/core';
import { BaseComponent } from 'src/app/base.component';
import { DocumentService } from '../document.service';
import { ActivatedRoute, Data } from '@angular/router';
import { DocumentMetaData } from '@core/domain-classes/documentMetaData';
import { NgFor, NgIf } from '@angular/common';
import { PipesModule } from "../../shared/pipes/pipes.module";
import { DocumentVersionsComponent } from './document-versions/document-versions.component';
import { DocumentCommentsComponent } from './document-comments/document-comments.component';
import { DocumentRemindersComponent } from './document-reminders/document-reminders.component';
import { DocumentAuditTrailsComponent } from './document-audit-trails/document-audit-trails.component';
import { FeatherIconsModule } from '@shared/feather-icons.module';
import { Location } from '@angular/common';
import { DocumentPermissionsComponent } from './document-permissions/document-permissions.component';
import { UTCToLocalTime } from '@shared/pipes/utc-to-localtime.pipe';
import { SharedModule } from '@shared/shared.module';
import { DocumentCategory } from '@core/domain-classes/document-category';
import { CategoryStore } from 'src/app/category/store/category-store';
import { ClientStore } from 'src/app/client/client-store';
import { DocumentEditComponent } from '../document-edit/document-edit.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-document-details',
  standalone: true,
  imports: [
    TranslateModule,
    NgFor,
    PipesModule,
    NgIf,
    DocumentVersionsComponent,
    DocumentCommentsComponent,
    DocumentRemindersComponent,
    DocumentAuditTrailsComponent,
    DocumentPermissionsComponent,
    FeatherIconsModule,
    SharedModule,
    MatTabsModule
  ],
  templateUrl: './document-details.component.html',
  styleUrl: './document-details.component.scss'
})
export class DocumentDetailsComponent extends BaseComponent implements OnInit {
  documentInfo: DocumentInfo = {} as DocumentInfo;
  documentService = inject(DocumentService);
  route = inject(ActivatedRoute);
  mataTags = [];
  location = inject(Location);
  categoryStore = inject(CategoryStore);
  clientStore = inject(ClientStore);
  dialog = inject(MatDialog);
  loadedTabs: boolean[] = [true, false, false, false, false, false];

  ngOnInit(): void {
    this.sub$.sink = this.route.data.subscribe((data: Data) => {
      const document = data['document'] as DocumentInfo;
      if (document) {
        this.documentInfo = document;
      }
    })
    this.getDocumentMetaData();
  }

  onTabChange(event: MatTabChangeEvent): void {
    const index = event.index;
    if (!this.loadedTabs[index]) {
      this.loadedTabs[index] = true;
    }
  }

  getDocumentMetaData() {
    this.documentService.getdocumentMetadataById(this.documentInfo.id).subscribe((tags) => {
      const documentMetaData = tags as DocumentMetaData[]
      if (documentMetaData) {
        this.mataTags = documentMetaData;
      }
    })
  }

  refreshDocumentData() {
    this.getDocumentMetaData();
    this.documentService.getDocument(this.documentInfo.id).subscribe((document: DocumentInfo) => {
      this.documentInfo = document;
    });
  }

  editDocument() {
    const documentCategories: DocumentCategory = {
      document: this.documentInfo,
      categories: this.categoryStore.categories(),
      clients: this.clientStore.clients(),
    };
    const dialogRef = this.dialog.open(DocumentEditComponent, {
      width: '600px',
      data: Object.assign({}, documentCategories),
    });

    this.sub$.sink = dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'loaded') {
        this.refreshDocumentData();
      }
    });
  }

  onDocumentCancel() {
    this.location.back();
  }
}
