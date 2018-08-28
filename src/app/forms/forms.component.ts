import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { tap, first } from 'rxjs/operators';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css']
})
export class FormsComponent implements OnInit {
  myForm: FormGroup;
  param = { value: 'world' };

  constructor(private fb: FormBuilder, translate: TranslateService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en');
  }

  ngOnInit() {
    this.myForm = this.fb.group({
      account_name: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      pri: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$')
        ]
      ],
      phones: this.fb.array([]),
      agree: [false, [Validators.requiredTrue]]
    });

    this.myForm.valueChanges.subscribe(console.log);
  }

  get phoneForms() {
    return this.myForm.get('phones') as FormArray;
  }

  addPhone() {
    const phone = this.fb.group({
      area: [],
      prefix: [],
      line: []
    });
    this.phoneForms.push(phone);
  }

  deletePhone(i) {
    this.phoneForms.removeAt(i);
  }

  get email() {
    return this.myForm.get('email');
  }

  get password() {
    return this.myForm.get('password');
  }

  get agree() {
    return this.myForm.get('agree');
  }

  get first_name() {
    return this.myForm.get('first_name');
  }

  get last_name() {
    return this.myForm.get('last_name');
  }

  get account_name() {
    return this.myForm.get('account_name');
  }

  get pri() {
    return this.myForm.get('pri');
  }
  // async submitHandler () {
  //   this.loading = true;
  //   const formValue = this.myForm.value;

  // }
}
