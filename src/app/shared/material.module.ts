import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { provideEnvironmentNgxMask } from 'ngx-mask';

const materialModules = [
  MatButtonModule,
  MatInputModule,
  MatListModule,
  MatIconModule,
  MatTooltipModule,
  MatNativeDateModule,
  MatButtonToggleModule,
  MatFormFieldModule,
  MatMenuModule,
  MatSlideToggleModule
];

@NgModule({
  declarations: [],
  imports: [materialModules],
  exports: [materialModules],
  providers:[provideEnvironmentNgxMask()]
})
export class MaterialModule {}
