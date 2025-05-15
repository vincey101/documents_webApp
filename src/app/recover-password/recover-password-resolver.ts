import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { User } from '@core/domain-classes/user';
import { Observable } from 'rxjs';
import { CommonError } from '@core/error-handler/common-error';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class RecoverPasswordResolverService
  implements Resolve<User | CommonError>
{
  constructor(private userService: UserService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<User | CommonError> {
    const id = route.paramMap.get('id');
    return this.userService.getUserInfoFromResetToken(id);
  }
}
