import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from "../../shared/shared.module";
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { DocumentStatus } from '@core/domain-classes/document-status';
import { TranslationService } from '@core/services/translation.service';
import { SubSink } from '@shared/sub-sink';
import { ManageDocumentStatusComponent } from '../manage-document-status/manage-document-status.component';
import { DocumentStatusStore } from '../store/document-status.store';

@Component({
  selector: 'app-document-status-list',
  standalone: true,
  imports: [
    TranslateModule,
    SharedModule,
    MatTableModule
  ],
  templateUrl: './document-status-list.component.html',
  styleUrl: './document-status-list.component.scss'
})
export class DocumentStatusListComponent {
  displayedColumns: string[] = ['action', 'name', 'description', 'colorCode'];
  isLoadingResults = false;
  documentStatusStore = inject(DocumentStatusStore);
  private subs = new SubSink();
  private dialog = inject(MatDialog);
  private translationService = inject(TranslationService);
  private commonDialogService = inject(CommonDialogService);

  onCreateDocumentStatus(): void {
    this.dialog.open(ManageDocumentStatusComponent, {
      width: '500px',
    });
  }

  onEditDocumentStatus(documentStatus: DocumentStatus): void {
    this.dialog.open(ManageDocumentStatusComponent, {
      width: '500px',
      data: { ...documentStatus }
    });
  }

  deleteDocumentStatus(id: string): void {
    this.subs.sink = this.commonDialogService
      .deleteConformationDialog(this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE'))
      .subscribe((isConfirmed) => {
        if (isConfirmed) {
          this.isLoadingResults = true;
          this.documentStatusStore.deleteDocumentStatus(id);
        }
      });
  }

  refresh() {
    this.documentStatusStore.loadDocumentStatus();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
