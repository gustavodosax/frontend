import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Pedido, PedidoService, StatusHistorico } from '../services/pedido.service';
import { AuthService, User } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-motorista-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './motorista-pedidos.component.html',
  styleUrls: ['./motorista-pedidos.component.scss']
})
export class MotoristaPedidosComponent implements OnInit {
  usuario: User | null = null;
  pedidos: Pedido[] = [];
  loading = true;
  error = '';
  sucesso = '';
  readonly finais = ['Entregue', 'Pedido Cancelado', 'Pedido Recusado', 'Cliente Ausente'];
  readonly statusOpcoes = [
    'Em Rota',
    'Próximo a você',
    'Entregue',
    'Pedido Recusado',
    'Cliente Ausente'
  ];
  statusSelecionado: Record<string, string | null> = {};

  constructor(
    private readonly pedidoService: PedidoService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getCurrentUser();
    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.usuario.perfil !== 'Motorista') {
      this.router.navigate(['/gerenciamento']);
      return;
    }
    this.carregarPedidos();
  }

  carregarPedidos(): void {
    if (!this.usuario) {
      return;
    }
    this.loading = true;
    this.pedidoService.listarPorMotorista(this.usuario.matricula).subscribe({
      next: (dados) => {
        this.pedidos = dados;
        this.loading = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar seus pedidos.';
        this.loading = false;
      }
    });
  }

  ultimoStatus(pedido: Pedido): string {
    if (!pedido.statusHistorico || pedido.statusHistorico.length === 0) {
      return 'Pedido Realizado';
    }
    const ordenado = [...pedido.statusHistorico].sort((a, b) =>
      new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()
    );
    return ordenado[ordenado.length - 1].status;
  }

  proximosStatus(pedido: Pedido): string[] {
    const atual = this.ultimoStatus(pedido);
    switch (atual) {
      case 'Pedido Realizado':
        return [];
      case 'Em separação':
        return ['Em Rota'];
      case 'Em Rota':
        return ['Próximo a você'];
      case 'Próximo a você':
        return ['Entregue', 'Pedido Recusado', 'Cliente Ausente'];
      default:
        return [];
    }
  }

  atualizarStatus(pedido: Pedido, status: string): void {
    this.sucesso = '';
    this.error = '';
    this.pedidoService.atualizarStatus(pedido.codigo, status).subscribe({
      next: (pedidoAtualizado) => {
        const index = this.pedidos.findIndex((p) => p.codigo === pedidoAtualizado.codigo);
        if (index > -1) {
          this.pedidos[index] = pedidoAtualizado;
        }
        this.sucesso = `Status do pedido ${pedidoAtualizado.codigo} atualizado para "${status}".`;
        this.statusSelecionado[pedido.codigo] = null;
      },
      error: () => {
        this.error = 'Não foi possível atualizar o status. Tente novamente.';
      }
    });
  }

  atualizarStatusManual(pedido: Pedido): void {
    const status = this.statusSelecionado[pedido.codigo];
    if (!status) {
      return;
    }
    this.atualizarStatus(pedido, status);
  }

  ordenarHistorico(historico?: StatusHistorico[]): StatusHistorico[] {
    if (!historico) {
      return [];
    }
    return [...historico].sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
  }
}

