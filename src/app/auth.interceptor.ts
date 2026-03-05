import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Buscamos a credencial salva no localStorage
  const authValue = localStorage.getItem('userAuth'); 

  // 2. Verificamos se a requisição é para o nosso Back-end
  const isApiRequest = req.url.includes('localhost:8080');

  // 3. REGRA DE SEGURANÇA: Se houver um token e for uma requisição para a API, 
  // nós injetamos o cabeçalho. Caso contrário, deixamos passar original.
  if (authValue && isApiRequest) {
    const cloned = req.clone({
      setHeaders: {
        'Authorization': authValue
      }
    });
    return next(cloned);
  }

  // Se não houver token (como na primeira vez que você clica em "Entrar"), 
  // o Angular usa os headers que você definiu manualmente no LoginComponent
  return next(req);
};