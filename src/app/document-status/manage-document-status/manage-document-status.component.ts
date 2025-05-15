import { NgIf } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { DocumentStatusService } from '../document-status.service';
import { DocumentStatus } from '@core/domain-classes/document-status';
import { ColorPickerDirective } from 'ngx-color-picker';
import { DocumentStatusStore } from '../store/document-status.store';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-manage-document-status',
  standalone: true,
  imports: [
    TranslateModule,
    FeatherModule,
    NgIf,
    MatIconModule,
    SharedModule,
    MatDialogModule,
    ColorPickerDirective,

  ],
  templateUrl: './manage-document-status.component.html',
  styleUrl: './manage-document-status.component.scss'
})
export class ManageDocumentStatusComponent {
  public isLoading: boolean = false;
  isEditMode: boolean = false;
  documentStatusForm: FormGroup;
  colorCode: string = '#ffffff'; // default color
  documentStatusStore = inject(DocumentStatusStore);
  public documentStatusService = inject(DocumentStatusService);
  private fb = inject(FormBuilder);

  constructor(
    public dialogRef: MatDialogRef<ManageDocumentStatusComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DocumentStatus
  ) {
    this.subscribeIsAddorUpdate();
  }

  ngOnInit(): void {
    this.createDocumentStatusForm();
  }

  createDocumentStatusForm(): void {
    this.colorCode = this.data?.colorCode ?? '#ffffff';
    this.documentStatusForm = this.fb.group({
      name: [
        this.data?.name ?? '',
        [Validators.required],
      ],
      description: [this.data?.description ?? '', Validators.required],
    });
  }

  saveDocumentStatus(): void {
    if (!this.documentStatusForm.valid) {
      this.documentStatusForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (this.data) {
      const id = this.data.id;
      const documentStatus = {
        ...this.documentStatusForm.value,
        id: id,
        colorCode: this.colorCode,
      };
      this.documentStatusStore.updateDocumentStatus(documentStatus);
      this.isLoading = false;
    } else {
      const documentStatus = {
        ...this.documentStatusForm.value,
        colorCode: this.colorCode,
      };
      this.documentStatusStore.addDocumentStatus(documentStatus);
      this.isLoading = false;
    }
  }

  subscribeIsAddorUpdate() {
    toObservable(this.documentStatusStore.isAddorUpdate).subscribe((flag) => {
      if (flag) {
        this.dialogRef.close(this.documentStatusStore.curruntStatus());
      }
      this.documentStatusStore.resetFlag();
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
