import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      first_name: ['', [
        Validators.required,
        // Validators.name
      ]],
      last_name: ['', [
        Validators.required,
        // Validators.name
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$')
      ]],
      phones: this.fb.array([]),
      agree: [false, [
        Validators.requiredTrue
      ]]
    })

    this.loginForm.valueChanges.subscribe(console.log);
  }

  get phoneForms () {
    return this.loginForm.get('phones') as FormArray;
  }

  addPhone () {
    const phone = this.fb.group ({
      area: [],
      prefix: [],
      line: []
    })
    this.phoneForms.push(phone);
  }

  deletePhone(i) {
    this.phoneForms.removeAt(i);
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get agree() {
    return this.loginForm.get('agree');
  }

  get first_name() {
    return this.loginForm.get('first_name');
  }

  get last_name() {
    return this.loginForm.get('last_name');
  }

}
