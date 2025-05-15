import { Pipe, PipeTransform } from '@angular/core';
import { FileRequestStatus } from '@core/domain-classes/file-request.enum';

@Pipe({
  name: 'fileRequestStatus',
  standalone: true
})

export class FileRequestStatusPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value === FileRequestStatus.CREATED) {
      return 'CREATED';
    }
    else if (value === FileRequestStatus.APPROVED) {
      return 'APPROVED';
    }
    else if (value === FileRequestStatus.REJECTED) {
      return 'REJECTED';
    }
    else if (value === FileRequestStatus.UPLOADED) {
      return 'UPLOADED';
    }
  }
}
