import { inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, throwError,BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

import { environment } from '../../../environments/environment';

export const TokenInterceptor = (request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    
    const auth = inject(AuthService);
    const token = auth.getToken();
    const isApiUrl = request.url.startsWith(environment.serverBaseUrl);
    
    if (token && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('Interceptor error: ', error);
        if (error instanceof HttpErrorResponse && error.status === 401) { // Si le token est invalide ou expiré
            console.log('le token est invalide ou expiré');
            auth.logoutUser(error?.error.message || 'Wrong or not Token');
        } else if(error instanceof HttpErrorResponse && error.status === 403) {
          auth.logoutUser(error?.error.messageerror?.error.message || 'Wrong or no Token');
        } 
        return throwError( () => error);
      })
    );

  }