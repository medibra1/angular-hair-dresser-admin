import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FormErrorMsgComponent } from '../../../components/form-error-msg/form-error-msg.component';
import { AuthService } from '../../../services/auth/auth.service';
import { emailValidator } from '../../../services/global/custom-validators';
import { ToastService } from '../../../services/toast/toast.service';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ResetPasswordComponent } from '../../../components/reset-password/reset-password.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormErrorMsgComponent,
    ModalComponent,
    ResetPasswordComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  fieldTextType = false;
  error = '';

  reset_pwd_model = {
    email: '',
    otp: '',
    new_password: ''
  };

  displayModal = false;

  modalTtile = 'Forgot password';

  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // @ViewChild('emailInput') emailInput!: ElementRef; 

  constructor() {
  }

  ngOnInit() {
    // setTimeout(() => {
    //   this.emailInput.nativeElement.focus();
    // }, 100);

    // console.log('Modal title: ', this.modalTtile);

    this.loginForm = this.formBuilder.group({
      email: [
        '',
        [
          emailValidator(),
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(50),
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
    });
  }

  

  // Getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

   onSubmit() {
    this.submitted = true;
    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;

    this.authService
      .login(this.f['email'].value, this.f['password'].value)
      .then((data) => {
        console.log(data);
        this.router.navigateByUrl('/products/list', { replaceUrl: true });
        this.showToast('You Logged In Successfully!', 'success');
        this.loginForm.reset();
        this.submitted = false;
      })
      .catch((e) => {
        // this.toastService.showToast('Wrong credentials!');
        this.showToast(e.error.message ? e.error.message : 'Something went wrong. Unable to log you in!', 'error');
        this.error = e;
        this.loading = false;
        this.loginForm.reset();
        this.submitted = false;
      });
  }

  sendResetPasswordEmailOtp(email) {
    this.authService.sendResetPasswordOtp(email).then(data => {
      console.log(data);
      this.reset_pwd_model = {...this.reset_pwd_model, email};
      this.modalTtile = 'Verify your Email';
    })
    .catch(e => {
      console.log(e);
      // let msg = 'Something went wrong, please try again';
      this.showToast(e.error.message ? e.error.message : 'Something went wrong, please try again', 'error');
      // if(e?.error?.message) {
      //   msg = e.error.message;
      // }
      // this.global.showAlert(msg);
    });
  }

  verifyResetPasswordOtp(otp) {
    this.authService.verifyResetPasswordOtp(this.reset_pwd_model.email, otp).then(data => {
      console.log(data);
      this.reset_pwd_model = {...this.reset_pwd_model, otp};
      this.modalTtile = 'Reset password';
    })
    .catch(e => {
      console.log(e);
      this.showToast(e.error.message ? e.error.message : 'Something went wrong, please try again', 'error');
      // let msg = 'Something went wrong, please try again';
      // if(e?.error?.message) {
      //   msg = e.error.message;
      // }
      // this.global.showAlert(msg);
    }); 
  }

  resetPassword(new_password) {
    this.reset_pwd_model = {...this.reset_pwd_model, new_password};
    this.authService.resetPassword(this.reset_pwd_model).then(data => {
      console.log(data);
      this.displayModal = false;
      this.reset();
      this.showToast('Your password is changed successfully. Please login now.', 'success');
      // this.modal.dismiss();
      // this.global.successToast('Your password is changed successfully. Please login now.');
    })
    .catch(e => {
      console.log(e);
      // let msg = 'Something went wrong, please try again';
      this.showToast(e.error.message ? e.error.message : 'Something went wrong, please try again', 'error');
      // if(e?.error?.message) {
      //   msg = e.error.message;
      // }
      // this.global.showAlert(msg);
    });
  }

  togglePasswordInputType() {
    this.fieldTextType = !this.fieldTextType;
  }

  reset(event?) {
    console.log(event);
    this.reset_pwd_model = {
      email: '',
      otp: '',
      new_password: ''
    };
  }

  showToast(msg, type) {
    this.toastService.showToast({
      message: msg,
      type: type,
      duration: 5000,
      position: 'top'
    });
  }

}
