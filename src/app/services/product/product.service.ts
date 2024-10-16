import { Injectable, inject } from '@angular/core';
import { IProduct } from '../../models/product';
import { BehaviorSubject, firstValueFrom, lastValueFrom } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private products$ = new BehaviorSubject<IProduct[]>([]);
  get products() {
    return this.products$.asObservable();
  }

  private api = inject(ApiService);
  // private global = inject(GlobalService);
  // private http = inject(HttpClient);
  private readonly products_api_url = 'api/products';
  
  constructor() { 
  }

  // getProducts(): Observable<IProduct[]> {
  //   console.log(this.products_api_url);
  //   return this.api.get(this.products_api_url);
  // }

  async getProducts(): Promise<any> {
    try {
      if(this.products$.getValue().length <= 0) {
      const data: IProduct[] = await lastValueFrom(this.api.get('products'));
      console.log('Products from product service: ', data);
      data.map((p) => {
        p.images.map((img, key) => {
          p.images[key] = img ? this.downloadImage('products', img) : '';
        });
      });
      console.log('products: ',  this.products$.getValue());
      this.products$.next(data);
    }
    } catch (error) {
      console.log(error);
    }
  }

  async createProduct(data: FormData) {
    try {
      let productData = await firstValueFrom(this.api.post(`products`, data, true));
      if(productData) {
        // productData.result.image = this.downloadImage('products', serviceData.result.image);
        productData.images.map((img, key) => {
          productData.images[key] = img ? this.downloadImage('products', img) : '';
        });
        console.log('Stored Product: ', productData);
        let currentProducts = [];
        currentProducts.push(productData);
        currentProducts = currentProducts.concat(this.products$.value);
        this.products$.next(currentProducts);
      }
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }

  async updateProduct(id: number, data: FormData) {
    try {
      data.append('_method', 'PUT');
      let productData = await firstValueFrom(this.api.post(`products/${id}`, data, true));
      if(productData) {
        productData.images.map((img, key) => {
          productData.images[key] = img ? this.downloadImage('products', img) : '';
        });
        let currentProducts = [];
        currentProducts.push(productData);
        const index = currentProducts.findIndex(product => product.id == id);
        if (index !== -1) {
          const productList = this.products$.value.filter(p => p.id != id);
          currentProducts = currentProducts.concat(productList);
          this.products$.next(currentProducts);
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

  async deleteProduct(id: number) {
    try {
      const productData = await firstValueFrom(this.api.delete(`products/${id}`));
      let currentProducts = this.products$.value.slice(); // Make a copy of the current services
      currentProducts = currentProducts.filter(service => service.id !== id);
      this.products$.next(currentProducts);
      // return serviceData;
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }

  async getProductById(slug) {
    try {
      // const data = await firstValueFrom(this.api.get(`${this.products_api_url}/${1}`));
      const data: any = await firstValueFrom(this.api.get('products/' + slug));
      // if (data.images && data.images.length > 0) {
      data.images.map((img, key) => {
        data.images[key] = this.downloadImage('products', img)
        console.log('product by slug: ', data);
        });
      // }
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  /******************** Tags, Colors... **********************/
  async getTagsColors() {
    try {
    const data = await lastValueFrom(this.api.get('colors-tags'));
    console.log('colors, Tags: ', data);
    return data;
    } catch (error) {
      console.log(error);
    }
  }
  /******************** Tags, Colors... **********************/

  downloadImage(imageDirectory: string,imageName: string) {
    const data =  this.api.downloadImage(imageDirectory, imageName);
    console.log('Image URL: ', data);
    return data;
 }
  
}
