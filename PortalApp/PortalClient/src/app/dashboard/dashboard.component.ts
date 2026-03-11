import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../services/note.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  photo?: File | null;
  video?: File | null;
  audio?: File | null;
  photoUrl?: SafeUrl | null;
  videoUrl?: SafeUrl | null;
  audioUrl?: SafeUrl | null;
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

  selectedPhoto: File | null = null;
  selectedVideo: File | null = null;
  selectedAudio: File | null = null;

  // Nowa zmienna: trzyma link do zdjęcia, które użytkownik chce powiększyć
  powiekszoneZdjecie: SafeUrl | null = null;

  private noteService = inject(NoteService);
  private sanitizer = inject(DomSanitizer);

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

  onFileSelected(event: any, type: 'photo' | 'video' | 'audio') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'photo') this.selectedPhoto = file;
      if (type === 'video') this.selectedVideo = file;
      if (type === 'audio') this.selectedAudio = file;
    }
  }

  // Funkcje do otwierania i zamykania zdjęcia na pełnym ekranie
  otworzZdjecie(url: any) {
    this.powiekszoneZdjecie = url;
  }

  zamknijZdjecie() {
    this.powiekszoneZdjecie = null;
  }

  saveNewNote() {
    if (!this.newTitle || !this.newContent) return;
    
    let pUrl = null;
    let vUrl = null;
    let aUrl = null;

    if (this.selectedPhoto) pUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.selectedPhoto));
    if (this.selectedVideo) vUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.selectedVideo));
    if (this.selectedAudio) aUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.selectedAudio));

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
      photo: this.selectedPhoto,
      video: this.selectedVideo,
      audio: this.selectedAudio,
      photoUrl: pUrl,
      videoUrl: vUrl,
      audioUrl: aUrl
    };

    this.notesHistory.unshift(nowa);
    
    this.newTitle = '';
    this.newContent = '';
    this.selectedPhoto = null;
    this.selectedVideo = null;
    this.selectedAudio = null;
    this.showForm = false;
  }
}