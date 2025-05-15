import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DocumentComment } from '@core/domain-classes/document-comment';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentCommentService } from '../../document-comment/document-comment.service';
import { NgFor, NgIf } from '@angular/common';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'app-document-comments',
  standalone: true,
  imports: [
    TranslateModule,
    NgFor,
    NgIf,
    SharedModule,
    ReactiveFormsModule
  ],
  templateUrl: './document-comments.component.html',
  styleUrl: './document-comments.component.scss'
})
export class DocumentCommentsComponent implements OnChanges, OnInit {
  @Input() documentId: string = '';
  @Input() shouldLoad = false;
  documentComments: DocumentComment[] = [];
  commentForm: UntypedFormGroup;
  fb = inject(FormBuilder);

  documentCommentService = inject(DocumentCommentService);
  commonDialogService = inject(CommonDialogService);
  translationService = inject(TranslationService);
  toastrService = inject(ToastrService);

  ngOnInit(): void {
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shouldLoad'] && this.shouldLoad) {
      this.getDocumentComments();

    }
  }

  createForm() {
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required]],
    });
  }


  getDocumentComments() {
    this.documentCommentService
      .getDocumentComment(this.documentId)
      .subscribe((c: DocumentComment[]) => {
        this.documentComments = c;
      });
  }

  addComment() {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }
    const documentComment: DocumentComment = {
      documentId: this.documentId,
      comment: this.commentForm.get('comment').value,
    };
    this.documentCommentService
      .saveDocumentComment(documentComment)
      .subscribe(() => {
        this.patchComment('');
        this.commentForm.markAsUntouched();
        this.getDocumentComments();
      });
  }

  patchComment(comment: string) {
    this.commentForm.patchValue({
      comment: comment,
    });
  }

  onDelete(id: string) {
    this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE')
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.documentCommentService
            .deleteDocumentComment(id)
            .subscribe(() => {
              this.toastrService.success(
                this.translationService.getValue(`COMMENT_DELETED_SUCCESSFULLY`)
              );
              this.getDocumentComments();
            });
        }
      });
  }
}
