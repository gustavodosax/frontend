import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-gerenciamento',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './gerenciamento.component.html',
  styleUrls: []
})
export class GerenciamentoComponent {
  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout(); // Redireciona e limpa o localStorage
  }
}
