import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:5000/api/admin';

  checkIfAdmin(userId: number): Observable<{isAdmin: boolean}> {
    return this.http.get<{isAdmin: boolean}>(`${this.apiUrl}/is-admin/${userId}`);
  }

  getUsers(): Observable<any[]> {
    const requesterId = this.authService.getCurrentUserId();
    return this.http.get<any[]>(`${this.apiUrl}/users?requesterId=${requesterId}`);
  }

  
  addUser(userData: any): Observable<any> {
    const requesterId = this.authService.getCurrentUserId();
    return this.http.post(`${this.apiUrl}/users?requesterId=${requesterId}`, userData);
  }

  deleteUser(userId: number): Observable<any> {
    const requesterId = this.authService.getCurrentUserId();
    return this.http.delete(`${this.apiUrl}/users/${userId}?requesterId=${requesterId}`);
  }

  addGroup(userId: number, groupName: string): Observable<any> {
    const requesterId = this.authService.getCurrentUserId();
    return this.http.post(`${this.apiUrl}/users/${userId}/groups?requesterId=${requesterId}`, JSON.stringify(groupName), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  removeGroup(userId: number, groupName: string): Observable<any> {
    const requesterId = this.authService.getCurrentUserId();
    return this.http.delete(`${this.apiUrl}/users/${userId}/groups/${groupName}?requesterId=${requesterId}`);
  }

  
  getUserNotes(userId: number): Observable<any[]> {
    const requesterId = this.authService.getCurrentUserId();
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/notes?requesterId=${requesterId}`);
  }

  
  deleteNoteAdmin(noteId: number): Observable<any> {
    const requesterId = this.authService.getCurrentUserId();
    return this.http.delete(`${this.apiUrl}/notes/${noteId}?requesterId=${requesterId}`);
  }
}