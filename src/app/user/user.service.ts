import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { User } from '@core/domain-classes/user';
import { Observable } from 'rxjs';
import { CommonError } from '@core/error-handler/common-error';
import { catchError } from 'rxjs/operators';
import { UserClaim } from '@core/domain-classes/user-claim';

@Injectable({ providedIn: 'root' })
export class UserService {

  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService) { }

  updateUser(user: User): Observable<User | CommonError> {
    const url = `user/${user.id}`;
    return this.httpClient.put<User>(url, user)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  addUser(user: User): Observable<User | CommonError> {
    const url = `user`;
    return this.httpClient.post<User>(url, user)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  deleteUser(id: string): Observable<void | CommonError> {
    const url = `user/${id}`;
    return this.httpClient.delete<void>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getUser(id: string): Observable<User | CommonError> {
    const url = `user/${id}`;
    return this.httpClient.get<User>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  updateUserClaim(userClaims: UserClaim[], userId: string): Observable<User | CommonError> {
    const url = `userClaim/${userId}`;
    return this.httpClient.put<User>(url, { userClaims })
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  resetPassword(user: User): Observable<User | CommonError> {
    const url = `user/resetpassword`;
    return this.httpClient.post<User>(url, user)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  changePassword(user: User): Observable<User | CommonError> {
    const url = `user/changepassword`;
    return this.httpClient.post<User>(url, user)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  updateUserProfile(user: User): Observable<User | CommonError> {
    const url = `users/profile`;
    return this.httpClient.put<User>(url, user)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getUserInfoFromResetToken(id): Observable<User | CommonError> {
    const url = `user/getResetinfo/${id}`;
    return this.httpClient.get<User>(url)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  sendResetPasswordLink(user: User) {
    const url = `user/forgotPassword`;
    return this.httpClient.post<User>(url, user)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  recoverPassword(user: User): Observable<User | CommonError> {
    const url = `user/recoverPassword`;
    return this.httpClient.post<User>(url, user)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }
}
