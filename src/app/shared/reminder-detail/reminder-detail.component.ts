import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ReminderFrequency } from '@core/domain-classes/reminder-frequency';
import { User } from '@core/domain-classes/user';
import { CommonService } from '@core/services/common.service';
import { BaseComponent } from 'src/app/base.component';
import { Reminder } from '@core/domain-classes/reminder';
import { Frequency } from '@core/domain-classes/frequency.enum';
import { DayOfWeek } from '@core/domain-classes/dayOfWeek.enum';
import { Quarter } from '@core/domain-classes/quarter.enum';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  dayOfWeekArray,
  monthsArray,
} from '@core/domain-classes/reminder-constant';
import { IdName } from '@core/domain-classes/id-name';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule } from '@ngx-translate/core';
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
} from 'ng-pick-datetime-ex';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-reminder-detail',
  templateUrl: './reminder-detail.component.html',
  styleUrls: ['./reminder-detail.component.scss'],
  standalone: true,
  imports: [
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    MatDatepickerModule,
    TranslateModule,
    MatCheckboxModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatIconModule,
    CommonModule,
    MatDialogModule,
    MatButtonModule,
  ],
})
export class ReminderDetailComponent extends BaseComponent implements OnInit {
  reminderFrequencies: ReminderFrequency[] = [];
  reminderForm: UntypedFormGroup;
  minDate = new Date();
  users: User[] = [];
  selectedUsers: User[] = [];
  reminder: Reminder;
  dayOfWeek = dayOfWeekArray;
  months = monthsArray;
  days: number[] = [];

  get dailyRemindersArray(): UntypedFormArray {
    return <UntypedFormArray>this.reminderForm.get('dailyReminders');
  }

  get quarterlyRemindersArray(): UntypedFormArray {
    return <UntypedFormArray>this.reminderForm.get('quarterlyReminders');
  }

  get halfYearlyRemindersArray(): UntypedFormArray {
    return <UntypedFormArray>this.reminderForm.get('halfYearlyReminders');
  }

  constructor(
    private fb: UntypedFormBuilder,
    private commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private dialogRef: MatDialogRef<ReminderDetailComponent>
  ) {
    super();
  }

  ngOnInit(): void {
    for (let i = 1; i <= 31; i++) {
      this.days.push(i);
    }
    this.getReminderFrequency();
    this.createReminderForm();
    this.getReminder();
    //this.getUsers();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getReminder() {
    this.sub$.sink = this.commonService
      .getMyReminder(this.data)
      .subscribe((c: Reminder) => {
        this.reminder = { ...c };
        if (this.reminder.dailyReminders) {
          this.reminder.dailyReminders = this.reminder.dailyReminders.sort(
            (c1, c2) => c1.dayOfWeek - c2.dayOfWeek
          );
        }

        if (this.reminder.quarterlyReminders) {
          this.reminder.quarterlyReminders =
            this.reminder.quarterlyReminders.sort(
              (c1, c2) => c1.quarter - c2.quarter
            );
        }

        if (this.reminder.halfYearlyReminders) {
          this.reminder.halfYearlyReminders =
            this.reminder.halfYearlyReminders.sort(
              (c1, c2) => c1.quarter - c2.quarter
            );
        }
        this.reminderForm.patchValue(this.reminder);
        this.onFrequencyChange();
        this.reminderForm.patchValue(this.reminder);
        if (this.reminderForm.get('isRepeated').value) {
          this.reminderForm
            .get('frequency')
            .setValidators([Validators.required]);
          this.reminderForm.updateValueAndValidity();
        }
      });
  }

  getReminderFrequency() {
    this.sub$.sink = this.commonService
      .getReminderFrequency()
      .subscribe((f) => (this.reminderFrequencies = [...f]));
  }

