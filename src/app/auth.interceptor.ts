import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  const authValue = localStorage.getItem('userAuth'); 

  const isApiRequest = req.url.includes('localhost:8080');
  
  const isAuthRoute = req.url.includes('/login');

  if (authValue && isApiRequest && !isAuthRoute) {
    const cloned = req.clone({
      setHeaders: {
        'Authorization': authValue 
      }
    });
    return next(cloned);
  }

  return next(req);
};