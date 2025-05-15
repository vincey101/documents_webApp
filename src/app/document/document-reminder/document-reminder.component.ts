import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DayOfWeek } from '@core/domain-classes/dayOfWeek.enum';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { Frequency } from '@core/domain-classes/frequency.enum';
import { IdName } from '@core/domain-classes/id-name';
import { Quarter } from '@core/domain-classes/quarter.enum';
import { Reminder } from '@core/domain-classes/reminder';
import {
  dayOfWeekArray,
  monthsArray,
} from '@core/domain-classes/reminder-constant';
import { ReminderFrequency } from '@core/domain-classes/reminder-frequency';
import { User } from '@core/domain-classes/user';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { ReminderService } from 'src/app/reminder/reminder.service';

@Component({
  selector: 'app-document-reminder',
  templateUrl: './document-reminder.component.html',
  styleUrls: ['./document-reminder.component.scss'],
})
export class DocumentReminderComponent extends BaseComponent implements OnInit {
  reminderFrequencies: ReminderFrequency[] = [];
  reminderForm: UntypedFormGroup;
  minDate = new Date();
  users: User[] = [];
  reminder: Reminder;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
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
    private reminderService: ReminderService,
    private commonService: CommonService,
    private toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: DocumentInfo,
    private dialogRef: MatDialogRef<DocumentReminderComponent>,
    private translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    for (let i = 1; i <= 31; i++) {
      this.days.push(i);
    }
    this.getReminderFrequency();
    this.createReminderForm();
    this.getUsers();
  }

  closeDialog() {
    this.dialogRef.close();
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
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]],
      frequency: [''],
      isRepeated: [false],
      isEmailNotification: [false],
      startDate: [currentDate, [Validators.required]],
      endDate: [null],
      dayOfWeek: [new Date().getDay()],
      documentId: [this.data.id],
      selectedUsers: [],
    });
  }

  checkData(event: MatCheckboxChange) {
    if (event.checked) {
      this.reminderForm.get('frequency').setValidators([Validators.required]);
    } else {
      this.reminderForm.get('frequency').setValidators([]);
      this.reminderForm.get('frequency').updateValueAndValidity();
    }
    this.reminderForm.markAllAsTouched();
  }

  createReminder() {
    if (!this.reminderForm.valid) {
      this.reminderForm.markAllAsTouched();
      return;
    }
    const reminder: Reminder = this.reminderForm.value;
    const reminderUsers: User[] =
      this.reminderForm.get('selectedUsers').value ?? [];
    reminder.reminderUsers = reminderUsers?.map((u) => {
      return {
        reminderId: reminder.id,
        userId: u.id,
      };
    });

    if (!reminder.isRepeated) {
      reminder.dailyReminders = [];
      reminder.quarterlyReminders = [];
      reminder.halfYearlyReminders = [];
    }

    if (!this.reminder) {
      this.sub$.sink = this.reminderService
        .addDocumentReminder(reminder)
        .subscribe(
          () => {
            this.toastrService.success(
              this.translationService.getValue('REMINDER_CREATED_SUCCESSFULLY')
            );
            // this.route.navigate(['/reminders']);
            this.dialogRef.close();
          },
        );
    } else {
      if (reminder.dailyReminders) {
        reminder.dailyReminders = reminder.dailyReminders.map((c) => {
          c.reminderId = this.reminder.id;
          return c;
        });
      }
      if (reminder.quarterlyReminders) {
        reminder.quarterlyReminders = reminder.quarterlyReminders.map((c) => {
          c.reminderId = this.reminder.id;
          return c;
        });
      }
      if (reminder.halfYearlyReminders) {
        reminder.halfYearlyReminders = reminder.halfYearlyReminders.map((c) => {
          c.reminderId = this.reminder.id;
          return c;
        });
      }
      this.sub$.sink = this.reminderService.updateReminder(reminder).subscribe(
        () => {
          this.toastrService.success(
            this.translationService.getValue('REMINDER_UPDATED_SUCCESSFULLY')
          );
          // this.route.navigate(['/reminders']);
          this.dialogRef.close();
        },
      );
    }
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
          const selectedUsers = this.users.filter(
            (c) => reminderUsers.indexOf(c.id) >= 0
          );

          this.reminderForm.get('selectedUsers').setValue(selectedUsers);
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
      isActive: [true],
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
      day: [this.getCurrentDay()],
      month: [monthValues[0].id],
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
      day: [this.getCurrentDay()],
      month: [monthValues[0].id],
      name: [name],
      monthValues: [monthValues],
    });
  }

  getCurrentDay(): number {
    return new Date().getDate();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDateChange(formGrouup: any) {
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

  onCancel() {
    this.dialogRef.close();
  }
}
