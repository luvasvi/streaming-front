  import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
  import { provideRouter } from '@angular/router';
  import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Verifique se esta linha está exatamente assim
  import { routes } from './app.routes';
  import { authInterceptor } from './auth.interceptor';

  export const appConfig: ApplicationConfig = {
    providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),                                
      provideHttpClient(withInterceptors([authInterceptor])) 
    ]
  };