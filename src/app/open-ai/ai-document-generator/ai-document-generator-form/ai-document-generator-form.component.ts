import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule, Validators, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { AIPromptTemplate } from '@core/domain-classes/ai-prompt-template';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { containsKeywordValidator } from './contains-keyword-validator';
import { OpenAiMsg } from '@core/domain-classes/open-ai-msg';
import { SecurityService } from '@core/security/security.service';
import { TranslationService } from '@core/services/translation.service';
import { AIPromptTemplateService } from '../../template-open-ai.service';

@Component({
  selector: 'app-ai-document-generator-form',
  standalone: true,
  imports: [
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    FeatherModule,
    MatIconModule,
    CommonModule,
    RouterModule,
    TranslateModule,
    ToastrModule
  ],
  templateUrl: './ai-document-generator-form.component.html',
  styleUrl: './ai-document-generator-form.component.scss'
})
export class AiDocumentGeneratorFormComponent implements OnInit {
  aiPromptTemplates: AIPromptTemplate[] = [];
  aIPromptTemplateService = inject(AIPromptTemplateService);
  translationService = inject(TranslationService);
  toastrService = inject(ToastrService);
  securityService = inject(SecurityService);
  aiPromtForm: FormGroup;
  fb = inject(FormBuilder);
  selectedAiPromptTemplate: AIPromptTemplate | undefined;
  @Output() generateHandler: EventEmitter<OpenAiMsg> = new EventEmitter<OpenAiMsg>();

  get keywords(): FormArray {
    return this.aiPromtForm.get('keywords') as FormArray;
  }

  ngOnInit(): void {
    this.getAiPromtTemplateSettings();
    this.createAiPromptTemplateForm();
  }

  createAiPromptTemplateForm(): void {
    this.aiPromtForm = this.fb.group({
      aIPromptTemplateId: [],
      promptInput: ['', [Validators.required, containsKeywordValidator("**")]],
      language: ['en-US'],
      maximumLength: [1000],
      creativity: ["0.25"],
      keywords: this.fb.array([]),
      toneOfVoice: ['Professional'],
      selectedModel: ['gpt-3.5-turbo']
    });
  }
  getAiPromtTemplateSettings(): void {
    this.aIPromptTemplateService.getAIPromptTemplates().subscribe({
      next:
        (data: AIPromptTemplate[]) => {
          this.aiPromptTemplates = data;
        },
      error: (error) => {
      }
    });
  }
  onAiPromptTemplateChange(event: any): void {
    if (event.value) {
      this.selectedAiPromptTemplate = this.aiPromptTemplates.find((aiPromptTemplate) => aiPromptTemplate.id === event.value);
      if (this.selectedAiPromptTemplate) {
        this.patchAiPromptTemplateData(this.selectedAiPromptTemplate);
        this.keywords.clear(); // Clear existing keywords
        const specialKeywords = this.findSpecialKeywords(this.selectedAiPromptTemplate.promptInput);
        if (specialKeywords.length > 0) {
          this.addKeyword(specialKeywords); // Add new keywords
        }
      }
    }
  }

  findSpecialKeywords(str: string): string[] {
    const regex = /\*\*(.*?)\*\*/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }

  addKeyword(keywords: string[]): void {
    for (const keyword of keywords) {
      const group = this.fb.group({
        keyword: [keyword],
        keywordValue: [''],
      });
      this.keywords.push(group);
    }
  }

  onInputChange(index: number, event: any): void {
    this.replaceArrayKeywordValue();
  }
  replaceArrayKeywordValue(): void {
    let promptInput = this.selectedAiPromptTemplate?.promptInput ?? '';
    for (let i = 0; i < this.keywords.length; i++) {
      const keywordValue = this.keywords.at(i).get('keywordValue')?.value;
      if (keywordValue) {
        const keyword = this.keywords.at(i).get('keyword')?.value;
        promptInput = promptInput?.replace(`**${keyword}**`, keywordValue);
      }
    }
    if (promptInput) {
      this.aiPromtForm.patchValue({
        promptInput: promptInput,
      });
    }
  }

  patchAiPromptTemplateData(data: AIPromptTemplate): void {
    this.aiPromtForm.patchValue({
      aIPromptTemplateId: data?.id,
      promptInput: data?.promptInput,
    });
  }

  buildUserAIPromptTemplate(): OpenAiMsg {
    const openAiMsg: OpenAiMsg = {
      title: this.getTitle(),
      promptInput: this.aiPromtForm.get('promptInput')?.value,
      language: this.aiPromtForm.get('language')?.value,
      maximumLength: this.aiPromtForm.get('maximumLength')?.value,
      creativity: this.aiPromtForm.get('creativity')?.value,
      toneOfVoice: this.aiPromtForm.get('toneOfVoice')?.value,
      selectedModel: this.aiPromtForm.get('selectedModel')?.value
    }
    return openAiMsg;
  }

  getTitle(): string {
    const id = this.aiPromtForm.get('aIPromptTemplateId')?.value;
    if (id) {
      const selectedAiPromptTemplate = this.aiPromptTemplates.find((aiPromptTemplate) => aiPromptTemplate.id === id);
      return selectedAiPromptTemplate?.name || '';
    }
    return '';
  }
  generate() {
    if (this.aiPromtForm.valid) {
      const openAiMsg = this.buildUserAIPromptTemplate();
      this.generateHandler.emit(openAiMsg);
    } else {
      this.aiPromtForm.markAllAsTouched();
    }
  }
}
