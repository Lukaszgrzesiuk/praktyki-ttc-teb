import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent, RouterOutlet],
  templateUrl: './app.html'
})
export class AppComponent {}