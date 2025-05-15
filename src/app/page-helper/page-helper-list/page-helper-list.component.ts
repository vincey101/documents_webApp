import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/base.component';
import { PageHelperService } from '../page-helper.service';
import { PageHelper } from '@core/domain-classes/page-helper';

@Component({
  selector: 'app-page-helper-list',
  templateUrl: './page-helper-list.component.html',
  styleUrls: ['./page-helper-list.component.css'],
})
export class PageHelperListComponent extends BaseComponent implements OnInit {
  pageHelpers: PageHelper[];

  constructor(private pageHelperService: PageHelperService) {
    super();
  }
  ngOnInit(): void {
    this.getPageHelpers();
  }

  getPageHelpers(): void {
    this.pageHelperService
      .getPageHelpers()
      .subscribe((pageHelpers: PageHelper[]) => {
        this.pageHelpers = pageHelpers;
      });
  }
}
