import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentAuditTrailRoutingModule } from './document-audit-trail-routing.module';
import { DocumentAuditTrailComponent } from './document-audit-trail.component';
import { MatSortModule } from '@angular/material/sort';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { PipesModule } from '@shared/pipes/pipes.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [DocumentAuditTrailComponent],
  imports: [
    CommonModule,
    DocumentAuditTrailRoutingModule,
    MatTableModule,
    MatSlideToggleModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    TranslateModule,
    NgSelectModule,
    PipesModule,
    SharedModule
  ],
})
export class DocumentAuditTrailModule {}
