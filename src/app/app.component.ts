import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  Event,
  Router,
  NavigationStart,
  NavigationEnd,
  ActivatedRoute,
} from '@angular/router';
import { CompanyProfile } from '@core/domain-classes/company-profile';
import { LanguageFlag } from '@core/domain-classes/language-flag';
import { SecurityService } from '@core/security/security.service';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  currentUrl!: string;
  languages: LanguageFlag[] = [];
  constructor(
    public _router: Router,
    public translate: TranslateService,
    private translationService: TranslationService,
    private route: ActivatedRoute,
    private securityService: SecurityService,
    private commonService: CommonService,
    private titleService: Title
  ) {
    this.setProfile();
    this.companyProfileSubscription();
    this.getAllAllowFileExtension();
    translate.addLangs(['en']);
    translate.setDefaultLang('en');

    this._router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationStart) {
        this.currentUrl = routerEvent.url.substring(
          routerEvent.url.lastIndexOf('/') + 1
        );
      }
      if (routerEvent instanceof NavigationEnd) {
        /* empty */
      }
      window.scrollTo(0, 0);
    });
  }

  setProfile() {
    this.route.data.subscribe((data: { profile: CompanyProfile }) => {
      if (data.profile) {
        this.securityService.updateProfile(data.profile);
        this.languages = data.profile.languages;
      }
      this.setLanguage();
    });
  }

  companyProfileSubscription() {
    this.securityService.companyProfile.subscribe((profile) => {
      if (profile) {
        this.titleService.setTitle(profile.title);
      }
    });
  }

  getAllAllowFileExtension() {
    this.commonService.getAllowFileExtensions().subscribe();
  }

  setLanguage() {
    const currentLang: string = this.translationService.getSelectedLanguage();
    if (currentLang) {
      const language = this.languages.find((lang) => lang.code === currentLang);
      this.translationService
        .setLanguage({
          code: currentLang,
          name: currentLang,
          imageUrl: '',
          isRTL: language
            ? language.isRTL
            : currentLang === 'ar'
            ? true
            : false,
        })
        .subscribe();
    } else {
      const browserLang = this.translate.getBrowserLang();
      const lang = browserLang.match(/en|es|ar|ru|cn|ja|ko|fr/)
        ? browserLang
        : 'en';
      this.translationService
        .setLanguage({
          code: lang,
          name: lang,
          imageUrl: '',
          isRTL: lang === 'ar' ? true : false,
        })
        .subscribe();
    }
  }
}
