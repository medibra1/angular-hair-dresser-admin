import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormErrorMsgComponent } from '../form-error-msg/form-error-msg.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
import { fileSizeValidator, fileTypeValidator } from '../../services/global/custom-validators';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormErrorMsgComponent],
  templateUrl: './profile-form.component.html',
  styleUrl: './profile-form.component.css'
})
export class ProfileFormComponent {

  @Input() profile = {} as User;
  @Input() profileService;
  @Output() updateProfileReponse = new EventEmitter<{}>();

  profileForm: FormGroup;

  
  selectedFile: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;
  allowedFileTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  allowedFileSize = 2; // 2mb

  private formBuilder = inject(FormBuilder);

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm(): void {
    // console.log('Profile data to patch: ', this.profile);
    // if (!this.profile) {
    //   return;
    // }
    // this.profileForm.patchValue({
    //   name: this.profile.name,
    //   eamil: this.profile.email ,
    // });
    this.profileForm = this.formBuilder.group({
      name: [
        this.profile?.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      // email: [this.profile.email, [Validators.email, Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      phone: [
        this.profile.phone,
        [
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(9),
          Validators.maxLength(10),
        ],
      ],
      address: [
        this.profile.address,
        [Validators.minLength(3), Validators.maxLength(50)],
      ],
      city: [
        this.profile.city,
        [Validators.minLength(3), Validators.maxLength(20)],
      ],
      photo: [null, 
        [
          fileTypeValidator(this.allowedFileTypes), // Validator pour le type de fichier
          fileSizeValidator(this.allowedFileSize) 
        ]
      ],
    });
  }

  get f() {
    return this.profileForm.controls;
  }

    // Méthode pour extraire les extensions
    getAllowedExtensions(): string[] {
      return this.allowedFileTypes.map(type => type.split('/')[1]); // extrait la partie après "/"
    }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    // console.log('SELECTED FILE: ', this.selectedFile);
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result;
        // this.logoPreview = this.sanitizer.bypassSecurityTrustResourceUrl(this.settings.map);
        // console.log('Safe image Url: ', this.safeMapUrl);
      };
      reader.readAsDataURL(this.selectedFile);
      input.value = '';

      // Set the form control value
      this.profileForm.get('photo')?.setValue(this.selectedFile);
      this.profileForm.get('photo')?.updateValueAndValidity();
      this.profileForm.get('photo')?.markAsDirty();
      console.log(this.profileForm.get('photo').value);
    }
  }

  async updateProfile() {
    if (this.profileForm.valid) {
      console.log('Profile form value: ', this.profileForm.value);
      if(this.profileForm.dirty) {
        try {
          let formData = new FormData();
  
          formData.append('name', this.f['name']?.value);
          formData.append('city', this.f['city']?.value);
          formData.append('phone', this.f['phone']?.value);
          formData.append('address', this.f['address']?.value);
          if (this.selectedFile) {
            formData.append('photo', this.selectedFile, this.selectedFile?.name);
          }
  
          let response: any;
          response = await this.profileService.updateProfile(this.profile?.id, formData);
          // this.closeModal();
          console.log('SETTINGS: ', response);
          this.updateProfileReponse.emit({
            status: true,
            message: 'Profile edited successfully'
          });
        } catch (e: any) {
          this.updateProfileReponse.emit({
            status: false,
            message: e?.error ? e.error.message : 'Smothing went wrong. please try again!'
          });
          console.log('Profile update error: ', e.error.message);
          throw(e);
        }
      }

    } else {
      this.validateAllFormFields(this.profileForm);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      } else {
        control.markAsTouched({ onlySelf: true });
      }
    });
  }

}
