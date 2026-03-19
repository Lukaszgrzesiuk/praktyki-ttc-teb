import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./login.component.css'] 
})
export class RegisterComponent {
  @Output() switchToLogin = new EventEmitter<void>();

  private authService = inject(AuthService);

  registerForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    login: new FormControl(''),
    email: new FormControl('', Validators.email),
    password: new FormControl(''),
    retypePassword: new FormControl('')
  });

  onRegisterSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Registration successful! Backend says:', response);
          this.switchToLogin.emit(); 
        },
        error: (err) => {
          console.error('Registration failed! Server error:', err);
          alert('Registration failed. Please try again.');
        }
      });
    }
  }

  onToggleView() {
    this.switchToLogin.emit();
  }
}