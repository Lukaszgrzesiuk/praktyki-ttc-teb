import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.app.html',
  styleUrl: './login.app.css'
})
export class AppComponent {
  pokazRejestracje = false;


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


  przelaczWidok() {
    this.pokazRejestracje = !this.pokazRejestracje;
  }
}
