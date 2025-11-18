import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gerenciamento',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './gerenciamento.component.html',
  styleUrls: []
})
export class GerenciamentoComponent implements OnInit {
  usuario: any;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.usuario = this.auth.getCurrentUser();
  }

  logout() {
    this.auth.logout(); // Redireciona e limpa o localStorage
  }
}
