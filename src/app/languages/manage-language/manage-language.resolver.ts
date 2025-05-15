import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Resolve,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { take, mergeMap } from 'rxjs/operators';
import { LanguagesService } from '../languages.service';

@Injectable({
  providedIn: 'root',
})
export class ManageLanguageResolverService implements Resolve<any> {
  constructor(
    private languageService: LanguagesService,
    private router: Router
  ) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | null {
    const id = route.paramMap.get('id');
    if (id === 'addItem') {
      return null;
    }
    return this.languageService.getLanguageById(id).pipe(
      take(1),
      mergeMap((language) => {
        if (language) {
          return of(language);
        } else {
          this.router.navigate(['/languages']);
          return null;
        }
      })
    );
  }
}
