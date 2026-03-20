import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Note {
  id?: number;
  tytul: string;
  tresc: string;
  uprawnienia: string;
  autor?: string;
  dataUtworzenia?: string;
}

@Injectable({ providedIn: 'root' })
export class NoteService {
  
  private apiUrl = 'http://localhost:5000/api/Notes'; 

  constructor(private http: HttpClient) {}

  getNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.apiUrl);
  }

  addNote(note: Note): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, note);
  }
}