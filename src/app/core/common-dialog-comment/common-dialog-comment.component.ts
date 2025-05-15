import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BaseComponent } from 'src/app/base.component';

@Component({
  selector: 'app-common-dialog-comment',
  templateUrl: './common-dialog-comment.component.html',
  styleUrl: './common-dialog-comment.component.scss'
})
export class CommonDialogCommentComponent extends BaseComponent implements OnInit {
  primaryMessage: string;
  note: string = '';
  commentForm: UntypedFormGroup;

  constructor(public dialogRef: MatDialogRef<CommonDialogCommentComponent>,
    private fb: UntypedFormBuilder,
  ) { super(); }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required]],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  clickHandler(flag: boolean): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }
    if (flag) {
      const comment = this.commentForm.get('comment').value;
      this.dialogRef.close({
        flag: flag,
        comment: comment
      });
    }
    else {
      this.dialogRef.close(false);
    }
  }
}
