import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['../app.css']
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  
  // Variáveis para o Toast interno
  toastMensagem: string = '';
  toastTipo: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  exibirToast(mensagem: string, tipo: string) {
    this.toastMensagem = mensagem;
    this.toastTipo = tipo;
    setTimeout(() => { this.toastMensagem = ''; }, 3000); // Some após 3 segundos
  }

  onRegister() {
    if (!this.email || !this.password) {
      this.exibirToast('Preencha todos os campos!', 'error');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.exibirToast('As senhas não coincidem!', 'error');
      return;
    }

    const payload = { email: this.email, password: this.password };

    this.http.post('http://localhost:8080/login/register', payload).subscribe({
      next: () => {
        this.exibirToast('Conta criada com sucesso!', 'success');
        setTimeout(() => { this.router.navigate(['/login']); }, 1500);
      },
      error: (err) => {
        // Agora o erro de e-mail existente aparece no Toast do site
        this.exibirToast('Erro ao cadastrar. Verifique se o e-mail já existe.', 'error');
      }
    });
  }
}