import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ResponseHeader } from '@core/domain-classes/document-header';
import { Reminder } from '@core/domain-classes/reminder';
import { ReminderFrequency } from '@core/domain-classes/reminder-frequency';
import { ReminderResourceParameter } from '@core/domain-classes/reminder-resource-parameter';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@shared/pipes/pipes.module';
import { SharedModule } from '@shared/shared.module';
import { merge, tap } from 'rxjs';
import { BaseComponent } from 'src/app/base.component';
import { ReminderDataSource } from 'src/app/reminder/reminder-list/reminder-datasource';
import { ReminderService } from 'src/app/reminder/reminder.service';

@Component({
  selector: 'app-document-reminders',
  standalone: true,
  imports: [TranslateModule, PipesModule, MatTableModule, CommonModule,
    SharedModule,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    PipesModule],
  templateUrl: './document-reminders.component.html',
  styleUrl: './document-reminders.component.scss'
})
export class DocumentRemindersComponent extends BaseComponent implements OnChanges, OnInit, AfterViewInit {
  @Input() documentId: string = '';
  @Input() shouldLoad = false;
  dataSource: ReminderDataSource;
  reminders: Reminder[] = [];
  reminderFrequencies: ReminderFrequency[] = [];
  displayedColumns: string[] = [
    'startDate',
    'endDate',
    'subject',
    'message',
    'frequency'
  ];
  footerToDisplayed = ['footer'];
  reminderResource: ReminderResourceParameter;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  private reminderService= inject(ReminderService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shouldLoad'] && this.shouldLoad) {
      this.dataSource.loadData(this.reminderResource);
    }
  }

  ngOnInit(): void {
    this.reminderResource = new ReminderResourceParameter();
    this.reminderResource.documentId = this.documentId;
    this.reminderResource.pageSize = 10;
    this.reminderResource.orderBy = 'startDate desc';
    this.dataSource = new ReminderDataSource(this.reminderService);
    this.getResourceParameter();
  }

  ngAfterViewInit() {
    this.sub$.sink = this.sort.sortChange.subscribe(
      () => (this.paginator.pageIndex = 0)
    );
    this.sub$.sink = merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.reminderResource.skip =
            this.paginator.pageIndex * this.paginator.pageSize;
          this.reminderResource.pageSize = this.paginator.pageSize;
          this.reminderResource.orderBy =
            this.sort.active + ' ' + this.sort.direction;
          this.dataSource.loadData(this.reminderResource);
        })
      )
      .subscribe();
  }

  getResourceParameter() {
    this.sub$.sink = this.dataSource.responseHeaderSubject$.subscribe(
      (c: ResponseHeader) => {
        if (c) {
          this.reminderResource.pageSize = c.pageSize;
          this.reminderResource.skip = c.skip;
          this.reminderResource.totalCount = c.totalCount;
        }
      }
    );
  }
}


