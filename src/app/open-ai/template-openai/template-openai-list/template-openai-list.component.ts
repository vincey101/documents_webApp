import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Router } from '@angular/router';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { AIPromptTemplate } from '@core/domain-classes/ai-prompt-template';
import { TranslationService } from '@core/services/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { ToastrService } from 'ngx-toastr';
import { AIPromptTemplateService } from '../../template-open-ai.service';
import { BaseComponent } from 'src/app/base.component';

@Component({
  selector: 'app-template-openai-list',
  standalone: true,
  imports: [RouterModule, TranslateModule, MatTableModule, CommonModule, FormsModule, MatIconModule, FeatherModule, SharedModule],
  templateUrl: './template-openai-list.component.html',
  styleUrl: './template-openai-list.component.scss'
})
export class TemplateOpenaiListComponent extends BaseComponent implements OnInit {
  aiPromptTemplates: AIPromptTemplate[] = [];
  displayedColumns: string[] = ['action', 'name', 'description', 'promptInput'];
  isLoadingResults = false;

  private aIPromptTemplateService = inject(AIPromptTemplateService);
  private dialog = inject(MatDialog);
  private toastrService = inject(ToastrService);
  private translationService = inject(TranslationService);
  private commonDialogService = inject(CommonDialogService);
  private router = inject(Router);

  constructor() {
      super();
    }

  ngOnInit(): void {
    this.getAiPromtTemplateSettings();
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

  onAiPromptTemplates(): void {
    this.router.navigate([`ai-template/new`]);
  }

  editAiPromptTemplates(aiPromptTemplates: AIPromptTemplate) {
    this.router.navigate([`/ai-template/${aiPromptTemplates.id}`]);
  }

  deleteAiPromptTemplates(aiPromptTemplates: AIPromptTemplate) {
      this.sub$.sink = this.commonDialogService
        .deleteConformationDialog(
          this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE'),
          aiPromptTemplates.name
        )
        .subscribe((isTrue: boolean) => {
          if (isTrue) {
            this.sub$.sink = this.aIPromptTemplateService.deleteAIPromptTemplate(aiPromptTemplates.id)
              .subscribe(() => {
                this.toastrService.success(
                  this.translationService.getValue('AI_PROMPT_TEMPLATE_DELETE_SUCCESSFULLY')
                );
                this.getAiPromtTemplateSettings();
              });
          }
        });
    }
}

