import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Note {
  id?: number;
  title: string;
  content: string;
  permissions: string;
  author: string;
  creationDate?: string;
  photoUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  helpfulness?: number;
  easeOfUse?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private apiUrl = 'http://localhost:5000/api/notes';

  constructor(private http: HttpClient) {}

  getNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.apiUrl);
  }

  addNote(formData: FormData): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, formData);
  }

  deleteNote(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}