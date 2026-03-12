import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './login/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NoteRankingComponent } from './note-ranking/note-ranking';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent, RouterOutlet, NoteRankingComponent],
  templateUrl: './app.html'
})
export class AppComponent {
  showRegistration = false;
  isLoggedIn = false;

  toggleView() {
    this.showRegistration = !this.showRegistration;
  }
}