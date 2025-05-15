import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from './truncate.pipe';
import { ReminderFrequencyPipe } from './reminder-frequency.pipe';
import { UTCToLocalTime } from './utc-to-localtime.pipe';

@NgModule({
  declarations: [TruncatePipe, ReminderFrequencyPipe,UTCToLocalTime],
  imports: [CommonModule],
  exports: [TruncatePipe, ReminderFrequencyPipe,UTCToLocalTime],
})
export class PipesModule {}
