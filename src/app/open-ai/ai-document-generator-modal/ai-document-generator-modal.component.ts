import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { OpenAiDocuments } from '@core/domain-classes/open-ai-documents';
import { SharedModule } from '@shared/shared.module';
import { marked } from 'marked';

@Component({
  selector: 'app-ai-document-generator-modal',
  standalone: true,
  imports: [
    CKEditorModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    SharedModule
  ],
  templateUrl: './ai-document-generator-modal.component.html',
  styleUrl: './ai-document-generator-modal.component.scss'
})
export class AiDocumentGeneratorModalComponent implements OnInit {
  editor = ClassicEditor;
  parseData = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: OpenAiDocuments,
    private dialogRef: MatDialogRef<AiDocumentGeneratorModalComponent>) { }

  ngOnInit(): void {
    this.parseData = marked.parse(this.data.response) as string;;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
