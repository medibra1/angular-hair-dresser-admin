import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api/api.service';
import { BehaviorSubject, firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private api = inject(ApiService);

  private categories$ = new BehaviorSubject<any[]>([]);
  get categories() {
    return this.categories$.asObservable();
  }

  constructor() { }


    async getCategories(): Promise<any> {
      try {
        if(this.categories$.getValue().length <= 0) {
        const data: any = await lastValueFrom(this.api.get('categories'));
        console.log('Categories: ', data);
        this.categories$.next(data);
      }
      } catch (error) {
        console.log(error);
      }
    }


  async createCategory(data: FormData) {
    try {
      let categoryData = await firstValueFrom(this.api.post(`categories`, data, true));
      if(categoryData) {
        let currentdata = [];
        currentdata.push(categoryData);
        currentdata = currentdata.concat(this.categories$.value);
        this.categories$.next(currentdata);
      }
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }

  async updateCategory(id: number, data: FormData) {
    try {
      data.append('_method', 'PUT');
      let categoryData = await firstValueFrom(this.api.post(`categories/${id}`, data, true));
      if(categoryData) {
        let currentdata = [];
        currentdata.push(categoryData);
        const index = currentdata.findIndex(c => c.id == id);
        if (index !== -1) {
          const categoriesList = this.categories$.value.filter(p => p.id != id);
          currentdata = currentdata.concat(categoriesList);
          this.categories$.next(currentdata);
        }
      }
      // return serviceData;
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }

  async deleteCategory(id: number) {
    try {
      const data = await firstValueFrom(this.api.delete(`categories/${id}`));
      let currentData = this.categories$.value.slice(); // Make a copy of the current services
      currentData = currentData.filter(c => c.id !== id);
      this.categories$.next(currentData);
      // return serviceData;
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }



}
