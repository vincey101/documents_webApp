import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpXsrfInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Skip XSRF for Gemini API calls
    if (req.url.includes('generativelanguage.googleapis.com')) {
      console.log('Skipping XSRF for Gemini API call:', req.url);
      return next.handle(req);
    }

    // For all other requests, let them proceed as normal
    return next.handle(req);
  }
} 