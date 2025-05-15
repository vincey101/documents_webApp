import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Category } from '@core/domain-classes/category';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { ResponseHeader } from '@core/domain-classes/document-header';
import { DocumentResource } from '@core/domain-classes/document-resource';
import { User } from '@core/domain-classes/user';
import { CommonError } from '@core/error-handler/common-error';
import { CommonService } from '@core/services/common.service';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BaseComponent } from '../base.component';
import { DocumentAuditTrialDataSource } from './document-audit-trail-datassource';
import { DocumentAuditTrailService } from './document-audit-trail.service';
import { Direction } from '@angular/cdk/bidi';
import { TranslationService } from '@core/services/translation.service';
import { DocumentOperation } from '@core/domain-classes/document-operation';
import { CategoryStore } from '../category/store/category-store';

@Component({
  selector: 'app-document-audit-trail',
  templateUrl: './document-audit-trail.component.html',
  styleUrls: ['./document-audit-trail.component.scss'],
})
export class DocumentAuditTrailComponent
  extends BaseComponent
  implements OnInit, AfterViewInit {
  dataSource: DocumentAuditTrialDataSource;
  documentOperations = Object.values(DocumentOperation);
  documentAuditTrails: DocumentAuditTrail[] = [];
  displayedColumns: string[] = [
    'createdDate',
    'documentName',
    'categoryName',
    'operationName',
    'createdBy',
    'permissionUser',
    'permissionRole',
  ];
  footerToDisplayed = ['footer'];
  documentResource: DocumentResource;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: ElementRef;
  users: User[] = [];
  direction: Direction;
  categoryStore = inject(CategoryStore);

  constructor(
    private documentAuditTrailService: DocumentAuditTrailService,
    private commonService: CommonService,
    private translationService: TranslationService
  ) {
    super();
    this.documentResource = new DocumentResource();
    this.documentResource.pageSize = 10;
    this.documentResource.orderBy = 'createdDate desc';
  }

  ngOnInit(): void {
    this.dataSource = new DocumentAuditTrialDataSource(
      this.documentAuditTrailService
    );
    this.dataSource.loadDocumentAuditTrails(this.documentResource);
    this.getResourceParameter();
    this.getUsers();
    this.getLangDir();
  }

  getLangDir() {
    this.sub$.sink = this.translationService.lanDir$.subscribe(
      (c: Direction) => (this.direction = c)
    );
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    this.sub$.sink = merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.documentResource.skip =
            this.paginator.pageIndex * this.paginator.pageSize;
          this.documentResource.pageSize = this.paginator.pageSize;
          this.documentResource.orderBy =
            this.sort.active + ' ' + this.sort.direction;
          this.dataSource.loadDocumentAuditTrails(this.documentResource);
        })
      )
      .subscribe();

    this.sub$.sink = fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.documentResource.skip = 0;
          this.documentResource.name = this.input.nativeElement.value;
          this.dataSource.loadDocumentAuditTrails(this.documentResource);
        })
      )
      .subscribe();
  }

  onCategoryChange(filtervalue: string) {
    if (filtervalue) {
      this.documentResource.categoryId = filtervalue;
    } else {
      this.documentResource.categoryId = '';
    }
    this.documentResource.skip = 0;
    this.paginator.pageIndex = 0;
    this.dataSource.loadDocumentAuditTrails(this.documentResource);
  }

  onUserChange(filterValue: string) {
    if (filterValue) {
      this.documentResource.createdBy = filterValue;
    } else {
      this.documentResource.createdBy = '';
    }
    this.documentResource.skip = 0;
    this.paginator.pageIndex = 0;
    this.dataSource.loadDocumentAuditTrails(this.documentResource);
  }

  onOperationChange(filterValue: string) {
    if (filterValue) {
      this.documentResource.operation = filterValue;
    } else {
      this.documentResource.operation = '';
    }
    this.documentResource.skip = 0;
    this.paginator.pageIndex = 0;
    this.dataSource.loadDocumentAuditTrails(this.documentResource);
  }

  getUsers(): void {
    this.sub$.sink = this.commonService.getUsersForDropdown().subscribe(
      (data: User[]) => {
        this.users = data;
      },
      (err: CommonError) => {
        err.messages.forEach(() => {
          // this.toastrService.error(msg);
        });
      }
    );
  }

  getResourceParameter() {
    this.sub$.sink = this.dataSource.responseHeaderSubject$.subscribe(
      (c: ResponseHeader) => {
        if (c) {
          this.documentResource.pageSize = c.pageSize;
          this.documentResource.skip = c.skip;
          this.documentResource.totalCount = c.totalCount;
        }
      }
    );
  }
}
