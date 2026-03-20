import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Note {
  id?: number;
  title: string;
  content?: string;
  permissions?: string;
  author?: string;
  creationDate?: string;
  
  photoUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  
  // New properties to match the backend Dto and SQL
  groupId?: number;
  authorId?: number;
  helpfulnessRating?: number;
  creationEaseRating?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  
  private apiUrl = 'http://localhost:5000/api/Notes'; 

  constructor(private http: HttpClient) {}

  // Fetch notes specifically for a user based on the new endpoint
  getNotesForUser(userId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Fallback to fetch all notes
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