  createReminderForm() {
    const currentDate = new Date();
    this.reminderForm = this.fb.group({
      id: [''],
      subject: [{ value: '', disabled: true }, [Validators.required]],
      message: [{ value: '', disabled: true }, [Validators.required]],
      frequency: [{ value: '', disabled: true }],
      isRepeated: [{ value: false, disabled: true }],
      isEmailNotification: [{ value: false, disabled: true }],
      startDate: [
        { value: currentDate, disabled: true },
        [Validators.required],
      ],
      endDate: [{ value: null, disabled: true }],
      dayOfWeek: [{ value: null, disabled: true }],
      documentId: [{ value: null, disabled: true }],
    });
  }

  checkData(event: MatCheckboxChange) {
    if (event.checked) {
      this.reminderForm.get('frequency').setValidators([Validators.required]);
    } else {
      this.reminderForm.get('frequency').setValidators([]);
    }
    this.reminderForm.updateValueAndValidity();
  }

  getUsers() {
    this.sub$.sink = this.commonService
      .getUsersForDropdown()
      .subscribe((u: User[]) => {
        this.users = u;
        if (this.reminder) {
          const reminderUsers = this.reminder.reminderUsers.map(
            (c) => c.userId
          );
          this.selectedUsers = this.users.filter(
            (c) => reminderUsers.indexOf(c.id) >= 0
          );
        }
      });
  }

  onFrequencyChange() {
    let frequency = this.reminderForm.get('frequency').value;
    frequency = frequency == 0 ? '0' : frequency;
    if (frequency == Frequency.Daily.toString()) {
      this.removeQuarterlyReminders();
      this.removeHalfYearlyReminders();
      this.addDailReminders();
      this.reminderForm.get('dayOfWeek').setValue('');
    } else if (frequency == Frequency.Weekly.toString()) {
      this.removeDailReminders();
      this.removeQuarterlyReminders();
      this.removeHalfYearlyReminders();
      this.reminderForm.get('dayOfWeek').setValue(new Date().getDay());
    } else if (frequency == Frequency.Quarterly.toString()) {
      this.removeDailReminders();
      this.removeHalfYearlyReminders();
      this.addQuarterlyReminders();
      this.reminderForm.get('dayOfWeek').setValue('');
    } else if (frequency == Frequency.HalfYearly.toString()) {
      this.removeDailReminders();
      this.removeQuarterlyReminders();
      this.addHalfYearlyReminders();
      this.reminderForm.get('dayOfWeek').setValue('');
    } else {
      this.removeDailReminders();
      this.removeQuarterlyReminders();
      this.removeHalfYearlyReminders();
      this.reminderForm.get('dayOfWeek').setValue('');
    }
  }

  addDailReminders() {
    if (!this.reminderForm.contains('dailyReminders')) {
      const formArray = this.fb.array([]);
      formArray.push(this.createDailyReminderFormGroup(DayOfWeek.Sunday));
      formArray.push(this.createDailyReminderFormGroup(DayOfWeek.Monday));
      formArray.push(this.createDailyReminderFormGroup(DayOfWeek.Tuesday));
      formArray.push(this.createDailyReminderFormGroup(DayOfWeek.Wednesday));
      formArray.push(this.createDailyReminderFormGroup(DayOfWeek.Thursday));
      formArray.push(this.createDailyReminderFormGroup(DayOfWeek.Friday));
      formArray.push(this.createDailyReminderFormGroup(DayOfWeek.Saturday));
      this.reminderForm.addControl('dailyReminders', formArray);
    }
  }

