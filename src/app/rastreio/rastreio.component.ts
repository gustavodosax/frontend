import { Component } from '@angular/core';
import { PedidoService } from '../services/pedido.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rastreio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rastreio.component.html',
  styleUrls: ['./rastreio.component.scss']
})

export class RastreioComponent {
  codigo: string = '';
  pedido: any = null;
  erro: string = '';

  constructor(private pedidoService: PedidoService) {}

  buscarPedido() {
    this.erro = '';
    this.pedido = null;
    if (!this.codigo) {
      this.erro = 'Digite o código do pedido.';
      return;
    }
    this.pedidoService.getPedido(this.codigo).subscribe({
      next: (data) => {
        console.log('Pedido encontrado:', data);
        if (data && data.codigo) {
          this.pedido = data;
        } else {
          this.erro = 'Pedido não encontrado.';
        }
      },
      error: (err) => {
        console.error('Erro ao buscar pedido:', err);
        this.erro = 'Pedido não encontrado.';
      }
    });
  }

  getIconPath(icone: string) {
    return `assets/icons/${icone}`;
  }
}