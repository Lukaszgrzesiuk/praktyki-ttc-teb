import { Component } from '@angular/core';
import { NoteCreatorComponent } from '../note-creator/note-creator';
// USUNIĘTO: import { NoteRankingComponent } from '../note-ranking/note-ranking';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // USUNIĘTO z listy poniżej: NoteRankingComponent
  imports: [NoteCreatorComponent, FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  pokazFormularz = false;
  nowyTytul = '';
  nowaTresc = '';

  // Twoja dynamiczna lista notatek
  historiaNotatek = [
    { tytul: 'Notatka z 04.03.2026', tresc: 'Treść starej notatki...' },
    { tytul: 'Notatka z 01.03.2026', tresc: 'Inna stara notatka...' }
  ];

  toggleFormularz() {
    this.pokazFormularz = !this.pokazFormularz;
  }

  zapiszNowa() {
    if (this.nowyTytul.trim() !== '') {
      // Dodajemy nową notatkę na początek listy
      this.historiaNotatek.unshift({
        tytul: this.nowyTytul,
        tresc: this.nowaTresc
      });

      // Resetujemy pola i wracamy do wielkiego przycisku
      this.nowyTytul = '';
      this.nowaTresc = '';
      this.pokazFormularz = false;
    } else {
      alert('Wpisz chociaż tytuł!');
    }
  }
}