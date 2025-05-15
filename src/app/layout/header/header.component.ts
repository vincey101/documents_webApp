import { DOCUMENT } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { WINDOW } from '@core/services/window.service';
import { SecurityService } from '@core/security/security.service';
import { LanguageFlag } from '@core/domain-classes/language-flag';
import { TranslationService } from '@core/services/translation.service';
import { UserAuth } from '@core/domain-classes/user-auth';
import { NotificationService } from 'src/app/notification/notification.service';
import { UserNotification } from '@core/domain-classes/notification';
import { Direction } from '@angular/cdk/bidi';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isNavbarCollapsed = true;
  isNavbarShow = true;
  countryName: string | string[] = [];
  defaultFlag?: string;
  isOpenSidebar = false;
  docElement: HTMLElement | undefined;
  isFullScreen = false;
  appUserAuth: UserAuth = null;
  language: LanguageFlag;
  newNotificationCount = 0;
  notifications: UserNotification[] = [];
  refereshReminderTimeInMinute = 10;
  logoImage = '';
  smallLogoImage = '';
  isUnReadNotification = false;
  languages: LanguageFlag[] = [];
  direction: Direction;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(WINDOW) private window: Window,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private router: Router,
    public languageService: LanguageService,
    private securityService: SecurityService,
    private translationService: TranslationService,
    private cd: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.window.pageYOffset ||
      this.document.documentElement.scrollTop ||
      this.document.body.scrollTop ||
      0;
    // if (offset > 50) {
    //   this.isNavbarShow = true;
    // } else {
    //   this.isNavbarShow = false;
    // }
  }
  ngOnInit() {
    this.setTopLogAndName();
    this.getNotification();
    this.setDefaultLanguage();
    this.companyProfileSubscription();
    this.getLangDir();
    this.sidebarMenuStatus();
  }
 
  getLangDir() {
    this.translationService.lanDir$.subscribe((c: Direction) => {
      this.direction = c;
    });
  }
  sidebarMenuStatus() {
    this.notificationService.sideMenuStatus$.subscribe((status) => {
      this.isOpenSidebar = status;
    });
  }
  companyProfileSubscription() {
    this.securityService.companyProfile.subscribe((profile) => {
      if (profile) {
        this.logoImage = profile.logoUrl;
        this.smallLogoImage = profile.smallLogoUrl;
        this.languages = profile.languages;
        this.setDefaultLanguage();
      }
    });
  }

  setDefaultLanguage() {
    const lang = this.translationService.getSelectedLanguage();
    if (lang) {
      this.setLanguageWithRefresh(lang);
    }
  }

  setLanguageWithRefresh(lang: string) {
    const selecedLanguage = this.languages.find((c) => c.code == lang);
    this.languages.forEach((language: LanguageFlag) => {
      if (language.code === lang) {
        language.active = true;
      } else {
        language.active = false;
      }
    });
    this.translationService.setLanguage(selecedLanguage);
    this.defaultFlag = this.languages.find((c) => c.code == lang)?.imageUrl;
  }

  setNewLanguageRefresh(lang: LanguageFlag) {
    this.translationService.setLanguage(lang).subscribe((response) => {
      this.setLanguageWithRefresh(response['LANGUAGE']);
      window.location.reload();
    });
  }

  setTopLogAndName() {
    this.securityService.SecurityObject.subscribe((c) => {
      if (c) {
        this.appUserAuth = c;
      }
    });
  }

  getNotification() {
    if (!this.securityService.isUserAuthenticate()) {
      return;
    }

    this.notificationService
      .getNotification()
      .subscribe((notifications: UserNotification[]) => {
        this.newNotificationCount = notifications.filter(
          (c) => !c.isRead
        ).length;
        this.notifications = notifications;
        this.isUnReadNotification = this.notifications.some((n) => !n.isRead);
        this.cd.detectChanges();

        setTimeout(() => {
          this.getNotification();
        }, this.refereshReminderTimeInMinute * 60 * 1000);
      });
  }

  markAllAsReadNotification() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.getNotification();
    });
  }

  mobileMenuSidebarOpen(event: Event, className: string) {
    const hasClass = (event.target as HTMLInputElement).classList.contains(
      className
    );
    if (hasClass) {
      this.renderer.removeClass(this.document.body, className);
    } else {
      this.renderer.addClass(this.document.body, className);
    }
  }

  callSidemenuCollapse() {
    const hasClass = this.document.body.classList.contains('side-closed');
    if (hasClass) {
      this.notificationService.setSideMenuStatus(false);
      this.renderer.removeClass(this.document.body, 'side-closed');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
      localStorage.setItem('collapsed_menu', 'false');
    } else {
      this.renderer.addClass(this.document.body, 'side-closed');
      this.renderer.addClass(this.document.body, 'submenu-closed');
      localStorage.setItem('collapsed_menu', 'true');
      this.notificationService.setSideMenuStatus(true);
    }
  }

  viewNotification(notification: UserNotification) {
    if (!notification.isRead) {
      this.markAsReadNotification(notification.id);
    }

    if (notification.documentId) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['reminders']);
    }
  }

  markAsReadNotification(id) {
    this.notificationService.markAsRead(id).subscribe(() => {
      this.getNotification();
    });
  }

  onProfileClick() {
    this.router.navigate(['my-profile']);
  }

  logout() {
    this.securityService.logout();
  }
}
