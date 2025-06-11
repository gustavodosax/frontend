import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private apiUrl = 'http://localhost:8080/pedido';

  constructor(private http: HttpClient) {}

  getPedido(codigo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${codigo}`);
  }
}