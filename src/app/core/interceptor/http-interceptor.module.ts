import { Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { environment } from '@environments/environment';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SecurityService } from '@core/security/security.service';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  /**
   *
   */
  constructor(
    private router: Router,
    private toastrService: ToastrService,
    private securityService: SecurityService
  ) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Skip URL modification for external API calls
    if (req.url.includes('generativelanguage.googleapis.com')) {
      console.log('Bypassing interceptor for Gemini API call:', req.url);
      return next.handle(req);
    }

    const token = localStorage.getItem('bearerToken');
    const baseUrl = environment.apiUrl;
    if (req.url.lastIndexOf('i18n') > -1) {
      return next.handle(req);
    }
    let url = req.url.lastIndexOf('api') > -1 ? req.url : 'api/' + req.url;
    const lastChar = url.substring(url.length - 1);
    if (lastChar == '/') {
      url = url.substring(0, url.length - 1);
    }
    if (token) {
      const newReq = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + token),
        url: `${baseUrl}${url}`,
      });
      return next.handle(newReq).pipe(
        tap(
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          () => {},
          (err: any) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 401) {
                this.securityService.logout();
                this.router.navigate(['login']);
              } else if (err.status === 403) {
                this.toastrService.error(
                  `you don't have permission to perform this access.`
                );
              } else if (
                err.error &&
                Array.isArray(err.error) &&
                err.error.length >= 0
              ) {
                this.toastrService.error(err.error[0]);
              } else if (err.error && Object.entries(err.error)?.length > 0) {
                const errors = [];
                for (const [key, value] of Object.entries(err.error)) {
                  if (value) {
                    errors.push(value);
                  }
                }
                this.toastrService.error(errors.join('\n'));
              } else if (err.message) {
                this.toastrService.error(err.message);
              }
            }
          }
        )
      );
    } else {
      const newReq = req.clone({
        url: `${baseUrl}${url}`,
      });
      return next.handle(newReq).pipe(
        tap(
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          () => {},
          (err: any) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 401) {
                this.securityService.logout();
                this.router.navigate(['login']);
              } else if (err.status === 403) {
                this.toastrService.error(
                  `you don't have permission to perform this access.`
                );
              } else if (err.status === 409) {
                if (
                  err?.error?.messages?.isArray() &&
                  err.error.messages.length > 0
                ) {
                  this.toastrService.error(err.error.messages[0]);
                } else {
                  this.toastrService.error(err.error.message);
                }
              }
            }
          }
        )
      );
    }
  }
}

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true,
    },
  ],
})
export class HttpInterceptorModule {}
