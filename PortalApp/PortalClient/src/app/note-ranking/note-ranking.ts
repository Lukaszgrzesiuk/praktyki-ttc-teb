import { Component } from '@angular/core';

@Component({
  selector: 'app-note-ranking',
  standalone: true,
  templateUrl: './note-ranking.html',
  styleUrl: './note-ranking.css'
})
export class NoteRankingComponent {
  
  lista = [
    { nazwa: 'Analiza Matematyczna', pkt: 150 },
    { nazwa: 'Programowanie Obiektowe', pkt: 120 },
    { nazwa: 'Podstawy Sieci', pkt: 80 }
  ];
  
}