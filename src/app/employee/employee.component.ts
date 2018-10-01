
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { tap, first, catchError } from 'rxjs/operators';
// import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { UserService } from '../service/user.service';
import { W } from '../service/questionnaire.service'
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
// import { access } from 'fs';
// import { Meta, Telecom, Text, ValueCoding, Extension2, ValueAddress, ValueHumanName, ValueReference,
//   Extension, Coding, Type, Identifier, Name, Extension4, Extension3, Address, Coding2, MaritalStatus,
// Coding3, Language,Communication,Resource, RootObject  } from '../interface/employee'

import { Employee } from '../interface/employee.d';

// const uuidv4 = require('uuid/v4');
// import { uuidv4 } from ('uui')

export interface AccountType {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})

export class EmployeeComponent implements OnInit {
  group: FormGroup;
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

  accountTypes: AccountType[] = [
    { value: 'Employee', viewValue: 'Employee' },
    { value: 'Dependent', viewValue: 'Dependent' }
  ];

  employee = <Employee.Resource>{};
  employee_name = <Employee.Name>{};
  employee_address = <Employee.Address>{};
  employee_extension = <Employee.Extension>{};
  employee_language = <Employee.Language>{};
  employee_language_coding = <Employee.Coding>{};
  employee_communication = <Employee.Communication>{};
  ngOnInit() {

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
      dob: [''],
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

    // this.userService.getAllPatientData();

  }

  setEmployee () {

    this.employee_address.city = this.group.get('addressCity').value;
    this.employee_address.line  = [this.group.get('addressUnit').value + ' ' + this.group.get('addressStreet').value];
    this.employee_address.postalcode = this.group.get('addressPcode').value;
    this.employee_address.country = this.group.get('addressCountry').value;
    this.employee_address.state = this.group.get('addressProv').value;
    this.employee_name.family = this.group.get('familyName').value;
    this.employee_name.given = [this.group.get('givenName').value];

    if (this.group.get('language').value === 'English' || this.group.get('language').value === 'english') {
      this.employee_language_coding.code = 'en';
      this.employee_language_coding.system = 'urn:ietf:bcp:47';
      this.employee_language_coding.display = this.group.get('language').value;
    }

    this.employee_language.coding = [this.employee_language_coding];
    this.employee_communication.language = this.employee_language;
    this.employee_extension.url = 'http://hl7.org/fhir/StructureDefinition/iso-21090-name-use';
    // this.employee_extension.valueString = uuidv4();
    this.employee_extension.valueString = 'uuidv4()';
    this.employee.communication = [this.employee_communication];
    this.employee.extension = [this.employee_extension];
    this.employee.birthDate = this.group.get('dob').value;
    this.employee.resourceType = 'Patient';
    this.employee.name = this.employee_name;
    this.employee.address = [this.employee_address];

    const finalJSON = JSON.stringify(this.employee);

    console.log(finalJSON);

    this.userService.postPatientData(finalJSON);
  }

  get resourceType () {
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
