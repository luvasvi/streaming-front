import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';
import { RegisterComponent } from './register/register';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

// Função auxiliar para evitar repetição de código (Clean Code)
const redirectIfLogged = () => {
  const router = inject(Router);
  const isLogged = !!localStorage.getItem('userAuth');
  if (isLogged) {
    console.log("Usuário já autenticado: Redirecionando para a Home.");
    return router.parseUrl(''); 
  }
  return true;
};

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [redirectIfLogged] 
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [redirectIfLogged]
  },
  { 
    path: '', 
    component: HomeComponent, 
    canActivate: [() => {
      const router = inject(Router);
      const isAuthenticated = !!localStorage.getItem('userAuth'); 
      
      if (!isAuthenticated) {
        console.log("Acesso negado: Redirecionando para o login.");
        return router.parseUrl('/login');
      }
      return true;
    }] 
  },
  { path: '**', redirectTo: '' }
];