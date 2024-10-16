import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsSettingsService {

  private api = inject(ApiService);

  private settingsSubject: BehaviorSubject<any> = new BehaviorSubject<any>({});
  get settings$() {return this.settingsSubject.asObservable();}

  constructor() { }


  async loadSettings() {
    try {
      const data = await firstValueFrom(this.api.get('appointment-settings'));
      console.log('++++ appointment settings +++++: ', data);
      this.settingsSubject.next(data);
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }

  async createSettings(formData: FormData) {
    try {
      let data: any = await firstValueFrom(this.api.post('appointment-settings', formData, true));
      return data;
    } catch (e) {
      throw(e);
    }
  }

  async updateSettings(id, formData: FormData) {
    try {
      formData.append('_method', 'PUT');
      let data: any = await firstValueFrom(this.api.post(`appointment-settings/${id}`, formData, true));
      return data;
    } catch (e) {
      throw(e);
    }
  }

}
