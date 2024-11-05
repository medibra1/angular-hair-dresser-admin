import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private http = inject(HttpClient);

  constructor() { 
    // console.log(environment.production); // Logs false for development environment
    console.log(environment.serverBaseUrl); 
  }

  // get(url: string, data?: any) {
  //   return this.http.get<any>(environment.serverBaseUrl + url, {params: data});
  // }

  downloadImage(directory, imageName) {
    return environment.serverBaseUrl + 'images/' + directory + '/' + imageName;
  }

  get(url: string, data?: any) {
    return this.http.get<any>(environment.serverBaseUrl + url, {params: data});
  }

  post(url: string, data: any, formData = false) {
    if(!formData) {
       data = new HttpParams({fromObject: data})
    }
    return this.http.post<any>(environment.serverBaseUrl + url, data);
  }

  put(url, data, formData = false) {
    if(!formData) {
      data = new HttpParams({
        fromObject: data
      });
    }
    return this.http.put<any>(environment.serverBaseUrl + url, data);
  }

  // put(url: string, data: any, formData = false) {
  //   let headers = new HttpHeaders({
  //     'Accept': 'application/json'
  //   });
  //   if (!formData) {
  //     headers = headers.set('Content-Type', 'multipart/form-data');
  //     data = new HttpParams({ fromObject: data });
  //   }
  //   const options = { headers };
  //   return this.http.put<any>(`${environment.serverBaseUrl}${url}`, data, options);
  // }

  patch(url: string, data: any, formData = false) {
    if(!formData) {
      data = new HttpParams({fromObject: data})
   }
    return this.http.patch<any>(environment.serverBaseUrl + url, data);
  }

  delete(url: any, data?: any) {
    // const options = {
    //   body: data, // envoie `data` dans le corps de la requête si défini
    // };
    // return this.http.delete<any>(environment.serverBaseUrl + url, options);
    const params = data ? new HttpParams({ fromObject: data }) : undefined;
    return this.http.delete<any>(environment.serverBaseUrl + url, { params });
  }
}
