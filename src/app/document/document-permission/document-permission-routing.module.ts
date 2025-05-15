import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentPermissionListComponent } from './document-permission-list/document-permission-list.component';

const routes: Routes = [
  {
    path: ':id',
    component: DocumentPermissionListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentPermissionRoutingModule {}
