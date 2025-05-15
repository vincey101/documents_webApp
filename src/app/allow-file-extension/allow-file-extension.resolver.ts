import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AllowFileExtensionService } from './allow-file-extension.service';
import { CommonError } from '../core/error-handler/common-error';
import { AllowFileExtension } from '@core/domain-classes/allow-file-extension';

@Injectable({
    providedIn: 'root'
  })
export class AllowFileExtensionResolver  {
    constructor(private allowFileExtensionService: AllowFileExtensionService) { }
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<AllowFileExtension | CommonError> {
        const id = route.paramMap.get('id');
        return this.allowFileExtensionService.getAllowFileExtension(id) as Observable<AllowFileExtension | CommonError>;
    }
}