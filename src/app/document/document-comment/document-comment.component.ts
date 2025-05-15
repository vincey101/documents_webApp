import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { DocumentComment } from '@core/domain-classes/document-comment';
import { TranslationService } from '@core/services/translation.service';
import { BaseComponent } from 'src/app/base.component';
import { DocumentCommentService } from './document-comment.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-document-comment',
  templateUrl: './document-comment.component.html',
  styleUrls: ['./document-comment.component.scss'],
})
export class DocumentCommentComponent extends BaseComponent implements OnInit {
  commentForm: UntypedFormGroup;
  documentComments: DocumentComment[] = [];
  isCommentChanged = false;

  constructor(
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private documentCommentService: DocumentCommentService,
    private dialogRef: MatDialogRef<DocumentCommentComponent>,
    private commonDialogService: CommonDialogService,
    private translationService: TranslationService,
    private toastrService: ToastrService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createForm();
    this.getDocumentComment();
  }

  closeDialog() {
    this.dialogRef.close(this.isCommentChanged);
  }

  createForm() {
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required]],
    });
  }
  getDocumentComment() {
    this.sub$.sink = this.documentCommentService
      .getDocumentComment(this.data.id)
      .subscribe((c: DocumentComment[]) => {
        this.documentComments = c;
      });
  }
  patchComment(comment: string) {
    this.commentForm.patchValue({
      comment: comment,
    });
  }

  addComment() {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }
    const documentComment: DocumentComment = {
      documentId: this.data.id,
      comment: this.commentForm.get('comment').value,
    };
    this.sub$.sink = this.documentCommentService
      .saveDocumentComment(documentComment)
      .subscribe(() => {
        this.isCommentChanged = true;
        this.patchComment('');
        this.commentForm.markAsUntouched();
        this.getDocumentComment();
      });
  }
  onDelete(id: string) {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE')
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.sub$.sink = this.documentCommentService
            .deleteDocumentComment(id)
            .subscribe(() => {
              this.isCommentChanged = true;
              this.toastrService.success(
                this.translationService.getValue(`COMMENT_DELETED_SUCCESSFULLY`)
              );
              this.getDocumentComment();
            });
        }
      });
  }
}
