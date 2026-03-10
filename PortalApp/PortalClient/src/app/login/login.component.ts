import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
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

  registerForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    login: new FormControl(''),
    email: new FormControl('', Validators.email),
    password: new FormControl(''),
    retypePassword: new FormControl('')
  });

  toggleView() {
    this.showRegistration = !this.showRegistration;
  }

  onLogin() {
    this.router.navigate(['/dashboard']);
  }
}