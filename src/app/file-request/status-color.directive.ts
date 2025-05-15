import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appStatusColor]',
  standalone: true,
})
export class StatusColorDirective implements OnChanges {
  @Input('appStatusColor') status!: string;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(): void {
    this.setStatusColor(this.status);
  }

  private setStatusColor(status: string): void {
    let color = '';
    switch (status) {
      case 'CREATED':
        color = 'Orange'; // Orange for 'Created'
        break;
      case 'UPLOADED':
        color = 'Green'; // Green for 'Uploaded'
        break;
      case 'PENDING':
        color = 'Orange'; // Yellow for 'Pending'
        break;
      case 'APPROVED':
        color = 'Green'; // Green for 'Approved'
        break;
      case 'REJECTED':
        color = 'Red'; // Red for 'Rejected'
        break;
      default:
        color = 'black'; // Default black color
        break;
    }
    this.renderer.setStyle(this.el.nativeElement, 'color', color);
    this.renderer.setStyle(this.el.nativeElement, 'font-weight', 'bold');
  }
}
