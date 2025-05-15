import { Routes } from '@angular/router';
import { AuthGuard } from '../core/security/auth.guard';
import { ManageClientComponent } from './manage-client/manage-client.component';
import { ClientResolver } from './client.resolver';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent() {
      return import('./manage-client/manage-client.component').then((m) => m.ManageClientComponent);
    },
    data: { claimType: 'CLIENTS_MANAGE_CLIENTS' },
  },
  {
    path: ':id',
    component: ManageClientComponent,
    resolve: { client: ClientResolver },
    canActivate: [AuthGuard],
    data: { claimType: 'CLIENTS_MANAGE_CLIENTS' },
  },
];
