import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormErrorMsgComponent } from '../form-error-msg/form-error-msg.component';
import { UsersService } from '../../services/users/users.service';
import {
  fileSizeValidator,
  fileTypeValidator,
  numberValidator,
  passwordMatchingValidator,
} from '../../services/global/custom-validators';

// export const passwordMatchingValidator: ValidatorFn = (
//   control: AbstractControl): ValidationErrors | null => {
//   const password = control.get('password');
//   const confirmPassword = control.get('confirmPassword');
//   return password?.value === confirmPassword?.value
//     ? null
//     : { pwdNotMatched: 'Passwords do not match.' };
// };

// function passwordMatchingValidator(formGroup: FormGroup) {
//   const password = formGroup.get('password').value;
//   const confirmPassword = formGroup.get('confirm_password').value;
//   if (password !== confirmPassword) {
//     formGroup.get('confirm_password').setErrors({ notMatching: true });
//   } else {
//     return null;
//   }
// }

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormErrorMsgComponent],
  templateUrl: './signup-form.component.html',
  styleUrl: './signup-form.component.css',
})
export class SignupFormComponent {

  @Output() addAdminReponse = new EventEmitter<{}>();


  signupForm: FormGroup;
  fieldTextType = false;
  error = '';

  selectedFile: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;
  allowedFileTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  allowedFileSize = 2; // 2mb

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UsersService
  ) {}

  ngOnInit() {
    this.signupForm = this.formBuilder.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
          ],
        ],
        email: [
          '',
          [
            Validators.email,
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(50),
          ],
        ],
        phone: [
          '',
          [
            // Validators.pattern('^[0-9]*$'),
            numberValidator(),
            Validators.minLength(9),
            Validators.maxLength(10),
          ],
        ],
        address: ['', [Validators.minLength(6), Validators.maxLength(50)]],
        status: [0, ],
        photo: [
          null,
          [
            fileTypeValidator(this.allowedFileTypes), // Validator pour le type de fichier
            fileSizeValidator(this.allowedFileSize),
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(50),
          ],
        ],
        confirm_password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(50),
          ],
        ],
      },
      { validators: passwordMatchingValidator('password', 'confirm_password') }
    );
  }

  // Getter for easy access to form fields
  get f() {
    return this.signupForm.controls;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    // console.log('SELECTED FILE: ', this.selectedFile);
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result;
      };
      reader.readAsDataURL(this.selectedFile);
      input.value = '';

      // Set the form control value
      this.signupForm.get('photo')?.setValue(this.selectedFile);
      this.signupForm.get('photo')?.updateValueAndValidity();
      this.signupForm.get('photo')?.markAsDirty();
      console.log(this.signupForm.get('photo').value);
    }
  }

  async onSubmit() {
    // Stop here if form is invalid
    if (this.signupForm.valid) {
      if (this.signupForm.dirty) {

        if(this.signupForm.get('status').value == true) this.signupForm.get('status').patchValue(1);
        else this.signupForm.get('status').patchValue(0);

        let formData = new FormData();
        Object.keys(this.signupForm.value).forEach((key) => {
          if (this.signupForm.value[key] !== null && this.signupForm.value[key] !== '') {
            formData.append(key, this.signupForm.value[key]);
          } else formData.append(key, ''); 
        });
        try {
          formData.append('type', '2');
          await this.userService.signup(formData); 
          this.addAdminReponse.emit({
            status: true,
            message: 'Admin created successfully!!'
          });
        } catch (error) {
          this.addAdminReponse.emit({
            status: false,
            message: error?.error ? error.error.message : 'Smothing went wrong. please try again!'
          });
          throw(error);
        }
      }
      
    } else {
      this.validateAllFormFields(this.signupForm);
      return;
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      } else {
        control.markAsTouched({ onlySelf: true });
      }
    });
  }

  togglePasswordInputType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
