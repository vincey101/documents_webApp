import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { catchError, mergeMap, Observable, of, take } from 'rxjs';
import { CommonError } from '../core/error-handler/common-error';
import { FileRequestService } from './file-request.service';
import { FileRequest } from '../core/domain-classes/file-request';
import { FileRequestInfo } from '@core/domain-classes/file-request-info';

@Injectable({
    providedIn: 'root'
})
export class FileRequestLinkPreviewResolver {
    constructor(private fileRequestService: FileRequestService) { }
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<FileRequestInfo | null> {
        const code = route.paramMap.get('code')!;
        return this.fileRequestService.getFileRequestData(code).pipe(
            take(1),
            mergeMap((fileRequest: FileRequestInfo) => {
                if (fileRequest) {
                    return of(fileRequest);
                } else {
                    return null;
                }
            }),
            catchError(() => {
                return of(null);
            })
        );
    }
}