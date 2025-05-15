import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { BaseComponent } from 'src/app/base.component';
import { AIPromptTemplateService } from '../template-open-ai.service';
import { AiDocumentGeneratorModalComponent } from '../ai-document-generator-modal/ai-document-generator-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { OpenAiDocumentDataSource } from './ai-document-datasource';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge, Observable } from 'rxjs';
import { ResponseHeader } from '@core/domain-classes/document-header';
import { OpenAiDocuments } from '@core/domain-classes/open-ai-documents';
import { OpenAiDocumentResource } from '@core/domain-classes/open-ai-document-resource';
import { MatMenuModule } from '@angular/material/menu';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { OpenAIStreamService } from '../openai-stream.service';

@Component({
  selector: 'app-ai-document-generator-list',
  standalone: true,
  imports: [FormsModule,
    TranslateModule,
    CommonModule,
    RouterModule,
    MatButtonModule,
    ReactiveFormsModule,
    FeatherModule,
    MatIconModule,
    MatCardModule,
    SharedModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatSortModule,
    MatMenuModule,
  ],
  templateUrl: './ai-document-generator-list.component.html',
  styleUrl: './ai-document-generator-list.component.scss'
})
export class AiDocumentGeneratorListComponent extends BaseComponent implements OnInit, AfterViewInit {

  dataSource: OpenAiDocumentDataSource;
  openAiDocuments: OpenAiDocuments[] = [];
  displayedColumns: string[] = ['action', 'prompt', 'language', 'maximumLength', 'creativity', 'toneOfVoice', 'createdAt'];

  footerToDisplayed = ['footer'];
  openAiDocumentResource: OpenAiDocumentResource;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: ElementRef;

  constructor() {
    super();
    this.openAiDocumentResource = new OpenAiDocumentResource();
    this.openAiDocumentResource.pageSize = 10;
    this.openAiDocumentResource.orderBy = 'createdAt desc';
  }

  private aIPromptTemplateService = inject(AIPromptTemplateService);
  private commonDialogService = inject(CommonDialogService);
  private translationService = inject(TranslationService);
  private toastrService = inject(ToastrService);
  private dialog = inject(MatDialog);
  private openAIStreamService = inject(OpenAIStreamService);

  ngOnInit(): void {
    this.dataSource = new OpenAiDocumentDataSource(this.aIPromptTemplateService);
    this.dataSource.loadOpenAiDocuments(this.openAiDocumentResource);
    this.getResourceParameter();
  }

  ngAfterViewInit() {
    if (this.sort && this.paginator) {
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

      this.sub$.sink = merge(this.sort.sortChange, this.paginator.page)
        .pipe(
          tap(() => {
            this.openAiDocumentResource.pageSize = this.paginator.pageSize;
            this.openAiDocumentResource.skip =
              this.paginator.pageIndex * this.paginator.pageSize;
            this.openAiDocumentResource.pageSize = this.paginator.pageSize;
            this.openAiDocumentResource.orderBy =
              this.sort.active + ' ' + this.sort.direction;
            this.dataSource.loadOpenAiDocuments(this.openAiDocumentResource);
          })
        )
        .subscribe();

      this.sub$.sink = fromEvent(this.input.nativeElement, 'keyup')
        .pipe(debounceTime(1000), distinctUntilChanged(),
          tap(() => {
            this.paginator.pageIndex = 0;
            this.openAiDocumentResource.skip = 0;
            this.openAiDocumentResource.prompt = this.input.nativeElement.value;
            this.dataSource.loadOpenAiDocuments(this.openAiDocumentResource);
          })
        )
        .subscribe();
    }
  }

  getResourceParameter() {
    this.sub$.sink = this.dataSource.responseHeaderSubject$.subscribe(
      (c: ResponseHeader) => {
        if (c) {
          this.openAiDocumentResource.pageSize = c.pageSize;
          this.openAiDocumentResource.skip = c.skip;
          this.openAiDocumentResource.totalCount = c.totalCount;
        }
      }
    );
  }

  viewAiDocument(prompt: OpenAiDocuments): void {
    this.openAIStreamService.getOpenAiDocumentResponse(prompt.id)
      .subscribe((data: OpenAiDocuments) => {

        this.dialog.open(AiDocumentGeneratorModalComponent, {
          width: '80vw',
          maxHeight: '80vh',
          data: Object.assign({}, data),
        });

      });

  }

  deleteAiDocument(openAiDocument: OpenAiDocuments) {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE'),
        openAiDocument.prompt
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.sub$.sink = this.aIPromptTemplateService.deleteOpenAiDocument(openAiDocument.id)
            .subscribe(() => {
              this.toastrService.success(
                this.translationService.getValue('OPEN_AI_DOCUMENT_DELETE_SUCCESSFULLY')
              );
              this.dataSource.loadOpenAiDocuments(this.openAiDocumentResource);
            });
        }
      });
  }
}
