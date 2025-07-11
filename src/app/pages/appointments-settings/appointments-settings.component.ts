import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormErrorMsgComponent } from '../../components/form-error-msg/form-error-msg.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IAppointmentSetting } from '../../models/appointment-setting';
import { skip, take } from 'rxjs';
import { AppointmentsSettingsService } from '../../services/appointments-settings/appointments-settings.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AlertComponent } from '../../components/alert/alert.component';

@Component({
  selector: 'app-appointments-settings',
  standalone: true,
  imports: [FormErrorMsgComponent, CommonModule, ReactiveFormsModule, BsDatepickerModule, AlertComponent],
  // providers: [DatePipe],
  templateUrl: './appointments-settings.component.html',
  styleUrl: './appointments-settings.component.css',
})
export class AppointmentsSettingsComponent {
  settings = {} as IAppointmentSetting;
  editMode = false;
  showForm = false;
  settingsForm: FormGroup;
  successMessage = null;
  errorMessage = [];

  private appointmentSettingService = inject(AppointmentsSettingsService);
  private fb = inject(FormBuilder);
  // private datePipe = inject(DatePipe);

  selectedDays: string[] = [];
  selectedDates: string[] = [];
  // minDate: string;
  minDate: Date = new Date();

  // @ViewChild('dateInput3') dateInput!: ElementRef;
  // @ViewChild('dateInputBtn3') dateInputBtn!: ElementRef;

  constructor() {
    this.settingsForm = this.fb.group({
      start_time: [''],
      end_time: [''],
      pause_start_time: [''],
      pause_end_time: [''],
      // off_days: [''],
      // off_dates: [''],
    });
  }

  ngOnInit(): void {
    this.appointmentSettingService.loadSettings();
    this.appointmentSettingService.settings$.pipe(skip(1), take(1)).subscribe({
      next: (settings) => {
        this.settings = settings;
        console.log('appointment Settings: ', this.settings);
        this.initializeForm();
        this.selectedDays = this.settings.off_days;
        this.selectedDates = this.settings.off_dates;
      },
      error: (err) => {
        this.settings = {};
        // this.errorMessage.push(err?.error?.message);
        console.log('ERROR: ', err);
      },
    });

    // Get today's date in YYYY-MM-DD format
    // const today = new Date();
    // this.minDate = today.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'
  }

  disableTyping(event: KeyboardEvent): void {
    event.preventDefault(); // Disable typing
  }

  // openDatePicker(event: MouseEvent): void {
  //   event.preventDefault();
  //   this.dateInputBtn.nativeElement.style.display = 'none';
  //   this.dateInput.nativeElement.style.display = 'block';
  //   this.dateInput.nativeElement.focus();
  // }

