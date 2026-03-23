import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/auth'; 

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response && response.userId) {
          localStorage.setItem('userId', response.userId.toString());
          localStorage.setItem('userName', response.userName);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  }

  getCurrentUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  }

  getCurrentUserName(): string {
    return localStorage.getItem('userName') || 'Użytkownik';
  }

  isLoggedIn(): boolean {
    return this.getCurrentUserId() !== null;
  }
}