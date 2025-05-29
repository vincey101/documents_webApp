import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Position } from '@core/domain-classes/position';
import { BaseComponent } from 'src/app/base.component';
import { PositionStore } from '../store/position-store';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-manage-position',
  templateUrl: './manage-position.component.html',
  styleUrls: ['./manage-position.component.scss'],
})
export class ManagePositionComponent
  extends BaseComponent {
  isEdit = false;
  positionForm: FormGroup;
  positionStore = inject(PositionStore);
  constructor(
    public dialogRef: MatDialogRef<ManagePositionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Position,
    private fb: FormBuilder
  ) {
    super();
    this.positionForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      description: [''],
      parentId: [data?.parentId],
    });
    if (this.data?.id) {
      this.isEdit = true;
      this.positionForm.patchValue(this.data);
    }
    this.subscribeIsAddorUpdate();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  savePosition(): void {
    if (this.positionForm.invalid) {
      this.positionForm.markAllAsTouched();
      return;
    }

    const position: Position = this.positionForm.value;
    if (position.id) {
      this.positionStore.updatePosition(position);
    } else {
      this.positionStore.addPosition(position);
    }
  }

  subscribeIsAddorUpdate() {
    toObservable(this.positionStore.isAddUpdate).subscribe((flag) => {
      if (flag) {
        this.dialogRef.close();
      }
      this.positionStore.resetFlag();
    });
  }
} 