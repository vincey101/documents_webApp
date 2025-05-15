import { AfterViewInit, Component, inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DocumentAuditTrail } from '@core/domain-classes/document-audit-trail';
import { ResponseHeader } from '@core/domain-classes/document-header';
import { DocumentResource } from '@core/domain-classes/document-resource';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@shared/pipes/pipes.module';
import { merge, tap } from 'rxjs';
import { BaseComponent } from 'src/app/base.component';
import { DocumentAuditTrialDataSource } from 'src/app/document-audit-trail/document-audit-trail-datassource';
import { DocumentAuditTrailService } from 'src/app/document-audit-trail/document-audit-trail.service';

@Component({
  selector: 'app-document-audit-trails',
  standalone: true,
  imports: [TranslateModule, PipesModule, MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './document-audit-trails.component.html',
  styleUrl: './document-audit-trails.component.scss'
})
export class DocumentAuditTrailsComponent extends BaseComponent implements OnChanges, OnInit, AfterViewInit {
  @Input() documentId: string = '';
  @Input() shouldLoad = false;
  dataSource: DocumentAuditTrialDataSource;
  documentAuditTrails: DocumentAuditTrail[] = [];
  displayedColumns: string[] = [
    'createdDate',
    'operationName',
    'createdBy',
    'permissionUser',
    'permissionRole',
  ];
  footerToDisplayed = ['footer'];
  documentResource: DocumentResource;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  private documentAuditTrailService = inject(DocumentAuditTrailService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shouldLoad'] && this.shouldLoad) {
      this.dataSource.loadDocumentAuditTrails(this.documentResource);
    }
  }

  ngOnInit(): void {
    this.documentResource = new DocumentResource();
    this.documentResource.documentId = this.documentId;
    this.documentResource.pageSize = 10;
    this.documentResource.orderBy = 'createdDate desc';
    this.dataSource = new DocumentAuditTrialDataSource(this.documentAuditTrailService);
    this.getResourceParameter();
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

  // @Input() documentId: string = '';

  // documentAuditTrails: DocumentAuditTrail[] = [];
  // documentAuditTrailService = inject(DocumentAuditTrailService);
  // documentResource: DocumentResource;
  // dataSource: DocumentAuditTrialDataSource;

  // documentAuditTrailDataSource: MatTableDataSource<DocumentAuditTrail>;
  // @ViewChild('documentAuditTrailPaginator') documentAuditTrailPaginator: MatPaginator;

  // displayedColumns: string[] = ['createdDate', 'documentName', 'categoryName', 'operationName', 'createdBy', 'permissionUser', 'permissionRole',];
  // footerToDisplayed = ['footer'];



  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['documentId']) {
  //     this.getDocumentAuditTrails();
  //   }
  // }

  // getDocumentAuditTrails() {
  //   this.documentResource = new DocumentResource();
  //   this.documentResource.documentId = this.documentId;
  //   this.dataSource = new DocumentAuditTrialDataSource(this.documentAuditTrailService);
  //   this.dataSource.loadDocumentAuditTrails(this.documentResource);

  //   this.documentAuditTrailDataSource.paginator = this.documentAuditTrailPaginator;
  // }

}