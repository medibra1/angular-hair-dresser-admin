import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// export function urlValidator(): ValidatorFn {
//   const urlPattern = /^(http(s)?:\/\/)?(www\.)?([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9\-_\/\.]*)*$/;
//   return (control: AbstractControl): ValidationErrors | null => {
//     const value = control.value;
//     if (!value) {
//       return null; // Don't validate empty values to allow required validator to handle them
//     }
//     const isValid = urlPattern.test(value);
//     return isValid ? null : { invalidUrl: true };
//   };
// }

export function urlValidator(): ValidatorFn {
  const urlPattern = /^(http(s)?:\/\/)?(www\.)?([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9\-_\/\.]*)*(\?[a-zA-Z0-9&=_\-\.]*)?$/;
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // Don't validate empty values to allow required validator to handle them
    }
    const isValid = urlPattern.test(value);
    return isValid ? null : { invalidUrl: true };
  };
}


export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const value = control.value;
    if (!value) {
      return null; // Don't validate empty values to allow required validator to handle them
    }
    const valid = emailPattern.test(control.value);
    return valid ? null : { invalidEmail: true };
  };
}
