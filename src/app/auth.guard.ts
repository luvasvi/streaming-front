import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('userAuth');

  // Regra 1: Se o usuário tenta ir para o LOGIN mas JÁ TEM TOKEN
  if (state.url === '/login' && token) {
    router.navigate(['/']); // Manda para a Home
    return false;
  }

  // Regra 2: Se o usuário tenta ir para a HOME (ou outra rota) mas NÃO TEM TOKEN
  if (state.url !== '/login' && !token) {
    router.navigate(['/login']); // Manda para o Login
    return false;
  }

  return true; // Deixa passar
};