import { Component } from '@angular/core';
// Importujemy Twój Dashboard
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // Dodajemy Dashboard do listy klocków
  imports: [DashboardComponent],
  // Zamiast pliku HTML, wpisujemy kod tutaj (krótko i zwięźle)
  template: `<app-dashboard></app-dashboard>`,
  styles: []
})
export class AppComponent {}