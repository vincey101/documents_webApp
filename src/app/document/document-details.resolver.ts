import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { DocumentInfo } from '@core/domain-classes/document-info';
import { DocumentService } from './document.service';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

export const documentDetailsResolver: ResolveFn<DocumentInfo> = (route: ActivatedRouteSnapshot) => {
  const documentService = inject(DocumentService);
  const router = inject(Router);
  const id = route.params['id']
  if (id != null) {
    return documentService.getDocument(id) as Observable<DocumentInfo>;
  } else {
    router.navigate(['/']);
    return null;
  }
}
