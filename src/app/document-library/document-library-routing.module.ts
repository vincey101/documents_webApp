import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentLibraryListComponent } from './document-library-list/document-library-list.component';
import { AddDocumentComponent } from './add-document/add-document.component';
import { AuthGuard } from '@core/security/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DocumentLibraryListComponent,
  },
  {
    path: 'add',
    component: AddDocumentComponent,
    data: { claimType: 'ASSIGNED_DOCUMENTS_CREATE_DOCUMENT' },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentLibraryRoutingModule {}
