import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { tap, first } from 'rxjs/operators';
// import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {
  accountForm: FormGroup;

  constructor(private fb: FormBuilder, private httpClient:HttpClient, public translate: TranslateService) {
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('fr');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }



  ngOnInit() {
    this.accountForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
          Validators.minLength(6)
        ]
      ],
      address_street: ['', Validators.required],
      address_city: ['', Validators.required],
      address_prov: ['', Validators.required],
      address_pcode: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      familyName: ['', [Validators.required]],
      givenName: ['', [Validators.required]],
      agree: [false, [Validators.requiredTrue]]
    });


    const observable = new Observable();

  

    const headers = new HttpHeaders();
    headers.set('Authorization', 'Basic ' + btoa('admin:password'))

    this.httpClient.get('localhost:8000/Patient').subscribe(
      data => console.log(data),
      err => console.log(err)
    )
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

  get agree() {
    return this.accountForm.get('agree');
  }

}
