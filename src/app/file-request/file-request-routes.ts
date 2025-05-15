import { Routes } from '@angular/router';
import { AuthGuard } from '../core/security/auth.guard';
import { ManageFileRequestComponent } from './manage-file-request/manage-file-request.component';
import { FileRequestResolver } from './file-request.resolver';

export const FILE_REQUEST_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent() {
      return import('./manage-file-request/manage-file-request.component').then((m) => m.ManageFileRequestComponent);
    },
    data: { claimType: ['FILE_REQUEST_CREATE_FILE_REQUEST', 'FILE_REQUEST_UPDATE_FILE_REQUEST'] },
  },
  {
    path: ':id',
    component: ManageFileRequestComponent,
    resolve: { fileRequest: FileRequestResolver },
    canActivate: [AuthGuard],
    data: { claimType: ['FILE_REQUEST_CREATE_FILE_REQUEST', 'FILE_REQUEST_UPDATE_FILE_REQUEST'] },
  },
];
