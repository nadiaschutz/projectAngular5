import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { tap, first } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { HttpClient,HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-create-account', 
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {
  accountForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.accountForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$')
        ]
      ],
      email: ['', [Validators.required, Validators.email]],
      familyName: ['', [Validators.required]],
      givenName: ['', [Validators.required]],
      agree: [false, [Validators.requiredTrue]]
    });
  }

  get userName () {
    return this.accountForm.get('userName');
  }

  get password() {
    return this.accountForm.get('password');
  }

  get email() {
    return this.accountForm.get('email');
  }

  get givenName() {
    return this.accountForm.get('givenName');
  }

  get familyName() {
    return this.accountForm.get('familyName');
  }


}
