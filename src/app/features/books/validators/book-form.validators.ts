import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function trimmedRequired(): ValidatorFn {
  return (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const value = control.value;

    if (
      value === null ||
      value === undefined ||
      String(value).trim().length === 0
    ) {
      return {
        trimmedRequired: true,
      };
    }

    return null;
  };
}