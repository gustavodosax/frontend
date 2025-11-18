import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Veiculo {
  id?: string;
  placa: string;
  modelo: string;
  cor: string;
}

@Injectable({ providedIn: 'root' })
export class VeiculoService {
  private apiUrl = 'http://localhost:8080/veiculos';

  constructor(private http: HttpClient) {}

  criar(veiculo: Veiculo): Observable<any> {
    return this.http.post(this.apiUrl, veiculo);
  }

  // Você pode adicionar outros métodos aqui, como listar, atualizar, remover, se necessário.
  listar(): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(this.apiUrl);
  }

   // Novo método para atualizar um veículo
   atualizar(id: string, veiculo: Veiculo): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, veiculo);
  }

  // Novo método para remover um veículo
  remover(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
}