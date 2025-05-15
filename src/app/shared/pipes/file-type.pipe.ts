import { Pipe, PipeTransform } from '@angular/core';
import { FileType } from '../../core/domain-classes/file-type.enum';

@Pipe({
  name: 'fileType',
  standalone: true
})

export class FileTypePipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value === FileType.Office) {
      return 'Office';
    }
    else if (value === FileType.Pdf) {
      return 'Pdf';
    }
    else if (value === FileType.Image) {
      return 'Image';
    }
    else if (value === FileType.Text) {
      return 'Text';
    }
    else if (value === FileType.Audio) {
      return 'Audio';
    }
    else if (value === FileType.Video) {
      return 'Video';
    }
    else if (value === FileType.Other) {
      return 'Other';
    }
  }
}
