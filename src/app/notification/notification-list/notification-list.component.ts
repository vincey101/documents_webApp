import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { ResponseHeader } from '@core/domain-classes/document-header';
import { DocumentResource } from '@core/domain-classes/document-resource';
import { UserNotification } from '@core/domain-classes/notification';
import { OverlayPanel } from '@shared/overlay-panel/overlay-panel.service';
import { fromEvent, merge, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BaseComponent } from 'src/app/base.component';
import { NotificationDataSource } from '../notification-datassource';
import { NotificationService } from '../notification.service';
import { BasePreviewComponent } from '@shared/base-preview/base-preview.component';
import { DocumentView } from '@core/domain-classes/document-view';
import { DocumentService } from 'src/app/document/document.service';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css'],
})
export class NotificationListComponent
  extends BaseComponent
  implements OnInit, AfterViewInit {
  dataSource: NotificationDataSource;
  notifications: UserNotification[] = [];
  displayedColumns: string[] = ['action', 'createdDate', 'message'];
  notificationResource: DocumentResource;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: ElementRef;

  constructor(
    private notificationService: NotificationService,
    public overlay: OverlayPanel,
    private documentService: DocumentService,
    private toastrService: ToastrService
  ) {
    super();
    this.notificationResource = new DocumentResource();
    this.notificationResource.pageSize = 10;
    this.notificationResource.orderBy = 'createdDate desc';
  }

  ngOnInit(): void {
    this.dataSource = new NotificationDataSource(this.notificationService);
    this.dataSource.loadNotifications(this.notificationResource);
    this.getResourceParameter();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    this.sub$.sink = merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.notificationResource.skip =
            this.paginator.pageIndex * this.paginator.pageSize;
          this.notificationResource.pageSize = this.paginator.pageSize;
          this.notificationResource.orderBy =
            this.sort.active + ' ' + this.sort.direction;
          this.dataSource.loadNotifications(this.notificationResource);
        })
      )
      .subscribe();

    this.sub$.sink = fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.notificationResource.skip = 0;
          this.notificationResource.name = this.input.nativeElement.value;
          this.dataSource.loadNotifications(this.notificationResource);
        })
      )
      .subscribe();
  }
  getResourceParameter() {
    this.sub$.sink = this.dataSource.responseHeaderSubject$.subscribe(
      (c: ResponseHeader) => {
        if (c) {
          this.notificationResource.pageSize = c.pageSize;
          this.notificationResource.skip = c.skip;
          this.notificationResource.totalCount = c.totalCount;
        }
      }
    );
  }

  viewDocument(notification: UserNotification) {
    if (!notification.isRead) {
      this.sub$.sink = this.notificationService
        .markAsRead(notification.id)
        .subscribe();
    }
    this.sub$.sink = this.documentService
      .getDocument(notification.documentId)
      .subscribe((data: DocumentInfo) => {
        if (!data || Object.keys(data).length == 0) {
          this.toastrService.error(
            `you don't have permission to access this document.`
          );
          return;
        }
        const urls = data.url.split('.');
        const extension = urls[1];
        const documentView: DocumentView = {
          documentId: data.id,
          name: data.name,
          extension: extension,
          isVersion: false,
          isFromPublicPreview: false,
          isPreviewDownloadEnabled: false,
          isFromFileRequest: false,
        };
        this.overlay.open(BasePreviewComponent, {
          position: 'center',
          origin: 'global',
          panelClass: ['file-preview-overlay-container', 'white-background'],
          data: documentView,
        });
      });
  }
}
