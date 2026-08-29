import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const control = group.get(controlName);
    const matchingControl = group.get(matchingControlName);
    if (!control || !matchingControl) return null;

    if (matchingControl.errors && !matchingControl.errors['mismatch']) {
      return null;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ ...matchingControl.errors, mismatch: true });
      return { mismatch: true };
    }

    if (matchingControl.hasError('mismatch')) {
      const { mismatch, ...rest } = matchingControl.errors ?? {};
      matchingControl.setErrors(Object.keys(rest).length ? rest : null);
    }

    return null;
  };
}