import { inject } from '@angular/core';
import { GlobalService } from '../global/global.service';
import { HttpEvent, HttpHandler, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';


  let totalRequests = 0;

  
  export const LoadingInterceptor = (request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    console.log('caught')
    totalRequests++;
    const global = inject(GlobalService);
    global.setLoading(true);
    return next(request).pipe(
      finalize(() => {
        totalRequests--;
        if (totalRequests == 0) {
          global.setLoading(false);
        }
      }),
      catchError((error) => {
        // Log the error or handle it accordingly
        console.error('HTTP Error:', error);
        global.setLoading(false);  // Set the loader to false in case of an error
        throw error;  // Rethrow the error so other interceptors or services can catch it
      }),
    );
  }


