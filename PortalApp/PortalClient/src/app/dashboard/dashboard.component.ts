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
  
  // Zmienne na pliki
  selectedPhoto: File | null = null;
  selectedVideo: File | null = null;
  selectedAudio: File | null = null;

  editingNoteId: number | null = null;
  showForm: boolean = false;

  // Zmienna do powiększania zdjęcia
  enlargedPhoto: string | null = null;

  constructor(private noteService: NoteService) {}

  ngOnInit() {
    this.loadNotes();
  }

  loadNotes() {
    this.noteService.getNotes().subscribe({
      next: (data) => { this.notesHistory = data; },
      error: (err) => console.error('Błąd pobierania:', err)
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  // Obsługa wyboru plików z dysku
  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      if (type === 'photo') this.selectedPhoto = file;
      if (type === 'video') this.selectedVideo = file;
      if (type === 'audio') this.selectedAudio = file;
    }
  }

  saveNote() {
    // Backend wymaga [FromForm], więc używamy FormData
    const formData = new FormData();
    formData.append('Title', this.newTitle);
    formData.append('Content', this.newContent);
    formData.append('Helpfulness', this.helpfulness.toString());
    formData.append('EaseOfUse', this.easeOfCreation.toString());
    formData.append('Permissions', 'Public'); // Twardo wpisane, bo backend tego wymaga
    formData.append('Author', 'Mateusz');     // Twardo wpisane

    // Dodawanie plików (jeśli zostały wybrane)
    if (this.selectedPhoto) formData.append('Photo', this.selectedPhoto);
    if (this.selectedVideo) formData.append('Video', this.selectedVideo);
    if (this.selectedAudio) formData.append('Audio', this.selectedAudio);

    this.noteService.addNote(formData).subscribe({
      next: (savedNote) => {
        this.notesHistory.unshift(savedNote);
        this.toggleForm();
      },
      error: (err) => alert('Błąd zapisu w backendzie! Sprawdź czy silnik działa.')
    });
  }

  editNote(note: Note) {
    this.showForm = true;
    this.editingNoteId = note.id ?? null;
    this.newTitle = note.title;
    this.newContent = note.content;
    // Zabezpieczenie: jeśli backend nie przysłał oceny, przypisz 0
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

  // Bezpieczna funkcja getEmoji akceptująca number lub undefined
  getEmoji(value: number | undefined): string {
    const val = value ?? 0; // Jeśli value nie istnieje, traktuj jako 0
    if (val <= 2) return '😢';
    if (val <= 4) return '😐';
    if (val <= 6) return '🙂';
    if (val <= 8) return '😊';
    return '🤩';
  }

  // Funkcje do obsługi modala powiększającego zdjęcie
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
}