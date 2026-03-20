import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Zaktualizowany interfejs pod nowy model bazy danych
export interface Note {
  id?: number;
  title: string;
  content: string;
  permissions: string;
  author: string;
  creationDate?: string; // Backend zwraca to jako creationDate (camelCase)
  photoUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  // DODANE POLA, żeby Angular nie krzyczał w dashboard.component.html:
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

  // ZMIANA: Wysyłamy FormData (bo kontroler ma [FromForm])
  addNote(formData: FormData): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, formData);
  }

  deleteNote(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}