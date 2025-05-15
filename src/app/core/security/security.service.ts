import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, delay } from 'rxjs/operators';
import { UserAuth } from '../domain-classes/user-auth';
import { CommonHttpErrorService } from '../error-handler/common-http-error.service';
import { CommonError } from '../error-handler/common-error';
import { Router } from '@angular/router';
import { ClonerService } from '@core/services/clone.service';

@Injectable({ providedIn: 'root' })
export class SecurityService {
  securityObject: UserAuth = new UserAuth();
  tokenTime: Date;
  clearTimeOutData: any;
  private securityObject$: BehaviorSubject<UserAuth> =
    new BehaviorSubject<UserAuth>(null);
  private _companyProfile$: BehaviorSubject<CompanyProfile> =
    new BehaviorSubject<CompanyProfile>(null);
  public get SecurityObject(): Observable<UserAuth> {
    return this.securityObject$.asObservable();
  }
  public get companyProfile(): Observable<CompanyProfile> {
    return this._companyProfile$;
  }
  private isRefreshingToken = false;

  constructor(
    private http: HttpClient,
    private clonerService: ClonerService,
    private commonHttpErrorService: CommonHttpErrorService,
    private router: Router
  ) { }

  isUserAuthenticate(): boolean {
    if (
      this.securityObject?.user?.userName &&
      this.securityObject?.authorisation?.token
    ) {
      setTimeout(() => {
        this.refreshToken();
      }, 1000);

      return true;
    } else {
      return this.parseSecurityObj();
    }
  }

  login(entity: any): Observable<UserAuth | CommonError> {
    // Initialize security object
    // this.resetSecurityObject();
    return this.http
      .post<UserAuth>('auth/login', entity)
      .pipe(
        tap((resp) => {
          this.tokenTime = new Date();

          this.securityObject = this.clonerService.deepClone<UserAuth>(resp);
          this.securityObject.tokenTime = new Date();
          localStorage.setItem('authObj', JSON.stringify(this.securityObject));
          localStorage.setItem(
            'bearerToken',
            this.securityObject.authorisation.token
          );
          this.securityObject$.next(resp);
          this.refreshToken();
        })
      )
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  refreshToken() {
    const currentDate: Date = new Date();
    currentDate.setMinutes(
      currentDate.getMinutes() - environment.tokenExpiredTimeInMin
    );
    let diffTime;
    if (!this.clearTimeOutData) {
      clearTimeout(this.clearTimeOutData);
    }
    if (!this.tokenTime) {
      diffTime = 1000;
      this.tokenTime = new Date();
    } else {
      diffTime = Math.abs(this.tokenTime.getTime() - currentDate.getTime());
    }

    this.clearTimeOutData = setTimeout(() => {
      clearTimeout(this.clearTimeOutData);
      this.refresh()
        .pipe(delay(1000))
        .subscribe((userAuth: UserAuth | null) => {
          if (!userAuth) {
            return;
          }
          this.tokenTime = new Date();
          this.securityObject =
            this.clonerService.deepClone<UserAuth>(userAuth);
          this.securityObject.tokenTime = new Date();
          localStorage.setItem('authObj', JSON.stringify(this.securityObject));
          localStorage.setItem(
            'bearerToken',
            this.securityObject.authorisation.token
          );
          this.securityObject$.next(userAuth);
          this.refreshToken();
        });
    }, diffTime);
  }

  refresh(): Observable<UserAuth | CommonError | null> {
    if (this.isRefreshingToken) {
      return null;
    }
    this.isRefreshingToken = true;
    return this.http
      .post<UserAuth>('auth/refresh', {})
      .pipe(
        tap((resp) => {
          this.securityObject = this.clonerService.deepClone<UserAuth>(resp);
          this.securityObject.tokenTime = new Date();
          localStorage.setItem('authObj', JSON.stringify(this.securityObject));
          localStorage.setItem(
            'bearerToken',
            this.securityObject.authorisation.token
          );
          this.securityObject$.next(resp);
          this.isRefreshingToken = false;
        }, () => { }, () => {
          this.isRefreshingToken = false;
        })
      )
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  private parseSecurityObj(): boolean {
    const securityObjectString = localStorage.getItem('authObj');
    if (!securityObjectString) {
      return false;
    }
    const secuObj = JSON.parse(securityObjectString);
    this.tokenTime = new Date(secuObj.tokenTime);
    this.securityObject = this.clonerService.deepClone<UserAuth>(secuObj);
    if (
      this.securityObject.user.userName &&
      this.securityObject.authorisation.token
    ) {
      this.securityObject$.next(this.securityObject);
      return true;
    }
    return false;
  }

  logout(): void {
    this.resetSecurityObject();
  }

  updateProfile(companyProfile: CompanyProfile) {
    if (companyProfile.logoUrl) {
      companyProfile.logoUrl = `${environment.apiUrl}${companyProfile.logoUrl}`;
    }
    if (companyProfile.bannerUrl) {
      companyProfile.bannerUrl = `${environment.apiUrl}${companyProfile.bannerUrl}`;
    }
    if (companyProfile.smallLogoUrl) {
      companyProfile.smallLogoUrl = `${environment.apiUrl}${companyProfile.smallLogoUrl}`;
    }
    this._companyProfile$.next(companyProfile);
  }

  resetSecurityObject(): void {
    this.securityObject = {
      isAuthenticated: false,
      claims: [],
      user: {
        id: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        userName: '',
        email: '',
      },
      status: '',
      authorisation: {
        token: '',
        type: '',
      },
      tokenTime: new Date(),
    };

    localStorage.removeItem('authObj');
    localStorage.removeItem('bearerToken');
    this.securityObject$.next(null);
    this.router.navigate(['/login']);
  }

  // This method can be called a couple of different ways
  // *hasClaim="'claimType'"  // Assumes claimValue is true
  // *hasClaim="'claimType:value'"  // Compares claimValue to value
  // *hasClaim="['claimType1','claimType2:value','claimType3']"
  // tslint:disable-next-line: typedef
  hasClaim(claimType: string | string[]): boolean {
    let ret = false;
    // See if an array of values was passed in.
    if (typeof claimType === 'string') {
      ret = this.isClaimValid(claimType);
    } else {
      const claims: string[] = claimType;
      if (claims) {
        // tslint:disable-next-line: prefer-for-of
        for (let index = 0; index < claims.length; index++) {
          ret = this.isClaimValid(claims[index]);
          // If one is successful, then let them in
          if (ret) {
            break;
          }
        }
      }
    }
    // return true;
    return ret;
  }

  private isClaimValid(claimType: string): boolean {
    let ret = false;
    let auth: UserAuth = null;
    // Retrieve security object
    auth = this.securityObject;
    if (auth) {
      // Attempt to find the claim
      ret =
        auth.claims.find((c) => c.toLowerCase() == claimType?.toLowerCase()) !=
        null;
    }
    return ret;
  }

  getUserDetail(): UserAuth {
    const userJson = localStorage.getItem('authObj');
    return JSON.parse(userJson);
  }

  setUserDetail(user: UserAuth) {
    this.securityObject = this.clonerService.deepClone<UserAuth>(user);
    localStorage.setItem('authObj', JSON.stringify(this.securityObject));
  }
}
import { environment } from '@environments/environment';
import { CompanyProfile } from '@core/domain-classes/company-profile';
