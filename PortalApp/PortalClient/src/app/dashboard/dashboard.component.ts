import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

export interface Note {
  id: number;
  title: string;       
  content: string;     
  creationDate: Date;  
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, DatePipe], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  showForm: boolean = false;
  newTitle: string = '';
  newContent: string = '';
  notesHistory: Note[] = [];

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

  zapiszNowa() {
    if (!this.nowyTytul || !this.nowaTresc) return;
    
    const nowa: Note = {
      // Dla symulacji nadajemy losowe ID i obecną datę
      id: Math.floor(Math.random() * 1000), 
      tytul: this.nowyTytul,
      tresc: this.nowaTresc,
      uprawnienia: 'Publiczne',
      autor: 'Użytkownik',
      dataUtworzenia: new Date().toISOString()
    };

    // --- ZAKOMENTOWANY ZEPSUTY BACKEND DAMIANA ---
    /*
    this.noteService.addNote(nowa).subscribe(() => {
      this.nowyTytul = '';
      this.nowaTresc = '';
      this.pokazFormularz = false;
      this.pobierzNotatki(); 
    });
    */

    // --- NASZE TYMCZASOWE OBEJŚCIE (MOCK) ---
    // 1. Wrzucamy nową notatkę na samą górę naszej listy na ekranie
    this.historiaNotatek.unshift(nowa);
    
    // 2. Zamykamy formularz z naszą fajną animacją
    this.nowyTytul = '';
    this.nowaTresc = '';
    this.pokazFormularz = false;
  }
}