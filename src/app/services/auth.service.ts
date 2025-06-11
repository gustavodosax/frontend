import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/login';
  private _isLoggedIn = false;

  constructor(private http: HttpClient, private router: Router) {
    // Verifica localStorage ao iniciar o serviço
    const storedLogin = localStorage.getItem('isLoggedIn');
    this._isLoggedIn = storedLogin === 'true';
  }

  login(matricula: string, senha: string) {
    return this.http.post<any>(this.apiUrl, { matricula, senha });
  }

  setLoggedIn(value: boolean) {
    this._isLoggedIn = value;
    localStorage.setItem('isLoggedIn', value ? 'true' : 'false');
  }

  isLoggedIn() {
    return this._isLoggedIn || localStorage.getItem('isLoggedIn') === 'true';
  }

  logout() {
    this._isLoggedIn = false;
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
  }
  
}
