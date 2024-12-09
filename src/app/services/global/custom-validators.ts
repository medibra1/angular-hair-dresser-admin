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

export function numberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const integerPattern = /^[0-9]*$/;
    const value = control.value;
    if (!value) {
      return null; // Don't validate empty values to allow required validator to handle them
    }
    const valid = integerPattern.test(control.value);
    return valid ? null : { invalidNumber: true };
  };
}

export function priceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const pricePattern = /^\d+(\.\d{1,2})?$/;
    const value = control.value;
    if (!value) {
      return null; // Don't validate empty values to allow required validator to handle them
    }
    const valid = pricePattern.test(control.value);
    return valid ? null : { invalidPrice: true };
  };
}

// Validator pour la taille de fichier
// Validator pour la taille de fichier avec conversion en octets
export function fileSizeValidator(maxSizeInMB: number): ValidatorFn {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Conversion de Mo en octets
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;
    if (file && file.size && file.size > maxSizeInBytes) {
      return { 
        fileSizeExceeded: true,
        allowedMaxSize: maxSizeInMB
      };
    }
    return null;
  };
}

export function fileTypeValidator(allowedTypes: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;
    if (file && file.type && !allowedTypes.includes(file.type)) {
      const types = allowedTypes.map(type => type.split('/')[1]).join(', ')
      return {
         invalidFileType: true,
         allowedFileTypes: types
         };
    }
    return null;
  };
}

export function passwordMismatchValidator(
  currentPasswordKey: string,
  newPasswordKey: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const currentPassword = control.get(currentPasswordKey)?.value;
    const newPasswordControl = control.get(newPasswordKey);

    if (currentPassword && newPasswordControl && currentPassword === newPasswordControl.value) {
      newPasswordControl.setErrors({ passwordMismatch: true });
    } else {
      // Effacer l'erreur si elle existe et que les mots de passe ne correspondent plus
      if (newPasswordControl?.hasError('passwordMismatch')) {
        newPasswordControl.setErrors(null);
      }
    }
    
    return null; // Toujours retourner null pour indiquer que le validateur est appliqué
  };
}

export function passwordMatchingValidator(
  passwordKey: string,
  confirmPasswordKey: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordKey)?.value;
    const ConfirmPasswordControl = control.get(confirmPasswordKey);

    if (password && ConfirmPasswordControl && password !== ConfirmPasswordControl.value) {
      ConfirmPasswordControl.setErrors({ noMatchingPassword: true });
    } 
    else {
      // Effacer l'erreur si elle existe 
      if (ConfirmPasswordControl?.hasError('noMatchingPassword')) {
        ConfirmPasswordControl.setErrors(null);
      }
    }
    return null; // Toujours retourner null pour indiquer que le validateur est appliqué
  };
}
