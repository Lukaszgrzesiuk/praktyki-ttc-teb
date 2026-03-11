import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; 
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './login/register.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent, RegisterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  pokazRejestracje = false;
  czyZalogowano = false;

  przelaczWidok() {
    this.pokazRejestracje = !this.pokazRejestracje;
  }

  ukryjFormularze() {
    this.czyZalogowano = true;
  }
}