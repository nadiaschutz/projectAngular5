
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { tap, first, catchError } from 'rxjs/operators';
// import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { UserService } from '../service/user.service';

import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
// import { access } from 'fs';
// import { Meta, Telecom, Text, ValueCoding, Extension2, ValueAddress, ValueHumanName, ValueReference,
//   Extension, Coding, Type, Identifier, Name, Extension4, Extension3, Address, Coding2, MaritalStatus,
// Coding3, Language,Communication,Resource, RootObject  } from '../interface/employee'

import { Employee } from '../interface/employee.d';

export interface accountType {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})

export class EmployeeComponent implements OnInit {
  accountForm: FormGroup;
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;


  constructor(private fb: FormBuilder,
    private httpClient: HttpClient,
    public translate: TranslateService,
    private oauthService: OAuthService,
    private userService: UserService
    // ,private patient: Employee

    ) {
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('fr');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }

  accountTypes: accountType[] = [
    { value: 'Employee', viewValue: 'Employee' },
    { value: 'Dependent', viewValue: 'Dependent' }
  ];

  // address: Patient.Address;





  ngOnInit() {

    const model = <Employee.Resource>{};
    const modelname = <Employee.Name>{};
    modelname.family = 'Fam';
    modelname.given = ['Test', 'Tester'];
    model.name = modelname;
    model.resourceType = 'Patient';


    const a = model.valueOf();

    console.log(model.valueOf());
    console.log(modelname.valueOf());

    // this.resource.id = 'asd';



    this.firstFormGroup = this.fb.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.fb.group({
      secondCtrl: ['', Validators.required]
    });
    // name: Name.user;
    this.accountForm = this.fb.group({
      resourceType: 'Patient',
      type: ['', [Validators.required]],
      familyName: ['', [Validators.required]],
      givenName: ['', [Validators.required]],
      dob: [Date],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      // password: [
      //   '',
      //   [
      //     Validators.required,
      //     Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
      //     Validators.minLength(6)
      //   ]
      // ],
      addressStreet: [''],
      addressUnit: [''],
      addressCity: [''],
      addressProv: [''],
      addressPcode: [''],
      addressCountry: [''],
      language: [''],
      id: '1',

      // agree: [false, [Validators.requiredTrue]]
    });

    // this.httpClient.get('localhost:8000/Patient').subscribe(
    //   data => console.log(data),
    //   err => console.log(err)
    // )

    this.userService.getAllPatientData();


  }




  get resourceType () {
    return this.accountForm.get('resourceType');
  }

  get type() {
    return this.accountForm.get('type');
  }

  get dob() {
    return this.accountForm.get('dob');
  }

  get phoneNumber() {
    return this.accountForm.get('phoneNumber');
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

  get addressCity() {
    return this.accountForm.get('addressCity');
  }
  get addressUnit() {
    return this.accountForm.get('addressUnit');
  }
  get addressStreet() {
    return this.accountForm.get('addressStreet');
  }
  get addressProv() {
    return this.accountForm.get('addressProv');
  }
  get addressPcode() {
    return this.accountForm.get('addressPcode');
  }
  get addressCountry() {
    return this.accountForm.get('addressCountry');
  }
  get language() {
    return this.accountForm.get('language');
  }


  get userName() {
    return this.accountForm.get('userName');
  }


  get agree() {
    return this.accountForm.get('agree');
  }



  // private handleError(error: HttpErrorResponse) {
  //   if (error.error instanceof ErrorEvent) {
  //     // A client-side or network error is handled accordingly.
  //     console.error('An error occurred:', error.error.message);
  //   } else {
  //     // The backend returned an unsuccessful response code.
  //     // The response body may contain clues as to what went wrong,
  //     console.error(
  //       'Error status code: ' + error.status +
  //       '| Error message: ' + error.error);
  //   }
  //   // return an ErrorObservable with a user-facing error message
  //   return new ErrorObservable(
  //     'An error occured; please try again later.');
  // }

  // private handleError(error: HttpErrorResponse) {
  //   if (error.error instanceof ErrorEvent) {
  //     // A client-side or network error occurred. Handle it accordingly.
  //     console.error('An error occurred:', error.error.message);
  //   } else {
  //     // The backend returned an unsuccessful response code.
  //     // The response body may contain clues as to what went wrong,
  //     console.error(
  //       `Backend returned code ${error.status}, ` +
  //       `body was: ${error.error}`);
  //   }
  //   // return an observable with a user-facing error message
  //   return throwError(
  //     'Something bad happened; please try again later.');
  // };
}
