import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReminderListComponent } from './reminder-list/reminder-list.component';
import { ReminderRoutingModule } from './reminder-routing.module';
import { AddReminderComponent } from './add-reminder/add-reminder.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ReminderDetailResolverService } from './add-reminder/reminder-detail.resolver';
import { PipesModule } from '@shared/pipes/pipes.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
} from 'ng-pick-datetime-ex';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [AddReminderComponent, ReminderListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReminderRoutingModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSlideToggleModule,
    SharedModule,
    MatMenuModule,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatTableModule,
    MatButtonToggleModule,
    MatRadioModule,
    MatIconModule,
    PipesModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgSelectModule,
  ],
  providers: [ReminderDetailResolverService],
})
export class ReminderModule {}
