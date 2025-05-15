import { HttpEvent, HttpEventType } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DocumentView } from '@core/domain-classes/document-view';
import { CommonService } from '@core/services/common.service';
import { OverlayPanelRef } from '@shared/overlay-panel/overlay-panel-ref';
import { ToastrService } from 'ngx-toastr';
import { delay } from 'rxjs/operators';
import { BaseComponent } from 'src/app/base.component';

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.scss'],
})
export class ImagePreviewComponent extends BaseComponent implements OnChanges {
  imageUrl: SafeUrl;
  @Input() document: DocumentView;
  constructor(
    private overlayRef: OverlayPanelRef,
    private sanitizer: DomSanitizer,
    private ref: ChangeDetectorRef,
    private commonService: CommonService,
    private toastrService: ToastrService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['document']) {
      this.getImage();
    }
  }

  getImage() {
    this.sub$.sink = this.commonService
      .downloadDocument(this.document)
      .pipe(delay(500))
      .subscribe({
        next: (data: HttpEvent<Blob>) => {
          if (data.type === HttpEventType.Response) {
            const imgageFile = new Blob([data.body], { type: data.body.type });
            this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(
              URL.createObjectURL(imgageFile)
            );
            this.ref.markForCheck();
          }
        },
        error: (err) => {
          this.toastrService.error(err.error.message);
          this.onCancel();
        },
      });
  }

  onCancel() {
    this.overlayRef.close();
  }
}
