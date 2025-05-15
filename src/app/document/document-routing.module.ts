import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@core/security/auth.guard';
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentManageComponent } from './document-manage/document-manage.component';
import { DocumentDeepSearchComponent } from './document-deep-search/document-deep-search.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentListComponent,
    data: { claimType: 'ALL_DOCUMENTS_VIEW_DOCUMENTS' },
    canActivate: [AuthGuard],
  },
  {
    path: 'deep-search',
    component: DocumentDeepSearchComponent,
    data: { claimType: 'DEEP_SEARCH_DEEP_SEARCH' },
    canActivate: [AuthGuard],
  },
  {
    path: 'add',
    component: DocumentManageComponent,
    data: { claimType: 'ALL_DOCUMENTS_CREATE_DOCUMENT' },
    canActivate: [AuthGuard],
  },
  {
    path: 'permission',
    loadChildren: () =>
      import('./document-permission/document-permission.module').then(
        (m) => m.DocumentPermissionModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentRoutingModule {}
