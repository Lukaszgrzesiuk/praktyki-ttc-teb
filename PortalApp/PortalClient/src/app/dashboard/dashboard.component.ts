import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../services/note.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export interface Note {
  id?: number;
  title?: string;
  content?: string;
  permissions?: string; 
  author?: string;
  creationDate?: string | Date;
  helpfulness: number;      // Added field for rating
  easeOfCreation: number;   // Added field for rating
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
  notesHistory: Note[] = [];
  showForm: boolean = false;
  newTitle: string = '';
  newContent: string = '';
  
  // Rating logic integration
  helpfulness = 5;
  easeOfCreation = 5;
  emojis = ['😡', '😠', '😞', '😕', '😐', '🙂', '😊', '😄', '🤩', '🥰'];

  editingNoteId: number | null = null; 

  selectedPhoto: File | null = null;
  selectedVideo: File | null = null;
  selectedAudio: File | null = null;

  enlargedPhoto: SafeUrl | null = null;

  private noteService = inject(NoteService);
  private sanitizer = inject(DomSanitizer);

  ngOnInit() {
    this.fetchNotes();
  }

  getEmoji(rating: number): string {
    return this.emojis[rating - 1];
  }

  fetchNotes() {
    this.noteService.getNotes().subscribe({
      next: (data: any) => this.notesHistory = data,
      error: (err: any) => console.error('Fetch error:', err)
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  onFileSelected(event: any, type: 'photo' | 'video' | 'audio') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'photo') this.selectedPhoto = file;
      if (type === 'video') this.selectedVideo = file;
      if (type === 'audio') this.selectedAudio = file;
    }
  }

  openPhoto(url: any) {
    this.enlargedPhoto = url;
  }

  closePhoto() {
    this.enlargedPhoto = null;
  }

  editNote(note: Note) {
    this.showForm = true;
    this.editingNoteId = note.id || null;
    this.newTitle = note.title || '';
    this.newContent = note.content || '';
    this.helpfulness = note.helpfulness || 5;
    this.easeOfCreation = note.easeOfCreation || 5;
    this.selectedPhoto = note.photo || null;
    this.selectedVideo = note.video || null;
    this.selectedAudio = note.audio || null;
  }

  saveNote() {
    if (!this.newTitle || !this.newContent) return;
    
    let pUrl = null;
    let vUrl = null;
    let aUrl = null;

    if (this.selectedPhoto) pUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.selectedPhoto));
    if (this.selectedVideo) vUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.selectedVideo));
    if (this.selectedAudio) aUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.selectedAudio));

    if (this.editingNoteId) {
      const noteIndex = this.notesHistory.findIndex(n => n.id === this.editingNoteId);
      if (noteIndex !== -1) {
        this.notesHistory[noteIndex].title = this.newTitle;
        this.notesHistory[noteIndex].content = this.newContent;
        this.notesHistory[noteIndex].helpfulness = this.helpfulness;
        this.notesHistory[noteIndex].easeOfCreation = this.easeOfCreation;
        if (this.selectedPhoto) this.notesHistory[noteIndex].photoUrl = pUrl;
        if (this.selectedVideo) this.notesHistory[noteIndex].videoUrl = vUrl;
        if (this.selectedAudio) this.notesHistory[noteIndex].audioUrl = aUrl;
      }
    } else {
      const newNote: Note = {
        id: Math.floor(Math.random() * 1000), 
        title: this.newTitle,
        content: this.newContent,
        permissions: 'Public',
        author: 'User',
        creationDate: new Date().toISOString(),
        helpfulness: this.helpfulness,
        easeOfCreation: this.easeOfCreation,
        photo: this.selectedPhoto,
        video: this.selectedVideo,
        audio: this.selectedAudio,
        photoUrl: pUrl,
        videoUrl: vUrl,
        audioUrl: aUrl
      };
      this.notesHistory.unshift(newNote);
    }
    
    this.resetForm();
    this.showForm = false;
  }

  resetForm() {
    this.newTitle = '';
    this.newContent = '';
    this.selectedPhoto = null;
    this.selectedVideo = null;
    this.selectedAudio = null;
    this.editingNoteId = null;
    this.helpfulness = 5;
    this.easeOfCreation = 5;
  }
}