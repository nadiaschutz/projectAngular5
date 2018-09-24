
import { Component, OnInit, AfterContentInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { tap, first, catchError } from 'rxjs/operators';
// import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { UserService } from '../service/user.service';

import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
// import { fhir } from '../interface/employee.d';
import { resource } from 'selenium-webdriver/http';


// const typer = require('fhir');

import * as FHIR from 'fhir';


export interface AccountType {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})

export class EmployeeComponent implements OnInit, AfterContentInit {
  group: FormGroup;
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  patient: FHIR.Patient;
  name: FHIR.HumanName;
  // FHIR: 'fhir';


  // model = <Employee.Resource>{};
  // modelname = <Employee.Name>{};
  // modellanguage = <Employee.Language>{};
  // modelidentifier = <Employee.Identifier>{};
  // modeltelecom = <Employee.Telecom>{};
  // modeltext = <Employee.Text>{};

  constructor(private fb: FormBuilder,
    private httpClient: HttpClient,
    public translate: TranslateService,
    private oauthService: OAuthService,
    private userService: UserService,
    // ,private patient: Employee

  ) {
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('fr');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }

  accountTypes: AccountType[] = [
    { value: 'Employee', viewValue: 'Employee' },
    { value: 'Dependent', viewValue: 'Dependent' }
  ];

  ngOnInit() {

    this.name.family = 'asdf';

    // this.name[0].family = 'asdf';
    // this.patient.name = this.name;

    // patient.id = '2';

    console.log(this.patient.name);

    this.firstFormGroup = this.fb.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.fb.group({
      secondCtrl: ['', Validators.required]
    });
    // name: Name.user;
    this.group = this.fb.group({
      resourceType: 'Patient',
      type: ['', [Validators.required]],
      familyName: ['', [Validators.required]],
      givenName: ['', [Validators.required]],
      dob: [Date],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      addressStreet: [''],
      addressUnit: [''],
      addressCity: [''],
      addressProv: [''],
      addressPcode: [''],
      addressCountry: [''],
      language: [''],
      id: '1',
    });
    // const a = this.model.valueOf();

    // console.log(model.valueOf());
    // console.log(this.modelname.valueOf());
    this.userService.getAllPatientData();

  }

  ngAfterContentInit() {
    // this.modelname.family = this.group.get('familyName').toString();
    // this.modelname.given = ['Test', 'Tester'];
    // this.model.name = this.modelname;
    // this.model.resourceType = 'Patient';
  }
  // setResourceType(x) {
  //   x.resourceType = this.resourceType();
  // }

  // model = <Employee.Resource>{};
  // modelname = <Employee.Name>{};
  // modellanguage = <Employee.Language>{};
  // modelidentifier = <Employee.Identifier>{};
  // modeltelecom = <Employee.Telecom>{};
  // modeltext = <Employee.Text>{};

  // setModel(employee: Employee.Resource, name: Employee.Name,
  //   language: Employee.Language, identifier: Employee.Identifier,
  //   telecom: Employee.Telecom, text: Employee.Text ) {
  //     this.modelname = name;

  //   }
  get resourceType() {
    return this.group.get('resourceType');
  }

  get type() {
    return this.group.get('type');
  }

  get dob() {
    return this.group.get('dob');
  }

  get phoneNumber() {
    return this.group.get('phoneNumber');
  }

  get password() {
    return this.group.get('password');
  }

  get email() {
    return this.group.get('email');
  }

  get givenName() {
    return this.group.get('givenName');
  }

  get familyName() {
    return this.group.get('familyName');
  }

  get addressCity() {
    return this.group.get('addressCity');
  }
  get addressUnit() {
    return this.group.get('addressUnit');
  }
  get addressStreet() {
    return this.group.get('addressStreet');
  }
  get addressProv() {
    return this.group.get('addressProv');
  }
  get addressPcode() {
    return this.group.get('addressPcode');
  }
  get addressCountry() {
    return this.group.get('addressCountry');
  }
  get language() {
    return this.group.get('language');
  }
  get userName() {
    return this.group.get('userName');
  }
  get agree() {
    return this.group.get('agree');
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
