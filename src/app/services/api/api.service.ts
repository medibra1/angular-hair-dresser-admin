import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

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

  put(url: string, data: any, formData = false) {
    let headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    if (!formData) {
      headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
      data = new HttpParams({ fromObject: data });
    } else {
      // No need to set Content-Type header for FormData, browser does it automatically
    }

    const options = { headers };
    return this.http.put<any>(`${environment.serverBaseUrl}${url}`, data, options);
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
    const options = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
    };
    if(!formData) {
      data = new HttpParams({fromObject: data})
   }
    return this.http.patch<any>(environment.serverBaseUrl + url, data);
  }

  delete(url: any) {
    return this.http.delete<any>(environment.serverBaseUrl + url);
  }
}
