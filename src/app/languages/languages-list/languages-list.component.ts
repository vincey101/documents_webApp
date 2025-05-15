import { Component, OnInit } from '@angular/core';
import { LanguagesService } from '../languages.service';
import { BaseComponent } from 'src/app/base.component';
import { environment } from '@environments/environment';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'app-languages-list',
  templateUrl: './languages-list.component.html',
  styleUrls: ['./languages-list.component.scss'],
})
export class LanguagesListComponent extends BaseComponent implements OnInit {
  languages: any[] = [];
  displayedColumns: string[] = ['action', 'imageUrl', 'name', 'code', 'order', 'isRTL'];
  constructor(
    private languagesService: LanguagesService,
    private commonDialogService: CommonDialogService,
    private toastrService: ToastrService,
    public translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.getLanguages();
  }

  getLanguages() {
    this.languagesService.getLanguages().subscribe(
      (lan) => {
        this.languages = lan;
        this.languages.forEach((lan) => {
          lan.imageUrl = `${environment.apiUrl}${lan.imageUrl}`;
        });
      },
    );
  }

  deleteLanguage(language) {
    this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE')
      )
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.sub$.sink = this.languagesService
            .deleteLanguages(language.id)
            .subscribe(() => {
              this.toastrService.success(
                this.translationService.getValue(
                  'LANGUAGE_DELETED_SUCCESSFULLY'
                )
              );
              this.getLanguages();
            });
        }
      });
  }
}
