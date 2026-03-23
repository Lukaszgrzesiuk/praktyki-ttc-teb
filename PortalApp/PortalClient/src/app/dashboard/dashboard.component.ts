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
  notesHistory: Note[] = [];
  
  newTitle: string = '';
  newContent: string = '';
  helpfulness: number = 0;
  easeOfCreation: number = 0;
  
  selectedPhoto: File | null = null;
  selectedVideo: File | null = null;
  selectedAudio: File | null = null;

  editingNoteId: number | null = null;
  showForm: boolean = false;

  enlargedPhoto: string | null = null;

  chatMessages: { role: string, content: string }[] = [
    { role: 'ai', content: 'Hi! Tell me what to note down, and I will create and rank it for you automatically.' }
  ];
  chatInput: string = '';

  constructor(private noteService: NoteService) {}

  ngOnInit() {
    this.loadNotes();
  }

  loadNotes() {
    this.noteService.getNotes().subscribe({
      next: (data) => { this.notesHistory = data; },
      error: (err) => console.error(err)
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      if (type === 'photo') this.selectedPhoto = file;
      if (type === 'video') this.selectedVideo = file;
      if (type === 'audio') this.selectedAudio = file;
    }
  }

  saveNote() {
    const formData = new FormData();
    formData.append('Title', this.newTitle);
    formData.append('Content', this.newContent);
    formData.append('Helpfulness', this.helpfulness.toString());
    formData.append('EaseOfUse', this.easeOfCreation.toString());
    formData.append('Permissions', 'Public');
    formData.append('Author', 'Mateusz');

    if (this.selectedPhoto) formData.append('Photo', this.selectedPhoto);
    if (this.selectedVideo) formData.append('Video', this.selectedVideo);
    if (this.selectedAudio) formData.append('Audio', this.selectedAudio);

    this.noteService.addNote(formData).subscribe({
      next: (savedNote) => {
        this.notesHistory.unshift(savedNote);
        this.toggleForm();
      },
      error: (err) => alert('Błąd komunikacji z backendem.')
    });
  }

  editNote(note: Note) {
    this.showForm = true;
    this.editingNoteId = note.id ?? null;
    this.newTitle = note.title;
    this.newContent = note.content;
    this.helpfulness = note.helpfulness ?? 0;
    this.easeOfCreation = note.easeOfUse ?? 0;
  }

  deleteNote(id: number | undefined) {
    if (id && confirm('Usunąć notatkę?')) {
      this.noteService.deleteNote(id).subscribe({
        next: () => {
          this.notesHistory = this.notesHistory.filter(n => n.id !== id);
        }
      });
    }
  }

  getEmoji(value: number | undefined): string {
    const val = value ?? 0;
    if (val <= 2) return '😢';
    if (val <= 4) return '😐';
    if (val <= 6) return '🙂';
    if (val <= 8) return '😊';
    return '🤩';
  }

  openPhoto(url: string) { this.enlargedPhoto = url; }
  closePhoto() { this.enlargedPhoto = null; }

  resetForm() {
    this.newTitle = '';
    this.newContent = '';
    this.helpfulness = 0;
    this.easeOfCreation = 0;
    this.selectedPhoto = null;
    this.selectedVideo = null;
    this.selectedAudio = null;
    this.editingNoteId = null;
  }

  sendChatMessage() {
    if (!this.chatInput.trim()) return;

    const userText = this.chatInput;
    this.chatMessages.push({ role: 'user', content: userText });
    this.chatInput = '';

    setTimeout(() => {
      const generatedRank = Math.floor(Math.random() * 4) + 7;
      const generatedEase = Math.floor(Math.random() * 5) + 5;

      const formData = new FormData();
      formData.append('Title', 'AI Note');
      formData.append('Content', userText);
      formData.append('Helpfulness', generatedRank.toString());
      formData.append('EaseOfUse', generatedEase.toString());
      formData.append('Permissions', 'Public');
      formData.append('Author', 'AI Assistant');

      this.noteService.addNote(formData).subscribe({
        next: (savedNote) => {
          this.notesHistory.unshift(savedNote);
          this.chatMessages.push({ role: 'ai', content: `Done! I created the note and gave it a priority rank of ${generatedRank}/10.` });
        },
        error: (err) => {
          this.chatMessages.push({ role: 'ai', content: 'Brak połączenia z serwerem. Nie udało się zapisać notatki.' });
        }
      });
    }, 800);
  }
}