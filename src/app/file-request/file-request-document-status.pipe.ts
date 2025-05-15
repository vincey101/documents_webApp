import { Pipe, PipeTransform } from '@angular/core';
import { FileRequestDocumentStatus } from '@core/domain-classes/file-request-document-status.enum';

@Pipe({
  name: 'fileRequestDocumentStatus',
  standalone: true
})

export class FileRequestDocumentStatusPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value === FileRequestDocumentStatus.PENDING) {
      return 'PENDING';
    }
    else if (value === FileRequestDocumentStatus.APPROVED) {
      return 'APPROVED';
    }
    else if (value === FileRequestDocumentStatus.REJECTED) {
      return 'REJECTED';
    }
  }
}
