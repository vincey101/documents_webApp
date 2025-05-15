import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatDialogOptionService } from './mat-dialog-config.service';

export function createConfig(matDialogOptionService: MatDialogOptionService) {
    return () => matDialogOptionService.createOptions();
  }
  
  export function getConfigOptions(matDialogOptionService: MatDialogOptionService) {
    return matDialogOptionService.configOptions;
  }

@NgModule({
  providers: [
    {
        provide: APP_INITIALIZER,
        useFactory: createConfig,
        deps: [MatDialogOptionService],
        multi: true
      },
      {
        provide: MAT_DIALOG_DEFAULT_OPTIONS,
        useFactory: getConfigOptions,
        deps: [MatDialogOptionService]
      }
  ],
})
export class MatDialogConfigurationModule {}
