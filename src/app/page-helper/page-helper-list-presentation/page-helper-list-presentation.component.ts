import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { PageHelper } from '@core/domain-classes/page-helper';
import { TranslationService } from '@core/services/translation.service';
import { BaseComponent } from 'src/app/base.component';
import { Router } from '@angular/router';
import { PageHelpPreviewComponent } from '@shared/page-help-preview/page-help-preview.component';
import { CommonService } from '@core/services/common.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-page-helper-list-presentation',
  templateUrl: './page-helper-list-presentation.component.html',
  styleUrls: ['./page-helper-list-presentation.component.css'],
})
export class PageHelperListPresentationComponent
  extends BaseComponent
  implements OnInit {
  @Input() pageHelpers: PageHelper[];
  columnsToDisplay: string[] = ['action', 'name', 'code'];

  constructor(
    private router: Router,
    private commonService: CommonService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void { }

  viewPageHelper(pageHelper: PageHelper): void {
    this.commonService
      .getPageHelperText(pageHelper.code)
      .subscribe((help: PageHelper) => {
        this.dialog.open(PageHelpPreviewComponent, {
          width: '80vw',
          maxHeight: '80vh',
          data: Object.assign({}, help),
        });
      });
  }

  managePageHelper(pageHelper: PageHelper) {
    this.router.navigate(['/page-helper/manage', pageHelper.id]);
  }
}
