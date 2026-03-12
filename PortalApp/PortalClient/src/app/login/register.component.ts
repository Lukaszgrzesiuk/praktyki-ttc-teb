import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  
  styleUrls: ['./login.component.css'] 
})
export class RegisterComponent {
  @Output() switchToLogin = new EventEmitter<void>();

  registerForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    login: new FormControl(''),
    email: new FormControl('', Validators.email),
    password: new FormControl(''),
    retypePassword: new FormControl('')
  });

// NOWA FUNKCJA - reaguje na kliknięcie przycisku "Sign up" w formularzu
  onRegisterSubmit() {
    if (this.registerForm.valid) {
      // Tu w przyszłości pójdzie zapytanie do bazy danych
      console.log('Dane z rejestracji:', this.registerForm.value);
      
      // Błyskawiczny powrót do ekranu logowania bez żadnych okienek
      this.switchToLogin.emit(); 
    }
  }

  onToggleView() {
    this.switchToLogin.emit();
  }
}