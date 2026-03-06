import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-note-creator',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './note-creator.html',
  styleUrl: './note-creator.css'
})
export class NoteCreatorComponent {
  tresc = '';
  uprawnienia = 'Prywatne';

  generujAI() {
    this.tresc = 'Tekst wygenerowany przez AI...';
  }

  zapisz() {
    console.log('Zapisano:', this.tresc, this.uprawnienia);
    alert('Notatka dodana!');
  }
}