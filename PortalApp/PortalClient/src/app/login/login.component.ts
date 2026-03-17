import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component'; 
import { AuthService } from '../services/auth.service'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RegisterComponent], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService); 

  showRegistration = false;

  loginForm = new FormGroup({
    login: new FormControl(''),
    password: new FormControl('')
  });

  toggleView() {
    this.showRegistration = !this.showRegistration;
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful! Backend says:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Login failed! Invalid credentials or server error:', err);
          alert('Login failed. Please check your credentials.');
        }
      });
    }
  }
}