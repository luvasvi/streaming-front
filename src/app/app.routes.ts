import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';
import { RegisterComponent } from './register/register';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: '', 
    component: HomeComponent, 
    canActivate: [() => {
      const router = inject(Router);
      // Mantendo a verificação com 'userAuth' que é a correta
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