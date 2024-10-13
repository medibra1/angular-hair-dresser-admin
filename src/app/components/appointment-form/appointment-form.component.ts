import { Component, EventEmitter, Output } from '@angular/core';
import { GlobalService } from '../../services/global/global.service';
import { Subscription, filter, take } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { FormErrorMsgComponent } from '../form-error-msg/form-error-msg.component';
import { AppointmentService } from '../../services/appointment/appointment.service';
import { emailValidator } from '../../services/global/custom-validators';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [FormErrorMsgComponent, ReactiveFormsModule, CommonModule],
  providers: [DatePipe],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.css'
})
export class AppointmentFormComponent {

  @Output() bookedSuccess = new EventEmitter<Boolean>();

  appointmentForm: FormGroup;
  availableSlots: string[] = [];
  selectedDate: string;
  servicesSub: Subscription;
  services: any[]  = [];
  minDate: string = '';
  // settings: ISetting = {} as ISetting;
  // slotActive = false;
  selectedSlot: string | null = null;

  loading = false;
  submitted = false;
  success = '';
  error = '';

  excludedDates: string[] = [];
  excludedDays: number[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private appointmentService: AppointmentService,
    private datePipe: DatePipe,
    private global: GlobalService,
  ) {
    this.appointmentForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [emailValidator(), Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(9), Validators.maxLength(10)]],
      date: ['', Validators.required],
      time: ['', Validators.required],
      service_id: ['', Validators.required],
      message: ['', Validators.nullValidator],
    });
  }

  ngOnInit(): void {
    // Initialize minDate with today's date
    const today = new Date();
    this.minDate = this.datePipe.transform(today, 'yyyy-MM-dd')!;

    this.global.getServices();
    this.getServices();
  }



  getServices() {
    this.servicesSub =  this.global.services$
    .pipe(
      filter(services => Object.keys(services).length > 0), // Filtrer les objets non vides
      take(1))
    .subscribe( services => {
      this.services = services;
      console.log('Appointement services: ', this.services);
    });
  }

   //Vérifie si une date est exclue
  //  isExcludedDate(date: any): boolean {
  //   const [year, month, day] = date.split('-').map(Number);
  //   const parseToDate = new Date();
  //   parseToDate.setFullYear(year, month, day);
  //   const dayOfWeek = parseToDate.getDay() === 0 ? 7 : parseToDate.getDay();
  //   return this.excludedDates.includes(date) || this.excludedDays.includes(dayOfWeek);
  // }
   isExcludedDate(date: string): boolean {
    const [year, month, day] = date.split('-').map(Number);
    const parseToDate = new Date(year, month - 1, day); // Ajustement du mois (0-11 pour JS Date)
    const dayOfWeek = parseToDate.getDay() === 0 ? 7 : parseToDate.getDay(); // Ajuster dimanche (0) à 7
    return this.excludedDates.includes(date) || this.excludedDays.includes(dayOfWeek);
  }

  onDateChange(event: any): void {
    this.selectedDate = event.target.value;
    const start_time = '10:00';
    const end_time = '20:00';
    const interval_minute = 30;
    // this.excludedDates = ['2024-05-31', '2024-06-03']; // Dates spécifiques à exclure;
    this.excludedDays = [7]; // 6 = Samedi, 7 = Dimanche

    if (this.isExcludedDate(this.selectedDate)) {
      this.appointmentForm.controls['date'].setValue(null);
      this.availableSlots = [];
      alert('The selected date is unavailable. Please choose another date.');
      return;
    }

    console.log('Selected date: ', this.selectedDate);
    this.appointmentService.getAvailableSlots(this.selectedDate, start_time, end_time, interval_minute ).subscribe({
        next: slots => {
          this.availableSlots = slots.map(slot => this.formatTime(slot));
          console.log('Available slots: ', this.availableSlots);
          this.selectedSlot = null; // Reset selected slot when date changes
        },
        error: error => console.error('Error fetching available slots:', error)
      });
  }

  formatTime(time: string): string {
    // Convert "10:00:00" to a Date object assuming it's today
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds);
    return this.datePipe.transform(date, 'h:mm a')!;
  }

  async bookAppointment() {
    console.log('Selected appointement: ', this.appointmentForm.get('time').value);
    console.log('Appointement Form: ', this.appointmentForm.value);
    if (this.appointmentForm.valid) {
      const response = await this.appointmentService.bookTimeSlot(this.appointmentForm.value);
          console.log('Appointment booked successfully:', response);
          this.appointmentForm.reset();
          this.availableSlots = [];
          if(response.status && response.code == 200) {
            this.bookedSuccess.emit(true);
            // alert('Appointment booked successfully');
          }
        // error: error => {
        //   console.error('Error booking appointment:', error);
        //   alert('Error booking appointment');
        // }
    } else {
      this.validateAllFormFields(this.appointmentForm);
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

  selectSlot(slot: string): void {
    this.selectedSlot = slot;
    this.appointmentForm.controls['time'].setValue(this.convertTo24HourFormat(slot));
  }

  convertTo24HourFormat(time: string): string {
    const [timePart, meridian] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (meridian === 'PM' && hours < 12) {
      hours += 12;
    } else if (meridian === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${this.padZero(hours)}:${this.padZero(minutes)}:00`;
  }

  padZero(number: number): string {
    return number < 10 ? `0${number}` : number.toString(); // ajouter un zéro au début si le chiffre est inférieur à 10
  }

}
