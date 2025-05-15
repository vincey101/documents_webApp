import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Page } from '@core/domain-classes/page';
import { BaseComponent } from 'src/app/base.component';
import { PageService } from '@core/services/page.service';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'app-page-list',
  templateUrl: './page-list.component.html',
  styleUrls: ['./page-list.component.css']
})
export class PageListComponent extends BaseComponent implements OnInit {
  pages$: Observable<Page[]>;
  displayedColumns: string[] = ['action', 'name'];

  constructor(
    private pageService: PageService,
    private toastrServoce: ToastrService,
    public translationService: TranslationService) {
    super();

  }

  ngOnInit(): void {
    this.pageService.loaded$
      .pipe(
        tap(loaded => {
          if (!loaded) {
            this.getPages();
          }
        })
      );

    this.pages$ = this.pageService.entities$;

  }

  deletePage(pageId: string) {
    this.sub$.sink = this.pageService.delete(pageId).subscribe(() => {
      this.toastrServoce.success(this.translationService.getValue('PAGE_DELETED_SUCCESSFULLY'));
    })
  }

  getPages(): void {
    this.pageService.getAll()
  }
}
