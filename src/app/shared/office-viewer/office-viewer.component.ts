import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DocumentView } from '@core/domain-classes/document-view';
import { CommonService } from '@core/services/common.service';
import { environment } from '@environments/environment';
import { OverlayPanelRef } from '@shared/overlay-panel/overlay-panel-ref';
import { BaseComponent } from 'src/app/base.component';

@Component({
  selector: 'app-office-viewer',
  templateUrl: './office-viewer.component.html',
  styleUrls: ['./office-viewer.component.scss'],
})
export class OfficeViewerComponent
  extends BaseComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('iframe') iframe: ElementRef<HTMLIFrameElement>;
  isLive = true;
  token = '';
  @Input() document: DocumentView;

  constructor(
    private commonService: CommonService,
    private overlayRef: OverlayPanelRef
  ) {
    super();
  }

  ngOnInit(): void {
    if (environment.apiUrl.indexOf('localhost') >= 0) {
      this.isLive = false;
    }
  }

  ngAfterViewInit() {
    if (this.isLive) {
      this.getDocumentToken();
    }
  }

  getDocumentToken() {
    this.sub$.sink = this.commonService
      .getDocumentToken(this.document)
      .subscribe({
        next: (token) => {
          this.token = token['result'];
          const host = location.host;
          const protocal = location.protocol;
          const url =
            environment.apiUrl === '/'
              ? `${protocal}//${host}/`
              : environment.apiUrl;
          this.iframe.nativeElement.src =
            'https://view.officeapps.live.com/op/embed.aspx?src=' +
            encodeURIComponent(
              `${url}api/document/${this.document.documentId}/officeviewer?token=${this.token}&isVersion=${this.document.isVersion}
              &isPublic=${this.document.isFromPublicPreview}&password=${this.document.linkPassword}&isFileRequest=${this.document.isFromFileRequest}`
            );
        }
      });
  }

  onCancel() {
    this.overlayRef.close();
  }

  override ngOnDestroy() {
    if (this.isLive) {
      this.sub$.sink = this.commonService
        .deleteDocumentToken(this.token)
        .subscribe(() => {
          super.ngOnDestroy();
        });
    } else {
      super.ngOnDestroy();
    }
  }
}
