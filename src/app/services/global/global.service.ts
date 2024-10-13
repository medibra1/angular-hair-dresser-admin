import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ISetting } from '../../models/setting';
import { BehaviorSubject, Observable, firstValueFrom, lastValueFrom } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private api = inject(ApiService);
  private loading: boolean = false;

  private settingsSubject: BehaviorSubject<any> = new BehaviorSubject<any>({});
  get settings$() {return this.settingsSubject.asObservable();}

  private servicesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  get services$() {return this.servicesSubject.asObservable();}
  // public services$: Observable<any[]> = this.servicesSubject.asObservable();
  
  constructor() {
    // this.loadServices();
    // this.loadAppointments();
    console.log('********** GLOBAL CONSTRUC **************');
   }


  async loadSettings() {
    try {
      const data = await firstValueFrom(this.api.get('settings'));
      const setting = {...data.result, logo: this.downloadImage('image-container', data.result.logo)}
      console.log('++++ Site settings +++++: ', setting);
      this.settingsSubject.next(setting);
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }
  
  // updateSettings(settings): Observable<ISetting> {
  //   return this.api.post('settings', settings);
  // }
  async createSettings(formData: FormData) {
    try {
      let data: any = await firstValueFrom(this.api.post('settings', formData, true));
      data = {...data.result, logo: this.downloadImage('image-container', data.result.logo)}
      return data;
    } catch (e) {
      throw(e);
    }
  }

  async updateSettings(id, formData: FormData) {
    try {
      formData.append('_method', 'PUT');
      let data: any = await firstValueFrom(this.api.post(`settings/${id}`, formData, true));
      data = {...data.result, logo: this.downloadImage('image-container', data.result.logo)}
      return data;
    } catch (e) {
      throw(e);
    }
  }



  /**************** LOADING INTERCEPTOR ****************/
  setLoading(loading: boolean) {
    this.loading = loading;
  }
  getLoading(): boolean {
    return this.loading;
  }
  /**************** LOADING INTERCEPTOR ****************/

  /**************** SERVICES ****************/
  // getServices(): Observable<any[]> {
  //   return this.services$;
  // }

    async getServices() {
      try {
        const data = await firstValueFrom(this.api.get('services'));
        console.log('-- Load services --- : ', data);
        data.map(service => {
          service.image = service.image ? this.downloadImage('services', service.image): '';
          return service;
        });
        this.servicesSubject.next(data);
        return this.services$;
      } catch (error) {
        console.log(error);
        return null;
      }
    }

  async createService(data: FormData) {
    try {
      let serviceData = await firstValueFrom(this.api.post(`services`, data, true));
      if(serviceData.status) {
        serviceData.result.image = this.downloadImage('services', serviceData.result.image);
        let currentServices = [];
        currentServices.push(serviceData.result);
        currentServices = currentServices.concat(this.servicesSubject.value);
        this.servicesSubject.next(currentServices);
        // let currentServices = this.servicesSubject.value.slice(); // Make a copy of the current services
        // currentServices.push(serviceData.result);
        // this.servicesSubject.next(currentServices);
      }
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }

  async updateService(id: number, data: FormData) {
    try {
      data.append('_method', 'PUT');
      let serviceData = await firstValueFrom(this.api.post(`services/${id}`, data, true));
      if(serviceData.status) {
        serviceData.result.image = this.downloadImage('services', serviceData.result.image);
        let currentServices = [];
        currentServices.push(serviceData.result);
        const index = currentServices.findIndex(service => service.id === id);
        if (index !== -1) {
          const serviceList = this.servicesSubject.value.filter(service => service.id !== id);
          currentServices = currentServices.concat(serviceList);
          this.servicesSubject.next(currentServices);
        }
        // const currentServices = this.servicesSubject.value.slice();
        // const index = currentServices.findIndex(service => service.id === id);
        // if (index !== -1) {
        //   currentServices[index] = serviceData.result;
        //   this.servicesSubject.next(currentServices);
        // }
      }
      // return serviceData;
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }

  async deleteServices(id: number) {
    try {
        const serviceData = await firstValueFrom(this.api.delete(`services/${id}`));
        let currentServices = this.servicesSubject.value.slice(); // Make a copy of the current services
        currentServices = currentServices.filter(service => service.id !== id);
        this.servicesSubject.next(currentServices);
        // return serviceData;
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }
  /**************** SERVICES ****************/

  downloadImage(imageDirectory: string,imageName: string) {
    const data =  this.api.downloadImage(imageDirectory, imageName);
    console.log('Image URL: ', data);
    return data;
 }

}
