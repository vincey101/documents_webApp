import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { TranslationService } from '@core/services/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf'
import { AddDocumentComponent } from './add-document/add-document.component';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { FeatherModule } from 'angular-feather';
import { SharedModule } from '@shared/shared.module';
import { AiDocumentGeneratorFormComponent } from './ai-document-generator-form/ai-document-generator-form.component';
import { OpenAiMsg } from '@core/domain-classes/open-ai-msg';
import { OpenAIStreamService } from '../openai-stream.service';
import { marked } from 'marked';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-ai-document-generator',
  standalone: true,
  imports: [
    RouterModule,
    TranslateModule,
    MatTableModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    FeatherModule,
    SharedModule,
    CKEditorModule,
    ReactiveFormsModule,
    ToastrModule,
    AiDocumentGeneratorFormComponent
  ],
  templateUrl: './ai-document-generator.component.html',
  styleUrl: './ai-document-generator.component.scss'
})
export class AiDocumentGeneratorComponent {
  editor = ClassicEditor;
  aiEditorForm: FormGroup;
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  toastrService = inject(ToastrService);
  translationService = inject(TranslationService);
  sanitizer = inject(DomSanitizer);
  base64String: string | undefined;
  file: File | undefined;
  dialog = inject(MatDialog);
  openAIStreamService = inject(OpenAIStreamService);
  isLoading = false;
  buffer = '';

  ngOnInit(): void {
    this.createAiEditorForm();
  }
  createAiEditorForm(): void {
    this.aiEditorForm = this.fb.group({
      editorData: ['', [Validators.required]],
    });
  }

  onReady(editor: ClassicEditor): void {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new MyUploadAdapter(
        loader,
        this.http,
        this.toastrService,
        this.translationService
      );
    };
  }


  generateAiDocument($event: OpenAiMsg): void {
    this.buffer = '';
    this.isLoading = true;
    fetch(`${environment.apiUrl}api/stream-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('bearerToken')}`
      },
      body: JSON.stringify($event),
    }).then(async (response) => {
      if (!response.ok) {
        this.isLoading = false;
        const errorText = JSON.parse(await response.text())?.message;
        this.toastrService.error(errorText);
        return;
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        this.appendStreamedText(chunk);
      }
    });
  }

  appendStreamedText(chunk: string) {
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
    for (const line of lines) {
      const payload = line.replace('data: ', '');
      try {
        const parsed = JSON.parse(payload);
        if (parsed.text === '##[[DONE]]##') {
          this.buffer = '';
          this.isLoading = false;
          return;
        }
        const html = this.addChunk(parsed.text);
        this.aiEditorForm.patchValue({
          editorData: html
        });
      } catch (e) {
        this.isLoading = false;
      }
    }
  }

  addChunk(chunk: string) {
    let html = marked.parse(this.buffer) as string;
    this.buffer += chunk;
    if (this.buffer.trim()) {
      html = marked.parse(this.buffer) as string;
    }
    return html;
  }

  saveDocument(): void {
    if (this.aiEditorForm.valid) {
      this.generatePdf().then(() => {
        this.openAddDocumentDialog();
      });
    } else {
      this.aiEditorForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  openAddDocumentDialog(): void {
    const screenWidth = window.innerWidth;
    const dialogWidth = screenWidth < 768 ? '90vw' : '60vw';
    const dialogRef = this.dialog.open(AddDocumentComponent, {
      maxWidth: dialogWidth,
      data: Object.assign({}, { file: this.file }),
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.aiEditorForm.patchValue({
          editorData: ''
        });
      }
    });
  }

  generatePdf() {
    return new Promise((resolve, reject) => {
      let printContents = document.getElementById('pdfDocument') as HTMLElement;
      if (!printContents) {
        return;
      }
      html2canvas(printContents).then((canvas) => {
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 20, imgWidth, imgHeight);
        // Get PDF as Blob
        this.file = this.blobToFile(pdf.output('blob'), 'ai_document.pdf', 'application/pdf');
        resolve(true)
      });
    });
  }

  blobToFile(blob, fileName, mimeType = blob.type) {
    return new File([blob], fileName, {
      type: mimeType,
      lastModified: new Date().getTime(),
    });
  }
}


class MyUploadAdapter {
  constructor(
    private loader: any,
    private http: HttpClient,
    private toastrService: ToastrService,
    private translationService: TranslationService
  ) { }
  upload() {
    return this.loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          this.convertToBase64(file).then((base64: string) => {
            resolve({
              default: base64
            });
          }).catch(error => {
            this.toastrService.error(
              this.translationService.getValue('ERROR_WHILE_UPLOADING_IMAGE')
            );
            reject();
          });
        })
    );
  }
  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // reads file as base64
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}
