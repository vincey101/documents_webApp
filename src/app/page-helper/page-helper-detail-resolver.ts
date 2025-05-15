import { Injectable } from '@angular/core';
import {
    Resolve,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { PageHelper } from '@core/domain-classes/page-helper';
import { PageHelperService } from './page-helper.service';

@Injectable()
export class PageHelperDetailResolverService implements Resolve<PageHelper> {
    constructor(private pageHelperService: PageHelperService) { }
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<PageHelper> {
        const id = route.paramMap.get('id');
        return this.pageHelperService.getPageHelper(id) as Observable<PageHelper>;
    }
}
