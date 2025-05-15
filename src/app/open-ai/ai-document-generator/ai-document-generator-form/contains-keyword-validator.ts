import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function containsKeywordValidator(keyword: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';
    return value.includes(keyword) ? { keywordExists: true } : null;
  };
}
