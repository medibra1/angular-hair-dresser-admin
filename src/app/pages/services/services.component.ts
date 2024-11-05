import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GlobalService } from '../../services/global/global.service';
import { Subscription } from 'rxjs';
import { AlertComponent } from '../../components/alert/alert.component';
import { FormErrorMsgComponent } from '../../components/form-error-msg/form-error-msg.component';
import { fileSizeValidator, fileTypeValidator, priceValidator } from '../../services/global/custom-validators';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, FormErrorMsgComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  serviceForm: FormGroup;
  servicesList: any[] = [];

  selectedFile: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;
  allowedFileTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  allowedFileSize = 2; // 2mb

  editMode = false;
  // showForm = false;
  formMode: 'Add' | 'Edit' = 'Add';
  successMessage = null;
  errorMessage = [];
  currentServiceId: number | null = null;
  serviceSub: Subscription;

  constructor(private fb: FormBuilder, private global: GlobalService) {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      price: [null, [priceValidator()]],
      promo_price: [null, [priceValidator()]],
      image: [null,
        [
          fileTypeValidator(this.allowedFileTypes), 
          fileSizeValidator(this.allowedFileSize) 
        ]
      ],
      // description: [''],
      status: [false],
      type: ['']
      // type: ['', [Validators.pattern(/^[0-9]+$/)]]
    });
  }

  ngOnInit(): void {
    this.loadServices();
    this.global.getServices();
  }

  hidewForm() {
    this.editMode = false;
    this.serviceForm.reset();
    this.currentServiceId = null;
  }

  loadServices() {
    this.serviceSub = this.global.services$.subscribe(data => {
      this.servicesList = data;
    });
    // this.global.services$.subscribe(settings => {
    //   this.settingsList = settings;
    // });
  }

  onFileSelected(event: Event): void {
    console.log('ON FILE CHANGE ****************');
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result;
      };
      reader.readAsDataURL(this.selectedFile);
      input.value = '';

    // Set the form control value
    this.serviceForm.get('image')?.setValue(this.selectedFile);
    this.serviceForm.get('image')?.updateValueAndValidity();
    this.serviceForm.get('image')?.markAsDirty();
    console.log(this.serviceForm.get('image').value);
    }
  }

  toggleEditMode(service?: any): void {
    // this.editMode = !this.editMode;
    this.editMode = true;
    this.formMode = service ? 'Edit' : 'Add';
    if (service) {
      service.status = service.status == 1 ? true : false;
      service.type = service.type == 1 ? true : false;
      this.currentServiceId = service.id;
      this.serviceForm.patchValue(service);
    } else {
      this.currentServiceId = null;
      this.serviceForm.reset();
    }
  }

  async saveService() {
    console.log('Current ID: ', this.currentServiceId);
    if (this.serviceForm.valid) {

      if(this.serviceForm.get('status').value == true) this.serviceForm.get('status').patchValue(1);
      else this.serviceForm.get('status').patchValue(0);
      if(this.serviceForm.get('type').value == true) this.serviceForm.get('type').patchValue(1);
      else this.serviceForm.get('type').patchValue(2);

      let formData = new FormData();
      Object.keys(this.serviceForm.value).forEach(key => {
        if (this.serviceForm.value[key] !== null && this.serviceForm.value[key] !== '') {
          formData.append(key, this.serviceForm.value[key]);
        } else {
          // if (key === 'price' || key === 'promo_price' || key === 'description' || key === 'type') formData.append(key, '');
            formData.append(key, '');
        }
      });
      
      if (this.selectedFile) formData.append('image', this.selectedFile, this.selectedFile.name);
      else  formData.delete('image');

      try {
        if (this.formMode === 'Add') {
          await this.global.createService(formData);
        } else if (this.formMode === 'Edit' && this.currentServiceId !== null) {
          await this.global.updateService(this.currentServiceId, formData);
        }
        this.successMessage = 'Service saved successfully';
        // this.editMode = false;
        this.hidewForm();
      } catch (e: any) {
        console.log(e?.error?.message);
        this.errorMessage = e?.error?.message || 'An error occurred';
      }
    }
  }

  async deleteService(id: number) {
    try {
      if (window.confirm('Do you want to remove this service?')) await this.global.deleteServices(id);
      else return;
      this.successMessage = 'Service deleted successfully';
      this.hidewForm();
    } catch (err) {
      if(!err.error.status && err.error.code == 409) this.errorMessage.push(err.error.message);
      else this.errorMessage.push('Something went wrong');
      console.log(err);
    }
  }


  ngOnDestroy() {
    if(this.serviceSub) this.serviceSub.unsubscribe();
  }
  
}

