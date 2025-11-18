import { Component, OnInit } from '@angular/core';
import { PedidoService, Pedido } from '../services/pedido.service';
import { UsuarioService, Usuario } from '../services/usuario.service';
import { AuthService, User } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-gerenciamento-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gerenciamento-pedidos.component.html',
  styleUrls: ['./gerenciamento-pedidos.component.scss']
})
export class GerenciamentoPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  motoristas: Usuario[] = [];
  usuario: User | null = null;

  pedidoSelecionado: Pedido | null = null;
  motoristaSelecionadoId: string | null = null;
  mostrarModal = false;
  successMessage = '';
  filtroTermo = '';
  statusSelecionadoAdmin: Record<string, string | null> = {};
  readonly statusBloqueiaAtribuicao = ['Entregue', 'Pedido Cancelado'];
  readonly statusResetaveis = ['Pedido Recusado', 'Cliente Ausente'];
  readonly statusOpcoesAdmin = [
    'Pedido Realizado',
    'Em separação',
    'Em Rota',
    'Próximo a você',
    'Entregue',
    'Pedido Cancelado',
    'Pedido Recusado',
    'Cliente Ausente'
  ];

  constructor(
    private readonly pedidoService: PedidoService,
    private readonly usuarioService: UsuarioService,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getCurrentUser();
    this.carregarPedidos();
    this.carregarMotoristas();
  }

  carregarPedidos() {
    this.pedidoService.listarTodos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.aplicarFiltro();
      },
      error: (error) => {
        console.error('Erro ao carregar pedidos:', error);
        this.pedidos = [];
        this.pedidosFiltrados = [];
      }
    });
  }

  carregarMotoristas() {
    this.usuarioService.listarMotoristas().subscribe({
      next: (data) => {
        this.motoristas = data;
      },
      error: (error) => {
        console.error('Erro ao carregar motoristas:', error);
        this.motoristas = [];
      }
    });
  }

  aplicarFiltro() {
    const termo = this.filtroTermo.trim().toLowerCase();
    if (!termo) {
      this.pedidosFiltrados = [...this.pedidos];
      return;
    }
    this.pedidosFiltrados = this.pedidos.filter(p =>
      p.codigo?.toLowerCase().includes(termo) ||
      p.cliente?.toLowerCase().includes(termo)
    );
  }

  abrirModal(pedido: Pedido) {
    this.pedidoSelecionado = { ...pedido };
    this.motoristaSelecionadoId = pedido.motorista?.id || null;
    this.mostrarModal = true;
  }

  fecharModal() {
    this.mostrarModal = false;
    this.pedidoSelecionado = null;
    this.motoristaSelecionadoId = null;
  }

  salvarAtribuicao() {
    if (this.pedidoSelecionado && this.motoristaSelecionadoId) {
      this.pedidoService.atribuirMotorista(this.pedidoSelecionado.codigo, this.motoristaSelecionadoId)
        .subscribe(pedidoAtualizado => {
          const index = this.pedidos.findIndex(p =>
            (pedidoAtualizado.id && p.id === pedidoAtualizado.id) || p.codigo === pedidoAtualizado.codigo
          );
          if (index !== -1) {
            this.pedidos[index] = pedidoAtualizado;
            this.aplicarFiltro();
          }
          this.successMessage = `Motorista atribuído ao pedido ${pedidoAtualizado.codigo} com sucesso!`;
          setTimeout(() => this.successMessage = '', 3000);
          this.fecharModal();
        });
    }
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

  podeRemover(pedido: Pedido): boolean {
    return !!pedido.motorista && this.ultimoStatus(pedido) === 'Pedido Realizado';
  }

  removerMotorista(pedido: Pedido) {
    if (!confirm(`Remover o motorista do pedido ${pedido.codigo}?`)) {
      return;
    }
    this.pedidoService.removerMotorista(pedido.codigo).subscribe({
      next: (pedidoAtualizado) => {
        const index = this.pedidos.findIndex(p => p.codigo === pedidoAtualizado.codigo);
        if (index !== -1) {
          this.pedidos[index] = pedidoAtualizado;
          this.aplicarFiltro();
        }
      },
      error: () => {
        alert('Não foi possível remover a atribuição. Verifique se o motorista já iniciou o status.');
      }
    });
  }

  podeAtribuir(pedido: Pedido): boolean {
    const status = this.ultimoStatus(pedido);
    return !this.statusBloqueiaAtribuicao.includes(status);
  }

  podeResetar(pedido: Pedido): boolean {
    return this.statusResetaveis.includes(this.ultimoStatus(pedido));
  }

  resetarStatus(pedido: Pedido) {
    if (!confirm(`Resetar o status do pedido ${pedido.codigo} para "Pedido Realizado"?`)) {
      return;
    }
    this.pedidoService.atualizarStatus(pedido.codigo, 'Pedido Realizado').subscribe({
      next: (pedidoAtualizado) => {
        const index = this.pedidos.findIndex(p => p.codigo === pedidoAtualizado.codigo);
        if (index !== -1) {
          this.pedidos[index] = pedidoAtualizado;
          this.aplicarFiltro();
        }
        this.successMessage = `Status do pedido ${pedido.codigo} resetado para "Pedido Realizado".`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => alert('Não foi possível resetar o status.'),
    });
  }

  atualizarStatusAdmin(pedido: Pedido) {
    const status = this.statusSelecionadoAdmin[pedido.codigo];
    if (!status) {
      return;
    }
    this.pedidoService.atualizarStatus(pedido.codigo, status).subscribe({
      next: (pedidoAtualizado) => {
        const index = this.pedidos.findIndex(p => p.codigo === pedidoAtualizado.codigo);
        if (index !== -1) {
          this.pedidos[index] = pedidoAtualizado;
          this.aplicarFiltro();
        }
        this.statusSelecionadoAdmin[pedido.codigo] = null;
        this.successMessage = `Status do pedido ${pedido.codigo} atualizado para "${status}".`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => alert('Não foi possível atualizar o status.'),
    });
  }
}