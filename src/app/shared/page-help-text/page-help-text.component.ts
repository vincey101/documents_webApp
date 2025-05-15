import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageHelper } from '@core/domain-classes/page-helper';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { PageHelpPreviewComponent } from '@shared/page-help-preview/page-help-preview.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-page-help-text',
  templateUrl: './page-help-text.component.html',
  styleUrls: ['./page-help-text.component.css'],
})
export class PageHelpTextComponent implements OnInit {
  constructor(
    private commonService: CommonService,
    private dialog: MatDialog,
    private toastrService: ToastrService,
    private translationService: TranslationService
  ) {}
  pageHelpText: PageHelper;
  @Input() code = '';
  ngOnInit(): void {}

  viewPageHelp() {
    // const pageHelpText=;
    this.commonService
      .getPageHelperText(this.code)
      .subscribe((help: PageHelper) => {
        if (help) {
          this.dialog.open(PageHelpPreviewComponent, {
            width: '80vw',
            maxHeight: '80vh',
            data: Object.assign({}, help),
          });
        } else {
          this.toastrService.error(
            this.translationService.getValue('NO_HELP_TEXT_FOUND')
          );
        }
      });
  }
}
