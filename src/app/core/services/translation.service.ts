// Localization is based on '@ngx-translate/core';
// Please be familiar with official documentations first => https://github.com/ngx-translate/core

import { Direction } from '@angular/cdk/bidi';
import { Injectable } from '@angular/core';
import { LanguageFlag } from '@core/domain-classes/language-flag';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Locale {
  lang: string;
  data: any;
}

const LOCALIZATION_LOCAL_STORAGE_KEY = 'language';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  // Private properties
  private langIds = [];
  private _lanDir: BehaviorSubject<Direction> = new BehaviorSubject<Direction>(
    'ltr'
  );

  constructor(private translate: TranslateService) {}

  loadTranslations(...args: Locale[]): void {
    const locales = [...args];
    locales.forEach((locale) => {
      // use setTranslation() with the third argument set to true
      // to append translations instead of replacing them
      this.translate.setTranslation(locale.lang, locale.data, true);
      this.langIds.push(locale.lang);
    });

    // add new languages to the list
    this.translate.addLangs(this.langIds);
  }

  setLanguage(lang: LanguageFlag) {
    try {
      if (lang) {
        localStorage.setItem(LOCALIZATION_LOCAL_STORAGE_KEY, lang.code);
        if (lang.isRTL) {
          this._lanDir.next('rtl');
        } else {
          this._lanDir.next('ltr');
        }
        return this.translate.use(lang.code);
      }
    } catch {
      return of(null);
    }
    return of(null);
  }

  public get lanDir$(): Observable<Direction> {
    return this._lanDir.asObservable();
  }

  removeLanguage() {
    try {
      localStorage.removeItem(LOCALIZATION_LOCAL_STORAGE_KEY);
    } catch {
      /* empty */
    }
  }

  /**
   * Returns selected language
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSelectedLanguage(): any {
    try {
      if (localStorage) {
        return (
          localStorage.getItem(LOCALIZATION_LOCAL_STORAGE_KEY) ||
          this.translate.getDefaultLang()
        );
      }
    } catch {
      return null;
    }
  }

  getValue(key: string) {
    return this.translate.instant(key);
  }
}
