import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom, lastValueFrom } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  
  private appointmentsSubject: BehaviorSubject<any> = new BehaviorSubject<any>({});
  get appointments$() {return this.appointmentsSubject.asObservable();}
  
  private api = inject(ApiService);

  constructor() { }

    /**************** APPOINTMENT ****************/
    async loadAppointments() {
      try {
        const data = await lastValueFrom(this.api.get('appointments'));
        console.log('++++ Apointments list +++++: ', data);
        this.appointmentsSubject.next(data);
      } catch (error) {
        console.log(error);
        throw(error);
      }
    }
  
    async changeAppointmentStatus(id: number, status: number) {
      try {
        const data = await firstValueFrom(this.api.patch(`appointments/${id}/${status}`, null));
        // this.appointmentsSubject.value.map( d=> {if(d.id == id) d.status = status;});       
        this.appointmentsSubject.next(
          this.appointmentsSubject.value.map(d => {
            if (d.id === id) {
              return { ...d, status };
            }
            return d;
          })
        );                
        console.log('Appointment status changed: ', data);
      } catch (error) {
        console.log(error);
        throw(error);
      }
    }
  
    async deleteAppointment(id: number) {
      try {
          const data = await firstValueFrom(this.api.delete(`appointments/${id}`));
          let currentData = this.appointmentsSubject.value.slice(); // Make a copy of the current appointment
          currentData = currentData.filter(d => d.id !== id);
          this.appointmentsSubject.next(currentData);
      } catch (error) {
        console.log(error);
        throw(error);
      }
    }
    /**************** APPOINTMENT ****************/

  getAvailableSlots(date, start_time, end_time, intervalMinutes): Observable<string[]> {
    const params = new HttpParams()
      .set('date', date)
      .set('start_time', start_time)
      .set('end_time', end_time)
      .set('interval_minute', intervalMinutes.toString());
    return this.api.get('available-slots', params);
  }

  async bookTimeSlot(appointmentData: any) {
    try {
      appointmentData.type = 2; // send by admin
      const data: any = await lastValueFrom(this.api.post('book-time-slot', appointmentData));
      if(data.status && data.code == 200) {
        console.log('Appointment service: ', data);
        let currentData = [];
        currentData.push(data.result);
        currentData = currentData.concat(this.appointmentsSubject.value);
        this.appointmentsSubject.next(currentData);
      }
      return data;
    } catch (e) {
      console.log('Booking error: ', e);
      throw(e);
    }
  }

}