  addQuarterlyReminders() {
    if (!this.reminderForm.contains('quarterlyReminders')) {
      const formArray = this.fb.array([]);
      const firstQuaterMonths = this.months.filter(
        (c) => [1, 2, 3].indexOf(c.id) >= 0
      );
      const secondQuaterMonths = this.months.filter(
        (c) => [4, 5, 6].indexOf(c.id) >= 0
      );
      const thirdQuaterMonths = this.months.filter(
        (c) => [7, 8, 9].indexOf(c.id) >= 0
      );
      const forthQuaterMonths = this.months.filter(
        (c) => [10, 11, 12].indexOf(c.id) >= 0
      );
      formArray.push(
        this.createQuarterlyReminderFormGroup(
          Quarter.Quarter1,
          'JAN_MAR',
          firstQuaterMonths
        )
      );
      formArray.push(
        this.createQuarterlyReminderFormGroup(
          Quarter.Quarter2,
          'APR_JUN',
          secondQuaterMonths
        )
      );
      formArray.push(
        this.createQuarterlyReminderFormGroup(
          Quarter.Quarter3,
          'JUL_SEPT',
          thirdQuaterMonths
        )
      );
      formArray.push(
        this.createQuarterlyReminderFormGroup(
          Quarter.Quarter4,
          'OCT_DEC',
          forthQuaterMonths
        )
      );
      this.reminderForm.addControl('quarterlyReminders', formArray);
    }
  }

  addHalfYearlyReminders() {
    if (!this.reminderForm.contains('halfYearlyReminders')) {
      const formArray = this.fb.array([]);
      const firstQuaterMonths = this.months.filter(
        (c) => [1, 2, 3, 4, 5, 6].indexOf(c.id) >= 0
      );
      const secondQuaterMonths = this.months.filter(
        (c) => [7, 8, 9, 10, 11, 12].indexOf(c.id) >= 0
      );
      formArray.push(
        this.createHalfYearlyReminderFormGroup(
          Quarter.Quarter1,
          'JAN_JUN',
          firstQuaterMonths
        )
      );
      formArray.push(
        this.createHalfYearlyReminderFormGroup(
          Quarter.Quarter2,
          'JUL_DEC',
          secondQuaterMonths
        )
      );
      this.reminderForm.addControl('halfYearlyReminders', formArray);
    }
  }

  removeDailReminders() {
    if (this.reminderForm.contains('dailyReminders')) {
      this.reminderForm.removeControl('dailyReminders');
    }
  }

  removeQuarterlyReminders() {
    if (this.reminderForm.contains('quarterlyReminders')) {
      this.reminderForm.removeControl('quarterlyReminders');
    }
  }

  removeHalfYearlyReminders() {
    if (this.reminderForm.contains('halfYearlyReminders')) {
      this.reminderForm.removeControl('halfYearlyReminders');
    }
  }

  createDailyReminderFormGroup(dayOfWeek: DayOfWeek) {
    return this.fb.group({
      id: [''],
      reminderId: [''],
      dayOfWeek: [dayOfWeek],
      isActive: [{ value: true, disabled: true }],
      name: [DayOfWeek[dayOfWeek]],
    });
  }

  createQuarterlyReminderFormGroup(
    quater: Quarter,
    name: string,
    monthValues: IdName[]
  ) {
    return this.fb.group({
      id: [''],
      reminderId: [''],
      quarter: [quater],
      day: [{ value: this.getCurrentDay(), disabled: true }],
      month: [{ value: monthValues[0], disabled: true }],
      name: [name],
      monthValues: [monthValues],
    });
  }

  createHalfYearlyReminderFormGroup(
    quater: Quarter,
    name: string,
    monthValues: IdName[]
  ) {
    return this.fb.group({
      id: [''],
      reminderId: [''],
      quarter: [quater],
      day: [{ value: this.getCurrentDay(), disabled: true }],
      month: [{ value: monthValues[0], disabled: true }],
      name: [name],
      monthValues: [monthValues],
    });
  }

  getCurrentDay(): number {
    return new Date().getDate();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDateChange(formGrouup: AbstractControl<any, any>) {
    const day = formGrouup.get('day').value;
    const month = formGrouup.get('month').value;
    const daysInMonth = new Date(
      new Date().getFullYear(),
      Number.parseInt(month),
      0
    ).getDate();
    if (day > daysInMonth) {
      formGrouup.setErrors({
        invalidDate: 'Invalid Date',
      });
      formGrouup.markAllAsTouched();
    }
  }
}
