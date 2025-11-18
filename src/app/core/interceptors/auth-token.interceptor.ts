import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router'; // ✅ ADICIONADO

let isRefreshing = false;

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router); // ✅ ADICIONADO
  const token = authService.getAccessToken();

  const bypassAuthHeader = ['/auth/login', '/auth/refresh', '/auth/dev/reset-password'];
  const shouldBypass = bypassAuthHeader.some(path => req.url.includes(path));

  // 🔹 helper para tratar fim de sessão
  const handleAuthError = () => {
    console.warn('[Interceptor] Sessão inválida. Fazendo logout e redirecionando...');
    authService.logout(); // usa teu método, que limpa sessionStorage e navega pro /login
  };

  // Adiciona o token se existir e não for uma rota de bypass
  let requestToSend = req;
  if (token && !shouldBypass) {
    requestToSend = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(`[Interceptor] Token adicionado à requisição: ${req.url.substring(0, 50)}...`);
  } else if (!shouldBypass && !token) {
    console.warn(`[Interceptor] Requisição sem token: ${req.url}`);
    const refreshToken = authService.getRefreshToken();
    if (refreshToken) {
      console.log('[Interceptor] Refresh token disponível, mas access token não encontrado');
    }
  }

  return next(requestToSend).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log(`[Interceptor] Erro na requisição ${req.url}:`, error.status, error.statusText);

      // Se for 401 numa rota protegida
      if ((error.status === 401 || error.status === 403) && !shouldBypass) {
        const refreshToken = authService.getRefreshToken();

        // 🔸 Se não tem refreshToken ou já está em refresh → encerra sessão
        if (!refreshToken || isRefreshing) {
          console.warn('[Interceptor] 401 sem refresh token válido. Logout imediato.');
          handleAuthError();
          return throwError(() => error);
        }

        if (!isRefreshing) {
          console.log('[Interceptor] Erro 401 detectado, tentando refresh...');
          isRefreshing = true;

          return authService.refreshToken().pipe(
            switchMap((response) => {
              isRefreshing = false;
              console.log('[Interceptor] Refresh bem-sucedido, atualizando sessão...');
              authService.establishSession(response);

              const newToken = authService.getAccessToken();
              if (!newToken) {
                console.error('[Interceptor] ERRO: Novo token não encontrado após refresh!');
                handleAuthError();
                return throwError(() => new Error('Token não encontrado após refresh'));
              }

              console.log(`[Interceptor] Reenviando requisição original: ${req.url}`);
              const clonedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });

              return next(clonedReq);
            }),
            catchError((refreshError: HttpErrorResponse) => {
              isRefreshing = false;
              console.error('[Interceptor] Erro ao fazer refresh:', refreshError.status, refreshError.statusText);

              // 🔸 Se o refresh também falhar com 401/403 → sessão morreu
              if (refreshError.status === 401 || refreshError.status === 403) {
                console.warn('[Interceptor] Refresh token inválido. Logout.');
                handleAuthError();
              }

              return throwError(() => refreshError);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};
