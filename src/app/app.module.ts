import { NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { LayoutComponent } from './layout/app-layout/main-layout/main-layout.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { HttpInterceptorModule } from '@core/interceptor/http-interceptor.module';
import { PendingInterceptorModule } from '@shared/loading-indicator/pending-interceptor.module';
import { WINDOW_PROVIDERS } from '@core/services/window.service';
import { ToastrModule } from 'ngx-toastr';
import { AppStoreModule } from './store/app-store.module';
import { LoadingIndicatorModule } from '@shared/loading-indicator/loading-indicator.module';
import { APP_BASE_HREF } from '@angular/common';
import { environment } from '@environments/environment';
import { MatDialogConfigurationModule } from './mat-dialog-config.module';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, `${environment.apiUrl}api/i18n/`);
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    LayoutComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgScrollbarModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    CoreModule,
    LoadingIndicatorModule,
    SharedModule,
    ToastrModule.forRoot(),
    HttpInterceptorModule,
    AppStoreModule,
    PendingInterceptorModule,
    MatDialogConfigurationModule,
  ],
  providers: [
    WINDOW_PROVIDERS,
    { provide: APP_BASE_HREF, useValue: '/' },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
