import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoadingInterceptor } from './services/global/loading-interceptor.service';
import { TokenInterceptor } from './services/global/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        LoadingInterceptor, 
        TokenInterceptor
      ])
    ),
  ]
};
