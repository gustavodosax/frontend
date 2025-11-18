import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';

export interface User {
  id?: string;
  nomeCompleto: string;
  matricula: string;
  perfil: string;
  trocarSenhaPrimeiroLogin?: boolean;
  roles?: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface PasswordChangePayload {
  senhaAtual: string;
  novaSenha: string;
}

interface MessageResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/auth';
  private readonly TOKEN_KEY = 'pedidos.accessToken';
  private readonly REFRESH_KEY = 'pedidos.refreshToken';
  private readonly EXP_KEY = 'pedidos.tokenExpiresAt';
  private readonly USER_KEY = 'pedidos.user';

  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    const storedUser = sessionStorage.getItem(this.USER_KEY);
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  login(matricula: string, senha: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { matricula, senha });
  }

  establishSession(response: LoginResponse) {
    const expiresAt = Date.now() + response.expiresIn * 1000;
    sessionStorage.setItem(this.TOKEN_KEY, response.accessToken);
    sessionStorage.setItem(this.REFRESH_KEY, response.refreshToken);
    sessionStorage.setItem(this.EXP_KEY, expiresAt.toString());
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.userSubject.next(response.user);
    
    // Debug: verifica se o token foi armazenado corretamente
    const storedToken = sessionStorage.getItem(this.TOKEN_KEY);
    if (!storedToken) {
      console.error('ERRO: Token não foi armazenado corretamente!');
    } else {
      console.log('Token armazenado com sucesso. Tamanho:', storedToken.length);
    }
  }

  ensureAuthenticated(): Observable<boolean> {
    // Verifica se tem token armazenado (access token ou refresh token)
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    // Se não tem nenhum token, não está autenticado
    if (!accessToken && !refreshToken) {
      return of(false);
    }
    
    // Se tem access token, verifica se ainda é válido
    if (accessToken) {
      // Se o token não expirou (ou está próximo de expirar mas ainda válido), permite acesso
      // O interceptor vai tratar erros 401 e fazer refresh se necessário
      if (!this.isTokenExpired()) {
        return of(true);
      }
      
      // Se expirou mas tem refresh token, tenta fazer refresh
      if (refreshToken) {
        return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
          tap(response => this.establishSession(response)),
          map(() => true),
          catchError(() => {
            // Se o refresh falhar, retorna false mas não faz logout
            // O interceptor vai tratar o erro 401 nas requisições
            return of(false);
          })
        );
      }
    }
    
    // Se só tem refresh token (sem access token), tenta fazer refresh
    if (refreshToken && !accessToken) {
      return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
        tap(response => this.establishSession(response)),
        map(() => true),
        catchError(() => {
          return of(false);
        })
      );
    }
    
    // Caso contrário, não permite
    return of(false);
  }

  alterarSenha(payload: PasswordChangePayload) {
    return this.http.put<MessageResponse>(`${this.apiUrl}/password`, payload).pipe(
      tap(() => this.updateCurrentUser({ trocarSenhaPrimeiroLogin: false }))
    );
  }

  isLoggedIn(): boolean {
    // Verifica se tem pelo menos um token armazenado
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    if (!accessToken && !refreshToken) {
      return false;
    }
    
    // Se tem access token, verifica se não expirou
    if (accessToken) {
      return !this.isTokenExpired();
    }
    
    // Se só tem refresh token, considera logado (vai fazer refresh quando necessário)
    return !!refreshToken;
  }

  getCurrentUser() {
    return this.userSubject.value;
  }

  updateCurrentUser(partial: Partial<User>) {
    const current = this.userSubject.value;
    if (!current) return;
    const updated = { ...current, ...partial };
    this.userSubject.next(updated);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(updated));
  }

  getAccessToken() {
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    // Debug: verifica se o token está sendo recuperado
    if (!token) {
      console.warn('getAccessToken - Token não encontrado no sessionStorage. Chave:', this.TOKEN_KEY);
      // Verifica se há outras chaves no sessionStorage
      const allKeys = Object.keys(sessionStorage);
      console.log('Chaves disponíveis no sessionStorage:', allKeys);
    }
    return token;
  }

  getRefreshToken() {
    return sessionStorage.getItem(this.REFRESH_KEY);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token não encontrado'));
    }
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { refreshToken });
  }

  private isTokenExpired(): boolean {
    const expiresAt = sessionStorage.getItem(this.EXP_KEY);
    if (!expiresAt) {
      return true;
    }
    return Date.now() >= Number(expiresAt);
  }

  logout() {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_KEY);
    sessionStorage.removeItem(this.EXP_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
