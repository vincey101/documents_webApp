import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { ResponseHeader } from '@core/domain-classes/document-header';
import { Reminder } from '@core/domain-classes/reminder';
import { ReminderFrequency } from '@core/domain-classes/reminder-frequency';
import { ReminderResourceParameter } from '@core/domain-classes/reminder-resource-parameter';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BaseComponent } from 'src/app/base.component';
import { ReminderDataSource } from './reminder-datasource';
import { ReminderDetailComponent } from '@shared/reminder-detail/reminder-detail.component';

@Component({
  selector: 'app-reminder-list',
  templateUrl: './reminder-list.component.html',
  styleUrls: ['./reminder-list.component.css'],
})
export class ReminderListComponent
  extends BaseComponent
  implements OnInit, AfterViewInit
{
  dataSource: ReminderDataSource;
  reminders: Reminder[] = [];
  reminderFrequencies: ReminderFrequency[] = [];
  displayedColumns: string[] = [
    'action',
    'documentName',
    'startDate',
    'endDate',
    'subject',
    'message',
    'frequency',
  ];
  footerToDisplayed = ['footer'];
  reminderResource: ReminderResourceParameter;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  _subjectFilter: string;
  _messageFilter: string;
  _frequencyFilter: string;

  public filterObservable$: Subject<string> = new Subject<string>();

  public get SubjectFilter(): string {
    return this._subjectFilter;
  }

  public set SubjectFilter(v: string) {
    this._subjectFilter = v;
    const subjectFilter = `subject:${v}`;
    this.filterObservable$.next(subjectFilter);
  }

  public set FrequencyFilter(v: string) {
    if (v == '0') {
      this._frequencyFilter = '0';
    } else {
      this._frequencyFilter = v ? v.toString() : '';
    }
    const frequencyFilter = `frequency:${this._frequencyFilter}`;
    this.filterObservable$.next(frequencyFilter);
  }

  public get FrequencyFilter(): string {
    return this._frequencyFilter;
  }

  public get MessageFilter(): string {
    return this._messageFilter;
  }
  public set MessageFilter(v: string) {
    this._messageFilter = v;
    const messageFilter = `message:${v}`;
    this.filterObservable$.next(messageFilter);
  }

  constructor(
    private dialog: MatDialog,
    private commonService: CommonService,
    private commonDialogService: CommonDialogService,
    private toastrService: ToastrService,
    private dialogRef: MatDialogRef<ReminderListComponent>,
    private translationService: TranslationService
  ) {
    super();
    this.reminderResource = new ReminderResourceParameter();
    this.reminderResource.pageSize = 15;
    this.reminderResource.orderBy = 'startDate desc';
  }

  ngOnInit(): void {
    this.getReminderFrequency();
    this.dataSource = new ReminderDataSource(this.commonService);
    this.dataSource.loadData(this.reminderResource);

    this.sub$.sink = this.filterObservable$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((c) => {
        this.reminderResource.skip = 0;
        const strArray: Array<string> = c.split(':');
        if (strArray[0] === 'subject') {
          this.reminderResource.subject = escape(strArray[1]);
        } else if (strArray[0] === 'message') {
          this.reminderResource.message = strArray[1];
        } else if (strArray[0] === 'frequency') {
          this.reminderResource.frequency = strArray[1];
        }
        this.dataSource.loadData(this.reminderResource);
      });
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

  getReminderFrequency() {
    this.sub$.sink = this.commonService
      .getReminderFrequency()
      .subscribe((f) => (this.reminderFrequencies = [...f]));
  }

  closeDialog() {
    this.dialogRef.close();
  }

  deleteReminder(reminder: Reminder) {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE')
      )
      .subscribe((isTrue) => {
        if (isTrue) {
          this.commonService.deleteReminderCurrentUser(reminder.id).subscribe(
            () => {
              this.toastrService.success(
                this.translationService.getValue(
                  'REMINDER_DELETED_SUCCESSFULLY'
                )
              );
              this.dataSource.loadData(this.reminderResource);
            },
          );
        }
      });
  }

  onDetail(reminder: Reminder) {
    this.dialog.open(ReminderDetailComponent, {
      data: reminder.id,
      width: '80vw',
    });
  }
}
