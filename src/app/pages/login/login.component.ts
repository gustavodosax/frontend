import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
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

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.erro = '';
    this.auth.login(this.matricula, this.senha).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.auth.setLoggedIn(true);
          this.router.navigate(['/gerenciamento']);
        } else {
          this.erro = resp.message;
        }
      },
      error: () => this.erro = 'Erro ao conectar ao servidor'
    });
  }
}