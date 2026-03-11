import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RegisterComponent], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private router = inject(Router);

  showRegistration = false;

  loginForm = new FormGroup({
    login: new FormControl(''),
    password: new FormControl('')
  });

  toggleView() {
    this.showRegistration = !this.showRegistration;
  }

  onLogin() {
    this.router.navigate(['/dashboard']);
  }
}