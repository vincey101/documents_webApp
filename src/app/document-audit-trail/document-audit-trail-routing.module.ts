import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@core/security/auth.guard';
import { DocumentAuditTrailComponent } from './document-audit-trail.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentAuditTrailComponent,
    data: { claimType: 'DOCUMENT_AUDIT_TRAIL_VIEW_DOCUMENT_AUDIT_TRAIL' },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentAuditTrailRoutingModule {}
