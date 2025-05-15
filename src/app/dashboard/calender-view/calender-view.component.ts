import { Component, OnInit } from '@angular/core';
import { CalenderReminderDto } from '@core/domain-classes/calender-reminder';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { isSameDay, isSameMonth, parseISO } from 'date-fns';
import { DashboradService } from '../dashboard.service';
import { MatDialog } from '@angular/material/dialog';
import { ReminderDetailComponent } from '@shared/reminder-detail/reminder-detail.component';

@Component({
  selector: 'app-calender-view',
  templateUrl: './calender-view.component.html',
  styleUrls: ['./calender-view.component.css'],
})
export class CalenderViewComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  activeDayIsOpen = false;
  CalendarView = CalendarView;
  events: CalendarEvent[] = [];
  isProcessing = false;
  constructor(
    private dashboardService: DashboradService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const currentDate = new Date();
    this.gerReminders(currentDate.getMonth() + 1, currentDate.getFullYear());
  }

  viewDateChange(event: Date) {
    this.activeDayIsOpen = false;
    this.gerReminders(event.getMonth() + 1, event.getFullYear());
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.dialog.open(ReminderDetailComponent, {
      data: event.id,
      width: '80vw',
    });
  }

  gerReminders(month: number, year: number) {
    this.isProcessing = true;
    this.events = [];
    this.dashboardService.getReminders(month, year).subscribe(
      (results: CalenderReminderDto[]) => {
        this.isProcessing = false;
        this.addEvent(results);
      },
      () => (this.isProcessing = false)
    );
  }

  addEvent(calenterReminder: CalenderReminderDto[]) {
    const event = calenterReminder.map((c) => {
      c.start = parseISO(c.start.toString());
      c.end = parseISO(c.end.toString());
      return c;
    });
    this.events = this.events.concat(event);
  }
}
