import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Resolve,
} from '@angular/router';
import { OpenAiApi, S3Config } from '@core/domain-classes/company-profile';
import { Observable, of } from 'rxjs';
import { take, mergeMap } from 'rxjs/operators';
import { CompanyProfileService } from './company-profile.service';

@Injectable({
  providedIn: 'root',
})
export class OpenAiKeyResolver implements Resolve<OpenAiApi> {
  constructor(
    private companyProfileService: CompanyProfileService,
    private router: Router
  ) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<OpenAiApi> | null {
    return this.companyProfileService.getOpenAiApiKey().pipe(
      take(1),
      mergeMap((openAiApiKey: OpenAiApi) => {
        if (openAiApiKey) {
          return of(openAiApiKey);
        } else {
          this.router.navigate(['/dashboard']);
          return null;
        }
      })
    );
  }
}
