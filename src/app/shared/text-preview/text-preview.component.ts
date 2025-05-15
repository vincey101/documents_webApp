import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DocumentView } from '@core/domain-classes/document-view';
import { CommonService } from '@core/services/common.service';
import { OverlayPanelRef } from '@shared/overlay-panel/overlay-panel-ref';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';

@Component({
  selector: 'app-text-preview',
  templateUrl: './text-preview.component.html',
  styleUrls: ['./text-preview.component.scss'],
})
export class TextPreviewComponent extends BaseComponent implements OnChanges {
  textLines: string[] = [];
  @Input() document: DocumentView;
  constructor(
    private commonService: CommonService,
    private overlayRef: OverlayPanelRef,
    private toastrService: ToastrService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['document']) {
      this.readDocument();
    }
  }

  readDocument() {
    this.sub$.sink = this.commonService.readDocument(this.document).subscribe({
      next: (data: { [key: string]: string[] }) => {
        this.textLines = data['result'];
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
