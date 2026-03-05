import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // 1. Adicionado RouterModule aqui
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule], // 2. RouterModule adicionado nos imports
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  password = '';
  erroMensagem = ''; 

  constructor(private router: Router, private http: HttpClient) {}

  onLogin() {
    this.erroMensagem = ''; 
    
    const cleanUsername = this.username.trim();
    const cleanPassword = this.password.trim();

    const authValue = 'Basic ' + btoa(cleanUsername + ':' + cleanPassword);
    
    console.log("Tentando autenticação para:", cleanUsername);

    this.http.get<any>('http://localhost:8080/favorites', {
      headers: { 'Authorization': authValue }
    }).subscribe({
      next: (res) => {
        console.log("Login realizado com sucesso no Back-end!");
        
        localStorage.setItem('userAuth', authValue);
        localStorage.setItem('userEmail', cleanUsername);
        
        this.router.navigate(['/']).then(nav => {
          if (nav) {
            console.log("Navegação para a Home concluída.");
          } else {
            console.error("Falha na navegação. Verifique suas rotas no app.routes.ts!");
          }
        });
      },
      error: (err) => {
        console.error("Erro no login:", err);
        this.erroMensagem = 'Usuário ou senha inválidos no servidor.';
        this.password = ''; 
      }
    });
  }
}