import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../services/note.service';

export interface Note {
  id?: number;
  title?: string;
  content?: string;
  tytul?: string;
  tresc?: string;
  uprawnienia?: string;
  autor?: string;
  dataUtworzenia?: string | Date;
  creationDate?: string | Date;
  // Dodajemy miejsca na nasze pliki multimedialne
  photo?: File | null;
  video?: File | null;
  audio?: File | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  notesHistory: any[] = [];
  showForm: boolean = false;
  newTitle: string = '';
  newContent: string = '';

  // Zmienne do trzymania wybranych plików
  selectedPhoto: File | null = null;
  selectedVideo: File | null = null;
  selectedAudio: File | null = null;

  private noteService = inject(NoteService);

  ngOnInit() {
    this.fetchNotes();
  }

  fetchNotes() {
    this.noteService.getNotes().subscribe({
      next: (data: any) => this.notesHistory = data,
      error: (err: any) => console.error('Błąd pobierania:', err)
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  // Funkcja, która chwyta plik z komputera po kliknięciu
  onFileSelected(event: any, type: 'photo' | 'video' | 'audio') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'photo') this.selectedPhoto = file;
      if (type === 'video') this.selectedVideo = file;
      if (type === 'audio') this.selectedAudio = file;
    }
  }

  saveNewNote() {
    if (!this.newTitle || !this.newContent) return;
    
    const nowa: Note = {
      id: Math.floor(Math.random() * 1000), 
      title: this.newTitle,
      content: this.newContent,
      tytul: this.newTitle,
      tresc: this.newContent,
      uprawnienia: 'Public',
      autor: 'User',
      creationDate: new Date().toISOString(),
      dataUtworzenia: new Date().toISOString(),
      // Zapisujemy pliki do naszej notatki
      photo: this.selectedPhoto,
      video: this.selectedVideo,
      audio: this.selectedAudio
    };

    // Nasz mock
    this.notesHistory.unshift(nowa);
    
    // Czyszczenie formularza po zapisaniu
    this.newTitle = '';
    this.newContent = '';
    this.selectedPhoto = null;
    this.selectedVideo = null;
    this.selectedAudio = null;
    this.showForm = false;
  }
}