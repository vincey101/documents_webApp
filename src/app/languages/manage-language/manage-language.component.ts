import { Component, OnInit } from '@angular/core';
import { LanguagesService } from '../languages.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'app-manage-language',
  templateUrl: './manage-language.component.html',
  styleUrls: ['./manage-language.component.scss'],
})
export class ManageLanguageComponent implements OnInit {
  selectedLanguage: any;
  defaultLanguage: any;
  fields: any[] = [];
  languageForm: FormGroup;
  languageImgSrc: any = null;
  isLanguageImageUpload = false;
  constructor(
    private languagesService: LanguagesService,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private translationService: TranslationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getLanguageFromRoute();
  }

  getLanguageFromRoute() {
    this.route.data.subscribe((data: { language: any }) => {
      if (data.language) {
        if (data.language.imageUrl) {
          this.languageImgSrc = `${environment.apiUrl}${data.language.imageUrl}`;
        }
        this.selectedLanguage = data.language;
      }
      this.getDefaultLanguage();
    });
  }

  getDefaultLanguage() {
    this.languagesService.getDefaultLanguage().subscribe(
      (data) => {
        this.defaultLanguage = data;
        const formGroupFields = {};
        formGroupFields['languageName'] = new FormControl(
          this.selectedLanguage?.name,
          [Validators.required]
        );
        formGroupFields['order'] = new FormControl(
          this.selectedLanguage?.order,
          [Validators.required]
        );
        formGroupFields['isRTL'] = new FormControl(
          this.selectedLanguage?.isRTL ?? false
        );
        formGroupFields['id'] = new FormControl(
          this.selectedLanguage?.id ?? ''
        );

        Object.keys(data).forEach((field) => {
          formGroupFields[field] = new FormControl('', [Validators.required]);
          this.fields.push(field);
        });
        this.languageForm = new FormGroup(formGroupFields);
        if (this.selectedLanguage) {
          this.languageForm.patchValue(JSON.parse(this.selectedLanguage.codes));
        } else {
          this.languageForm.patchValue(this.defaultLanguage);
        }
      }
    );
  }

  onProductImageSelect($event) {
    const fileSelected = $event.target.files[0];
    if (!fileSelected) {
      return;
    }
    const mimeType = fileSelected.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(fileSelected);
    // tslint:disable-next-line: variable-name
    reader.onload = (_event) => {
      this.languageImgSrc = reader.result;
      this.isLanguageImageUpload = true;
      $event.target.value = '';
    };
  }

  onLanguageSubmit() {
    if (this.languageForm.invalid) {
      this.toastrService.error(
        this.translationService.getValue('PLEASE_ENTER_PROPER_DATA')
      );
      this.languageForm.markAllAsTouched();
      return;
    }

    if (!this.selectedLanguage && !this.isLanguageImageUpload) {
      this.toastrService.error(this.translationService.getValue('ADD_IMAGE'));
      return;
    }

    let language = {};
    language['name'] = this.languageForm.get('languageName').value;
    language['id'] = this.languageForm.get('id').value;
    language['order'] = this.languageForm.get('order').value;
    language['code'] = this.languageForm.get('LANGUAGE').value;
    language['isRTL'] = this.languageForm.get('isRTL').value ?? false;
    language['isLanguageImageUpload'] = this.isLanguageImageUpload;
    if (this.isLanguageImageUpload) {
      language['languageImgSrc'] = this.languageImgSrc;
    }
    let codes = {};
    Object.keys(this.defaultLanguage).forEach((field) => {
      try {
        codes[field] = this.languageForm.get(field).value;
      } catch (error) {
      }
    });
    language['codes'] = codes;
    this.languagesService.saveLanguages(language).subscribe(
      (data) => {
        this.toastrService.success(
          this.translationService.getValue('LANGUAGE_SAVED_SUCCESSFULLY')
        );
        try {
          window.location.reload();
        } catch (error) { }
        this.router.navigate(['/languages']);
      },
    );
  }
}
