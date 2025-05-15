import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AIPromptTemplate } from '@core/domain-classes/ai-prompt-template';
import { TranslationService } from '@core/services/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { ToastrService } from 'ngx-toastr';
import { AIPromptTemplateService } from '../template-open-ai.service';

@Component({
  selector: 'app-template-openai',
  standalone: true,
  imports: [CommonModule, TranslateModule, SharedModule, ReactiveFormsModule, FeatherModule, RouterModule],
  templateUrl: './template-openai.component.html',
  styleUrl: './template-openai.component.scss'
})
export class TemplateOpenaiComponent {
  aiPromtTemplateForm: FormGroup;
  aiPromptTemplate: AIPromptTemplate;
  isEditMode = false;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private aIPromptTemplateService: AIPromptTemplateService,
    private translationService: TranslationService
  ) {
  }

  ngOnInit(): void {
    this.createAiPromptTemplateForm();
    this.getAIPromptResolverData();
  }

  getAIPromptResolverData() {
    this.route.data.subscribe(
      (data: { aIPromptTemplate: AIPromptTemplate }) => {
        if (data.aIPromptTemplate) {
          this.isEditMode = true;
          this.aiPromptTemplate = data.aIPromptTemplate;
          this.patchAiPromptTemplateData();
        }
      }
    );
  }

  addUpdateAiPromptTemplate() {
    if (this.aiPromtTemplateForm.valid) {
      if (this.isEditMode) {
        this.aIPromptTemplateService
          .updateAIPromptTemplate(this.createBuildObject())
          .subscribe((c) => {
            this.toastrService.success(
              this.translationService.getValue(
                'AI_PROMPT_TEMPLATE_SAVE_SUCCESSFULLY'
              )
            );
            this.router.navigate(['/ai-template']);
          });
      } else {
        this.aIPromptTemplateService
          .addAIPromptTemplate(this.createBuildObject())
          .subscribe((c) => {
            this.toastrService.success(
              this.translationService.getValue(
                'AI_PROMPT_TEMPLATE_SAVE_SUCCESSFULLY'
              )
            );
            this.router.navigate(['/ai-template']);
          });
      }
    } else {

    }
  }

   createBuildObject(): AIPromptTemplate {
      const aiprompttemplate: AIPromptTemplate = {
        id: this.aiPromptTemplate ? this.aiPromptTemplate.id : null,
        name: this.aiPromtTemplateForm.get('name').value,
        description: this.aiPromtTemplateForm.get('description').value,
        promptInput: this.aiPromtTemplateForm.get('promptInput').value,
        modifiedDate: new Date()
      }
      return aiprompttemplate;
    }

  createAiPromptTemplateForm() {
    this.aiPromtTemplateForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      description: [''],
      promptInput: ['', [Validators.required]]
    });
  }

  patchAiPromptTemplateData() {
    this.aiPromtTemplateForm.patchValue({
      name: this.aiPromptTemplate.name,
      description: this.aiPromptTemplate.description,
      promptInput: this.aiPromptTemplate.promptInput
    });
  }
}
