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
  
  showForm: boolean = false;

  constructor(private noteService: NoteService) {}

  ngOnInit() {
    this.loadNotes();
  }

  loadNotes() {
    this.noteService.getNotes().subscribe({
      next: (data) => {
        this.notesHistory = data;
      },
      error: (err) => console.error('Nie udało się pobrać notatek z API:', err)
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  saveNote() {
    const noteToSend: Note = {
      title: this.newTitle,
      content: this.newContent,
      helpfulness: this.helpfulness,
      easeOfUse: this.easeOfCreation
    };

    this.noteService.addNote(noteToSend).subscribe({
      next: (savedNote) => {
        console.log('Sukces! Kontroler zapisał notatkę.');
        this.notesHistory.unshift(savedNote);
        this.toggleForm();
      },
      error: (err) => {
        console.error('Błąd podczas wysyłania do kontrolera:', err);
        alert('Błąd połączenia z API!');
      }
    });
  }

  deleteNote(id: number | undefined) {
    if (id && confirm('Czy na pewno usunąć?')) {
      this.noteService.deleteNote(id).subscribe({
        next: () => {
          this.notesHistory = this.notesHistory.filter(n => n.id !== id);
        }
      });
    }
  }

  getEmoji(value: number): string {
    if (value <= 2) return '😢';
    if (value <= 4) return '😐';
    if (value <= 6) return '🙂';
    if (value <= 8) return '😊';
    return '🤩';
  }

  resetForm() {
    this.newTitle = '';
    this.newContent = '';
    this.helpfulness = 0;
    this.easeOfCreation = 0;
  }
}