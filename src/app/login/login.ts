import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
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
    
    const loginData = {
      username: this.username.trim(),
      password: this.password.trim()
    };

    console.log("Iniciando Login Bearer para:", loginData.username);

    this.http.post<any>('http://localhost:8080/login', loginData).subscribe({
      next: (res) => {
        console.log("Token JWT recebido com sucesso!");
        
        localStorage.setItem('userAuth', res.token); 
        localStorage.setItem('userEmail', res.username);
        
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error("Erro na autenticação:", err);
        this.erroMensagem = 'E-mail ou senha incorretos.';
        this.password = ''; 
      }
    });
  }
  ngOnInit() {
    localStorage.clear();
  }
}