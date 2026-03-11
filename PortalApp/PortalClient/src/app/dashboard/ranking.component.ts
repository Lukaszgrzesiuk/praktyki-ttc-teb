import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-note-rating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-rating.html',
  styleUrl: './note-rating.css'
})
export class NoteRatingComponent {
  helpfulness = 5;
  easeOfCreation = 5;

  emojis = ['😡', '😠', '😞', '😕', '😐', '🙂', '😊', '😄', '🤩', '🥰'];

  getEmoji(rating: number): string {
    
    return this.emojis[rating - 1];
  }
}
// ok