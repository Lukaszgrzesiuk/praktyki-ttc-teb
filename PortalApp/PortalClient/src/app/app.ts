import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent, RouterOutlet], // Removed NoteRankingComponent
  templateUrl: './app.html'
})
export class AppComponent {
  showRegistration = false;
  isLoggedIn = false;

  toggleView() {
    this.showRegistration = !this.showRegistration;
  }
}