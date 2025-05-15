import { Directive, Input, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { FileSizes } from '../core/domain-classes/file-sizes.enum';

@Directive({
  selector: '[appFileSizeLabel]',
  standalone: true,
})
export class FileSizeLabelDirective implements OnChanges {
  @Input() appFileSizeLabel: number; // Accepts the FileSizes enum value

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appFileSizeLabel'] && this.appFileSizeLabel !== undefined) {
      this.el.nativeElement.textContent = this.getFileSizeLabel(this.appFileSizeLabel);
    }
  }

  private getFileSizeLabel(value: number): string {
    switch (value) {
      case FileSizes.LessThan1MB:
        return 'Less than 1 MB';
      case FileSizes.LessThan2MB:
        return 'Less than 2 MB';
      case FileSizes.LessThan5MB:
        return 'Less than 5 MB';
      case FileSizes.LessThan10MB:
        return 'Less than 10 MB';
      case FileSizes.LessThan25MB:
        return 'Less than 25 MB';
      case FileSizes.LessThan50MB:
        return 'Less than 50 MB';
      case FileSizes.LessThan100MB:
        return 'Less than 100 MB';
      case FileSizes.GreaterThan100MB:
        return 'Greater than 100 MB';
      default:
        return 'Unknown';
    }
  }
}