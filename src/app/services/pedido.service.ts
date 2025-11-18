import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from './usuario.service';

export interface Pedido {
  id: string;
  codigo: string;
  cliente: string;
  telefoneCliente: string;
  enderecoEntrega: string;
  itens?: string;
  quantidade?: number;
  motorista?: Usuario;
  statusHistorico?: StatusHistorico[];
}

export interface StatusHistorico {
  id?: number;
  status: string;
  dataHora: string;
  icone: string;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly apiUrl = 'http://localhost:8080/pedidos';

  constructor(private readonly http: HttpClient) {}

  listarTodos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  listarPorMotorista(matricula: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/motorista/${matricula}`);
  }

  getPedido(codigo: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${codigo}`);
  }

  atribuirMotorista(codigoPedido: string, idMotorista: string): Observable<Pedido> {
    const body = { motoristaId: idMotorista };
    return this.http.put<Pedido>(`${this.apiUrl}/${codigoPedido}/atribuir-motorista`, body);
  }

  atualizarStatus(codigoPedido: string, status: string): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.apiUrl}/${codigoPedido}/status`, { status });
  }

  removerMotorista(codigoPedido: string): Observable<Pedido> {
    return this.http.delete<Pedido>(`${this.apiUrl}/${codigoPedido}/motorista`);
  }

}