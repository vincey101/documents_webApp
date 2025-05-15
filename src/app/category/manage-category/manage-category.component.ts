import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category } from '@core/domain-classes/category';
import { BaseComponent } from 'src/app/base.component';
import { CategoryStore } from '../store/category-store';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-manage-category',
  templateUrl: './manage-category.component.html',
  styleUrls: ['./manage-category.component.scss'],
})
export class ManageCategoryComponent
  extends BaseComponent {
  isEdit = false;
  categoryForm: FormGroup;
  categortStore = inject(CategoryStore);
  constructor(
    public dialogRef: MatDialogRef<ManageCategoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Category,
    private fb: FormBuilder
  ) {
    super();
    this.categoryForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      description: [''],
      parentId: [data?.parentId],
    });
    if (this.data?.id) {
      this.isEdit = true;
      this.categoryForm.patchValue(this.data);
    }
    this.subscribeIsAddorUpdate();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const category: Category = this.categoryForm.value;
    if (category.id) {
      this.categortStore.updateCategory(category);
    } else {
      this.categortStore.addCategory(category);
    }
  }

  subscribeIsAddorUpdate() {
    toObservable(this.categortStore.isAddUpdate).subscribe((flag) => {
      if (flag) {
        this.dialogRef.close();
      }
      this.categortStore.resetFlag();
    });
  }
}
