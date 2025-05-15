import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { TranslationService } from '@core/services/translation.service';

@Injectable({ providedIn: 'root' })
export class MatDialogOptionService {
  public configOptions: MatDialogConfig;
  constructor(private translationService: TranslationService) {}

  public createOptions() {
    return this.translationService.lanDir$.subscribe(
      (configOptions) => (this.configOptions = {
        direction: configOptions,
      })
    );
  }
}
