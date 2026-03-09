import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Usunąłem NoteCreatorComponent stąd, bo go nie masz
import { NoteService, Note } from '../services/note.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule], // Tu też usunąłem
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  pokazFormularz = false;
  nowyTytul = '';
  nowaTresc = '';
  historiaNotatek: Note[] = [];

  private noteService = inject(NoteService);

  ngOnInit() {
    this.pobierzNotatki();
  }

  pobierzNotatki() {
    this.noteService.getNotes().subscribe({
      next: (dane) => this.historiaNotatek = dane,
      error: (err) => console.error('Błąd:', err)
    });
  }

  toggleFormularz() {
    this.pokazFormularz = !this.pokazFormularz;
  }

  zapiszNew() {
    if (!this.nowyTytul || !this.nowaTresc) return;

    const nowa: Note = {
      tytul: this.nowyTytul,
      tresc: this.nowaTresc,
      uprawnienia: 'Publiczne',
      autor: 'Użytkownik'
    };

    this.noteService.addNote(nowa).subscribe(() => {
      this.nowyTytul = '';
      this.nowaTresc = '';
      this.pokazFormularz = false;
      this.pobierzNotatki();
    });
  }
}