import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-alterar-senha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alterar-senha.component.html',
  styleUrls: ['./alterar-senha.component.scss']
})
export class AlterarSenhaComponent {
  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';
  mensagem = '';
  erro = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  salvar() {
    this.erro = '';
    this.mensagem = '';
    if (!this.senhaAtual) {
      this.erro = 'Informe a senha atual.';
      return;
    }
    if (!this.novaSenha || this.novaSenha.length < 8) {
      this.erro = 'A nova senha deve ter pelo menos 8 caracteres.';
      return;
    }
    if (this.novaSenha === this.senhaAtual) {
      this.erro = 'A nova senha deve ser diferente da senha atual.';
      return;
    }
    if (this.novaSenha !== this.confirmarSenha) {
      this.erro = 'As senhas não coincidem.';
      return;
    }

    const usuario = this.authService.getCurrentUser();
    if (!usuario) {
      this.erro = 'Sessão expirada. Faça login novamente.';
      this.authService.logout();
      return;
    }

    this.authService.alterarSenha({ senhaAtual: this.senhaAtual, novaSenha: this.novaSenha }).subscribe({
      next: () => {
        this.mensagem = 'Senha alterada com sucesso!';
        setTimeout(() => {
          if (usuario.perfil === 'Motorista') {
            this.router.navigate(['/motorista/pedidos']);
          } else {
            this.router.navigate(['/gerenciamento']);
          }
        }, 1200);
      },
      error: (error) => {
        this.erro = error?.error?.message ?? 'Não foi possível alterar a senha.';
      }
    });
  }
}

