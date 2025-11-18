import { Component } from '@angular/core';
import { AuthService, LoginResponse, User } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  matricula = '';
  senha = '';
  erro = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  login() {
    this.erro = '';
    this.auth.login(this.matricula, this.senha).subscribe({
      next: (resp: LoginResponse) => {
        console.log('Login bem-sucedido, estabelecendo sessão...');
        this.auth.establishSession(resp);
        
        // Verifica se o token foi armazenado antes de navegar
        const token = this.auth.getAccessToken();
        if (!token) {
          console.error('ERRO: Token não foi armazenado após establishSession!');
          this.erro = 'Erro ao armazenar token de autenticação.';
          return;
        }
        
        console.log('Token verificado, navegando...');
        const user: User = resp.user;
        
        // Usa setTimeout para garantir que o sessionStorage foi atualizado
        setTimeout(() => {
          if (user.trocarSenhaPrimeiroLogin) {
            this.router.navigate(['/alterar-senha']);
            return;
          }
          if (user.perfil === 'Motorista') {
            this.router.navigate(['/motorista/pedidos']);
          } else {
            this.router.navigate(['/gerenciamento']);
          }
        }, 100);
      },
      error: (error) => {
        console.error('Erro no login:', error);
        this.erro = error?.error?.message ?? 'Usuário ou senha inválidos.';
      }
    });
  }
}