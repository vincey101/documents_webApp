import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Resolve,
} from '@angular/router';
import { CompanyProfile } from '@core/domain-classes/company-profile';
import { Observable, of } from 'rxjs';
import { take, mergeMap } from 'rxjs/operators';
import { CompanyProfileService } from './company-profile.service';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyProfileResolver implements Resolve<CompanyProfile> {
  constructor(
    private companyProfileService: CompanyProfileService,
    private router: Router
  ) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CompanyProfile> | null {
    return this.companyProfileService.getCompanyProfile().pipe(
      take(1),
      mergeMap((companyProfile: CompanyProfile) => {
        if (companyProfile) {
          if (companyProfile.languages) {
            companyProfile.languages.forEach((lan) => {
              lan.imageUrl = `${environment.apiUrl}${lan.imageUrl}`;
            });
          }
          return of(companyProfile);
        } else {
          this.router.navigate(['/dashboard']);
          return null;
        }
      })
    );
  }
}
