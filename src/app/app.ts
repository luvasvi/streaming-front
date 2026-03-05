import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  componenteAtivo: any;
  menuAberto: boolean = false;

  constructor(private router: Router) {}

  onActivate(componentRef: any) {
    this.componenteAtivo = componentRef;
    console.log('Componente registrado:', this.componenteAtivo);
  }

  // CORREÇÃO: Agora olha para 'userAuth' que é o que o login.ts salva
  isLoggedIn(): boolean {
    return !!localStorage.getItem('userAuth');
  }

  getUserEmail(): string {
    return localStorage.getItem('userEmail') || 'Usuário';
  }

  toggleMenu() {
    this.menuAberto = !this.menuAberto;
  }

  logout() {
    // Limpa tudo (incluindo userAuth e userEmail)
    localStorage.clear(); 
    this.menuAberto = false;
    this.router.navigate(['/login']);
  }

 irParaHome() {
  this.menuAberto = false;
  if (this.componenteAtivo && typeof this.componenteAtivo.voltar === 'function') {
    this.componenteAtivo.voltar();
  }
  
  this.router.navigate(['/']); 
}

  voltarNavegacao() {
    this.menuAberto = false;
    console.log('Tentando voltar no componente:', this.componenteAtivo);

    if (this.componenteAtivo && typeof this.componenteAtivo.voltar === 'function') {
      this.componenteAtivo.voltar();
    } else {
      this.router.navigate(['/']);
    }
  }
}