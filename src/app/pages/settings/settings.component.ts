import { Component, inject } from '@angular/core';
import { ISetting } from '../../models/setting';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GlobalService } from '../../services/global/global.service';
import { CommonModule, DatePipe } from '@angular/common';
import { skip, take } from 'rxjs';
import { FormErrorMsgComponent } from '../../components/form-error-msg/form-error-msg.component';
import { emailValidator, urlValidator } from '../../services/global/custom-validators';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormErrorMsgComponent],
  providers: [DatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

  settings: any = {};
  editMode = false;
  showForm = false;
  settingsForm: FormGroup;
  successMessage = null;
  errorMessage = [];
  selectedFile: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;

  private global = inject(GlobalService);
  private fb = inject(FormBuilder);
  private datePipe = inject(DatePipe);

  constructor() {
    this.settingsForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      // site_url: ['', [Validators.pattern('^(http|https|www)://.+$')]],
      site_url: ['', [urlValidator()]],
      slogan: [''],
      email: ['', [emailValidator()]],
      email_smtp: ['', [emailValidator()]],
      phone1: ['', Validators.required],
      phone2: [''],
      address1: [''],
      address2: [''],
      map: [''],
      about: [''],
      opening_time: [''],
      closing_time: [''],
      currency: [''],
      facebook: ['', [urlValidator()]],
      instagram: ['', [urlValidator()]],
      twitter: ['', [urlValidator()]],
      youtube: ['', [urlValidator()]],
      whatsapp: ['', [urlValidator()]],
      tiktok: ['', [urlValidator()]],
      social1: [''],
      social2: [''],
      delivery_charge: [''],
      language: [''],
      theme: [''],
      api_url: ['', [urlValidator()]],
    });
  }

  ngOnInit(): void {
    this.global.loadSettings();
    this.global.settings$
    .pipe(
      skip(1),
      take(1)
      )
    .subscribe({
      next: settings => {
        this.settings = settings;
        console.log('Settings comp: ', this.settings);
        this.initializeForm();
      },
      error: err => {
        this.settings = {};
        // this.errorMessage.push(err?.error?.message);
        console.log('ERROR: ', err);
      }
    });
  }

  // ngOnChanges () {
  //   this.initializeForm();
  // }

  initializeForm(): void {
    if (!this.settings) {
      return;
    }
    this.settingsForm.patchValue({
      name: this.settings.name || '',
      site_url: this.settings.site_url || '',
      slogan: this.settings.slogan || '',
      email: this.settings.email || '',
      email_smtp: this.settings.email_smtp || '',
      phone1: this.settings.phone1 || '',
      phone2: this.settings.phone2 || '',
      address1: this.settings.address1 || '',
      address2: this.settings.address2 || '',
      map: this.settings.map || '',
      about: this.settings.about || '',
      opening_time: this.settings.opening_time || '',
      closing_time: this.settings.closing_time || '',
      currency: this.settings.currency || '',
      facebook: this.settings.facebook || '',
      instagram: this.settings.instagram || '',
      twitter: this.settings.twitter || '',
      youtube: this.settings.youtube || '',
      whatsapp: this.settings.whatsapp || '',
      tiktok: this.settings.tiktok || '',
      social1: this.settings.social1 || '',
      social2: this.settings.social2 || '',
      delivery_charge: this.settings.delivery_charge || '',
      language: this.settings.language || '',
      theme: this.settings.theme || '',
      api_url: this.settings.api_url || ''
    });
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result;
        console.log('Logo Preview: ', );
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if(!this.editMode) this.initializeForm();
  }

  isObjectExist(obj: any): boolean {
    return Object.keys(obj).length > 0;
  }

  formatTime(time: string): string {
    // Convert "10:00:00" to a Date object assuming it's today
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds);
    return this.datePipe.transform(date, 'h:mm:ss')!;
  }
  
  async saveSettings() {
    if (this.settingsForm.valid) {
      let formData = new FormData();
      Object.keys(this.settingsForm.value).forEach(key => {
        formData.append(key, this.settingsForm.value[key]);
      });
      if (this.selectedFile) {
        formData.append('logo', this.selectedFile, this.selectedFile.name);
      }
      console.log('Setting form value: ', this.settingsForm.value);
      try {
        let response: any;
        if(!this.settings.id) {
          response = await this.global.createSettings(formData);
        } else {
          console.log('+++++++ Settings: +++++++', formData.get('logo'));
          response = await this.global.updateSettings(this.settings.id, formData);
        }
        this.settings = response;
        console.log('SETTINGS: ', response);
        this.editMode = false;
        this.successMessage = 'Setting edited successfully';
        // this.isObjectEmpty(this.settings);
        setTimeout(() => {
          this.successMessage = undefined;
        }, 3000);
        this.scrollToTop();
      } catch (e: any) {
        this.initializeForm();
        this.scrollToTop();
        e?.error?.message ? this.errorMessage = e?.error?.message : '';
        setTimeout(() => {
          this.errorMessage = [];
        }, 6000);
        console.log(e?.error?.message);
      }

    } else {
      this.validateAllFormFields(this.settingsForm);
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

  scrollToTop() {
    window.scrollTo(0, 0);
  }
  
}