  initializeForm(): void {
    if (!this.settings) {
      return;
    }
    this.settingsForm.patchValue({
      start_time: this.settings.start_time || '',
      end_time: this.settings.end_time || '',
      pause_start_time: this.settings.pause_start_time || '',
      pause_end_time: this.settings.pause_end_time || '',
      // off_days: this.settings.off_days || '',
      // off_dates: this.settings.off_dates || '',
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.initializeForm();
      // this.dateInputBtn.nativeElement.style.display = 'block';
      // this.dateInput.nativeElement.style.display = 'none';
    }
    this.selectedDays = this.settings.off_days? [...this.settings.off_days] : [];
    this.selectedDates = this.settings.off_dates? [...this.settings.off_dates] : [];
  }

  isObjectExist(obj: any): boolean {
    return Object.keys(obj).length > 0;
  }

  // formatTime(time: string): string {
  //   // Convert "10:00:00" to a Date object assuming it's today
  //   const [hours, minutes, seconds] = time.split(':').map(Number);
  //   const date = new Date();
  //   date.setHours(hours, minutes, seconds);
  //   return this.datePipe.transform(date, 'h:mm:ss')!;
  // }

  async saveSettings() {
    if (this.settingsForm.valid) {
      let formData = new FormData();

      Object.keys(this.settingsForm.value).forEach((key) => {
        if (
          this.settingsForm.value[key] !== null &&
          this.settingsForm.value[key] !== ''
        ) {
          formData.append(
            key,
            this.getOnlyHourMinute(this.settingsForm.value[key])
          );
        } else {
          formData.append(key, '');
        }
      });

      // formData.append('start_time', this.getOnlyHourMinute(this.settingsForm.value['start_time']));
      // formData.append('end_time', this.getOnlyHourMinute(this.settingsForm.value['end_time']));
      // formData.append('pause_start_time', this.getOnlyHourMinute(this.settingsForm.value['pause_start_time']));
      // formData.append('pause_end_time', this.getOnlyHourMinute(this.settingsForm.value['pause_end_time']));

      if (this.selectedDays.length > 0) {
        this.selectedDays.forEach((d) => {
          formData.append('off_days[]', d);
        });
      } else formData.append('off_days[]', '');

      if (this.selectedDates.length > 0) {
        this.selectedDates.forEach((d) => {
          formData.append('off_dates[]', d);
        });
      } else formData.append('off_dates[]', '');

      console.log('Setting form value: ', this.settingsForm.value);
      try {
        let response: any;
        if (!this.settings.id) {
          response = await this.appointmentSettingService.createSettings(
            formData
          );
        } else {
          response = await this.appointmentSettingService.updateSettings(
            this.settings.id,
            formData
          );
        }
        this.settings = response;
        console.log('SETTINGS: ', response);
        this.editMode = false;
        this.successMessage = 'Setting edited successfully';
        // this.isObjectEmpty(this.settings);
        this.scrollToTop();
      } catch (e: any) {
        this.initializeForm();
        this.scrollToTop();
        e?.error?.message ? (this.errorMessage = e?.error?.message) : '';
        console.log(e?.error?.message);
      }
    } else {
      this.validateAllFormFields(this.settingsForm);
    }
  }

  getDayName(day: string) {
    const days = {
      '1': 'Monday',
      '2': 'Tuesday',
      '3': 'Wednesday',
      '4': 'Thursday',
      '5': 'Friday',
      '6': 'Saturday',
      '7': 'Sunday',
    };
    return days[day];
  }

//   onBlur(){
//     this.dateInputBtn.nativeElement.style.display = 'block';
//     this.dateInput.nativeElement.style.display = 'none';
//  }

  // Unified add/remove handler
  handleAdd(type: string, event: any) {
    // const value = event.target.value;
    // if (type === 'days' && value && !this.selectedDays.includes(value)) {
    //   this.selectedDays.push(value);
    // } else if (type === 'dates' && value && !this.selectedDates.includes(value)
    // ) {this.selectedDates.push(value); }
    // event.target.value = ''; 
    console.log('event.target.value: ', event.target);
    let dayValue = event.target ? event.target.value : null;
    let dateValue = event;
    if (type === 'days' && dayValue && !this.selectedDays.includes(dayValue)) {
      this.selectedDays.push(dayValue);
    } else if (
      type === 'dates' &&
      dateValue &&
      !this.selectedDates.includes(dateValue)
    ) {
      const year = event.getFullYear();
      const month = (event.getMonth() + 1).toString().padStart(2, '0'); // Adjust for 0-indexed month
      const day = event.getDate().toString().padStart(2, '0');
      // Format the date as a string to match the format in your excludedDates array (yyyy-mm-dd)
      const formattedDate = `${year}-${month}-${day}`;
      this.selectedDates.push(formattedDate);
    }

    dayValue = ''; // Reset input/select field after adding
    dateValue = null; // Reset input/select field after adding
  }

  handleRemove(type: string, value: string) {
    if (type === 'days') {
      this.selectedDays = this.selectedDays.filter((day) => day !== value);
    } else if (type === 'dates') {
      this.selectedDates = this.selectedDates.filter((date) => date !== value);
    }
  }

  getOnlyHourMinute(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return `${this.padZero(hours)}:${this.padZero(minutes)}`;
  }
  padZero(number: number): string {
    return number < 10 ? `0${number}` : number.toString(); // ajouter un zéro au début si le chiffre est inférieur à 10
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

  scrollToTop() {
    window.scrollTo(0, 0);
  }
}
