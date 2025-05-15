import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyProfileComponent } from './company-profile.component';
import { CompanyProfileRoutingModule } from './company-profile-routing.module';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [CompanyProfileComponent],
  imports: [
    CommonModule,
    CompanyProfileRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    NgSelectModule,
  ],
})
export class CompanyProfileModule {}
