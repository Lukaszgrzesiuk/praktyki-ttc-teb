import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService, Note } from '../services/note.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  notesHistory: any[] = [];
  
  newTitle: string = '';
  newContent: string = '';
  helpfulness: number = 0;
  easeOfCreation: number = 0;
  editingNoteId: number | null = null;
  
  showForm: boolean = false;
  enlargedPhoto: string | null = null;

  selectedPhoto: File | null = null;
  selectedVideo: File | null = null;
  selectedAudio: File | null = null;

  constructor(private noteService: NoteService) {}

  ngOnInit() {
    this.loadNotes();
  }

  loadNotes() {
    this.noteService.getNotes().subscribe({
      next: (data) => {
        this.notesHistory = data;
      },
      error: (err) => {
        console.log('Backend is offline, using local storage mode.');
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  saveNote() {
    const noteData: any = {
      id: Date.now(),
      title: this.newTitle,
      content: this.newContent,
      helpfulness: this.helpfulness,
      easeOfCreation: this.easeOfCreation,
      creationDate: new Date().toISOString(),
      photoUrl: this.selectedPhoto ? URL.createObjectURL(this.selectedPhoto) : null
    };

    this.notesHistory.unshift(noteData);
    this.resetForm();
    this.showForm = false;

    this.noteService.saveNote(noteData).subscribe({
      next: (savedNote) => console.log('Successfully synced with backend'),
      error: (err) => console.log('Backend offline - note saved only locally')
    });
  }

  editNote(note: any) {
    this.showForm = true;
    this.editingNoteId = note.id;
    this.newTitle = note.title;
    this.newContent = note.content;
    this.helpfulness = note.helpfulness;
    this.easeOfCreation = note.easeOfCreation;
  }

  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      if (type === 'photo') this.selectedPhoto = file;
      if (type === 'video') this.selectedVideo = file;
      if (type === 'audio') this.selectedAudio = file;
    }
  }

  getEmoji(value: number): string {
    if (value <= 2) return '😢';
    if (value <= 4) return '😐';
    if (value <= 6) return '🙂';
    if (value <= 8) return '😊';
    return '🤩';
  }

  openPhoto(url: string) {
    this.enlargedPhoto = url;
  }

  closePhoto() {
    this.enlargedPhoto = null;
  }

  resetForm() {
    this.newTitle = '';
    this.newContent = '';
    this.helpfulness = 0;
    this.easeOfCreation = 0;
    this.editingNoteId = null;
    this.selectedPhoto = null;
    this.selectedVideo = null;
    this.selectedAudio = null;
  }
}