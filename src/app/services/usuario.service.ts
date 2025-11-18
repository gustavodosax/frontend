import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Usuario {
  id?: string;
  nomeCompleto: string;
  matricula: string;
  perfil: string;
  senha?: string;
  trocarSenhaPrimeiroLogin?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly apiUrl = 'http://localhost:8080/usuarios';

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  listarMotoristas(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/motoristas`);
  }

  criar(usuario: Usuario): Observable<any> {
    // Remove o id antes de enviar, pois o backend espera UsuarioRequest sem id
    const { id, ...usuarioRequest } = usuario;
    return this.http.post(this.apiUrl, usuarioRequest);
  }

  atualizar(id: string, usuario: Usuario): Observable<any> {
    // Remove o id do payload, pois ele já está na URL
    const { id: _, ...usuarioRequest } = usuario;
    return this.http.put(`${this.apiUrl}/${id}`, usuarioRequest);
  }

  remover(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

} 