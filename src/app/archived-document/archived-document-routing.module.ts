import { NgModule } from '@angular/core';
import { ArchivedDocumentListComponent } from './archived-document-list/archived-document-list.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/security/auth.guard';


const routes: Routes = [
  {
    path: '',
    component: ArchivedDocumentListComponent,
   data: { claimType: 'ARCHIVE_DOCUMENT_VIEW_DOCUMENTS' },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArchivedDocumentRoutingModule { }
