import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Resolve,
} from '@angular/router';
import { S3Config } from '@core/domain-classes/company-profile';
import { Observable, of } from 'rxjs';
import { take, mergeMap } from 'rxjs/operators';
import { CompanyProfileService } from './company-profile.service';

@Injectable({
  providedIn: 'root',
})
export class S3Resolver implements Resolve<S3Config> {
  constructor(
    private companyProfileService: CompanyProfileService,
    private router: Router
  ) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<S3Config> | null {
    return this.companyProfileService.getS3Config().pipe(
      take(1),
      mergeMap((s3Profile: S3Config) => {
        if (s3Profile) {
          return of(s3Profile);
        } else {
          this.router.navigate(['/dashboard']);
          return null;
        }
      })
    );
  }
}
