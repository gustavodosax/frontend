import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    // Verifica se tem token armazenado primeiro (mais rápido)
    const accessToken = this.auth.getAccessToken();
    const refreshToken = this.auth.getRefreshToken();
    const hasToken = !!accessToken || !!refreshToken;
    
    // Debug: log para verificar o que está acontecendo
    console.log('AuthGuard - Verificando autenticação:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0
    });
    
    if (!hasToken) {
      console.warn('AuthGuard - Sem token, redirecionando para login');
      return of(this.router.createUrlTree(['/login']));
    }
    
    // Se tem token, permite acesso
    // O interceptor vai tratar erros 401 e fazer refresh se necessário
    // Se o token estiver inválido, o interceptor vai fazer logout
    console.log('AuthGuard - Token encontrado, permitindo acesso');
    return of(true);
  }
}