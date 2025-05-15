import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonError } from '../core/error-handler/common-error';
import { FileRequestService } from './file-request.service';
import { FileRequest } from '../core/domain-classes/file-request';

@Injectable({
    providedIn: 'root'
  })
export class FileRequestResolver  {
    constructor(private fileRequestService: FileRequestService) { }
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<FileRequest | CommonError> {
        const id = route.paramMap.get('id')!;
        return this.fileRequestService.getFileRequest(id) as Observable<FileRequest | CommonError>;
    }
}