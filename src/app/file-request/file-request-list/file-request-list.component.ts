import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { TranslationService } from '@core/services/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { ToastrService } from 'ngx-toastr';
import { FileRequestService } from '../file-request.service';
import { FileRequestInfo } from '../../core/domain-classes/file-request-info';
import { FileRequestStatusPipe } from '../../shared/pipes/file-request-status.pipe';
import { PipesModule } from '@shared/pipes/pipes.module';
import { FileSizeLabelDirective } from '../file-size-label.directive';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { FileRequestDocumentListComponent } from '../file-request-document-list/file-request-document-list.component';
import { StatusColorDirective } from '../status-color.directive';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FileRequestResource } from '@core/domain-classes/file-request-resource';
import { BaseComponent } from 'src/app/base.component';
import {
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  merge,
  tap,
} from 'rxjs';
import { FileRequestDataSource } from '../file-request-datasource';
import { ResponseHeader } from '@core/domain-classes/document-header';

@Component({
  selector: 'app-file-request-list',
  templateUrl: './file-request-list.component.html',
  styleUrls: ['./file-request-list.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
    CommonModule,
    RouterModule,
    MatButtonModule,
    ReactiveFormsModule,
    FeatherModule,
    MatIconModule,
    MatCardModule,
    SharedModule,
    MatStepperModule,
    MatFormFieldModule,
    FileRequestStatusPipe,
    FileSizeLabelDirective,
    MatSortModule,
    PipesModule,
    MatTooltipModule,
    MatTableModule,
    MatInputModule,
    StatusColorDirective,
    FileRequestDocumentListComponent,
    MatPaginatorModule,
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class FileRequestListComponent
  extends BaseComponent
  implements OnInit, AfterViewInit
{
  dataSource: FileRequestDataSource;
  expandedElement: FileRequestInfo | null;
  displayedColumns: string[] = [
    'action',
    'subject',
    'email',
    'sizeInMb',
    'maxDocument',
    'fileExtension',
    'status',
    'createdBy',
    'createdDate',
    'linkExpiryTime',
  ];
  baseUrl = `${window.location.protocol}//${window.location.host}/file-requests/preview/`;

  footerToDisplayed = ['footer'];
  fileRequestResource: FileRequestResource;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: ElementRef;

  constructor() {
    super();
    this.fileRequestResource = new FileRequestResource();
    this.fileRequestResource.pageSize = 10;
    this.fileRequestResource.orderBy = 'createdDate desc';
  }

  private fileRequestService = inject(FileRequestService);
  private commonDialogService = inject(CommonDialogService);
  private translationService = inject(TranslationService);
  private toastrService = inject(ToastrService);
  private cd = inject(ChangeDetectorRef);
  isExpanded = false;

  ngOnInit(): void {
    this.dataSource = new FileRequestDataSource(this.fileRequestService);
    this.dataSource.loadFileRequests(this.fileRequestResource);
    this.getResourceParameter();
  }

  ngAfterViewInit() {
    if (this.sort && this.paginator) {
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

      this.sub$.sink = merge(this.sort.sortChange, this.paginator.page)
        .pipe(
          tap(() => {
            this.fileRequestResource.pageSize = this.paginator.pageSize;
            this.fileRequestResource.skip =
              this.paginator.pageIndex * this.paginator.pageSize;
            this.fileRequestResource.pageSize = this.paginator.pageSize;
            this.fileRequestResource.orderBy =
              this.sort.active + ' ' + this.sort.direction;
            this.dataSource.loadFileRequests(this.fileRequestResource);
          })
        )
        .subscribe();

        this.sub$.sink = fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.fileRequestResource.skip = 0;
          this.fileRequestResource.subject = this.input.nativeElement.value;
          this.dataSource.loadFileRequests(this.fileRequestResource);
        })
      )
      .subscribe();

    }
  }

  getResourceParameter() {
    this.sub$.sink = this.dataSource.responseHeaderSubject$.subscribe(
      (c: ResponseHeader) => {
        if (c) {
          this.fileRequestResource.pageSize = c.pageSize;
          this.fileRequestResource.skip = c.skip;
          this.fileRequestResource.totalCount = c.totalCount;
        }
      }
    );
  }

  copyToClipboard(fileRequestId: string): void {
    const linkToCopy = `${this.baseUrl}${fileRequestId}`;
    navigator.clipboard
      .writeText(linkToCopy)
      .then(() => {
        this.toastrService.success(
          this.translationService.getValue('LINK_COPIED_TO_CLIPBOARD')
        );
      })
      .catch(() => {
        this.toastrService.error(
          this.translationService.getValue('FAILED_TO_COPY_LINK')
        );
      });
  }

  deleteFileRequest(fileRequest: FileRequestInfo) {
    this.commonDialogService
      .deleteConformationDialog(
        `${this.translationService.getValue(
          'ARE_YOU_SURE_YOU_WANT_TO_DELETE'
        )} ${[fileRequest.subject]}`
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.fileRequestService
            .deleteFileRequest(fileRequest.id)
            .subscribe(() => {
              this.toastrService.success(
                this.translationService.getValue(
                  'FILE_REQUEST_DELETED_SUCCESSFULLY'
                )
              );
              this.dataSource.loadFileRequests(this.fileRequestResource);
            });
        }
      });
  }

  toggleRow(element: FileRequestInfo) {
    this.isExpanded = this.expandedElement != element;
    this.expandedElement = this.expandedElement === element ? null : element;
    this.cd.detectChanges();
  }

  isExpandedRow = (index: number, row: FileRequestInfo): boolean => {
    return row === this.expandedElement;
  };
}
