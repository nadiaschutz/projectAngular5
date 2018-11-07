
import { Component, OnInit, AfterContentInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';


import { PatientService } from '../../service/patient.service';
import { TranslateService } from '@ngx-translate/core';
import * as Employee from '../../interface/employee';

import * as uuid from 'uuid';

// const uuidv4 = require('uuid/v4');
// import _ = require('uuid/v4');
// import * as _ from ('uuid/v4');

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
  employeeFormGroup: FormGroup;
  clientFormGroup: FormGroup;
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  constructor(private fb: FormBuilder,
    private httpClient: HttpClient,
    public translate: TranslateService,
    private oauthService: OAuthService,
    private userService: UserService,
    private patientService: PatientService,
    // private context: Context,
    // private _newquestionnaire: newQuestionnaire
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

    employee;
    employee_name;
    employee_address;
    employee_extension;
    employee_language;
    employee_language_coding;
    employee_communication;

    // Links a Depdendent(s) to an Employee. Variable to store UUID generated
    linkId;
  ngOnInit() {


    this.employee = new Employee.Resource;
    this.employee_name = new Employee.Name;
    this.employee_address = new Employee.Address;
    this.employee_extension = new Employee.Extension;
    this.employee_language = new Employee.Language;
    this.employee_language_coding = new Employee.Coding;
    this.employee_communication = new Employee.Communication;

    this.firstFormGroup = this.fb.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.fb.group({
      secondCtrl: ['', Validators.required]
    });
    this.employeeFormGroup = this.fb.group({
      resourceType: 'Patient',
      type: ['', [Validators.required]],
      familyName: ['', [Validators.required]],
      givenName: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      addressStreet: ['', [Validators.required]],
      addressUnit: ['', [Validators.required]],
      addressCity: ['', [Validators.required]],
      addressProv: ['', [Validators.required]],
      addressPcode: ['', [Validators.required]],
      addressCountry: ['', [Validators.required]],
      language: ['', [Validators.required]],
      id: '1',

    });

    this.linkId = uuid();

  }


  ngAfterContentInit() {
  }

  deserializethis(object) {
    const temparray = [];
    temparray.push(object);
    console.log(temparray);
  }

  // getQuestionItem(temp) {
  //   const tempquestion = [];
  //   for (const value of temp.returnQuestionObject().item) {
  //     tempquestion.push(value.text);
  //     for (const object of value.option) {
  //       tempquestion.push(object.valueCoding.code);
  //     }
  //   }
  //   return tempquestion;
  // }

  setEmployee() {

    this.employee_address.city = this.employeeFormGroup.get('addressCity').value;
    this.employee_address.line = [this.employeeFormGroup.get('addressUnit').value + ' '
      + this.employeeFormGroup.get('addressStreet').value];
    this.employee_address.postalcode = this.employeeFormGroup.get('addressPcode').value;
    this.employee_address.country = this.employeeFormGroup.get('addressCountry').value;
    this.employee_address.state = this.employeeFormGroup.get('addressProv').value;
    this.employee_name.family = this.employeeFormGroup.get('familyName').value;
    this.employee_name.given = [this.employeeFormGroup.get('givenName').value];

    if (this.employeeFormGroup.get('language').value === 'English' || this.employeeFormGroup.get('language').value === 'english') {
      this.employee_language_coding.code = 'en';
      this.employee_language_coding.system = 'urn:ietf:bcp:47';
      this.employee_language_coding.display = this.employeeFormGroup.get('language').value;
    }

    this.employee_language.coding = [this.employee_language_coding];
    this.employee_communication.language = this.employee_language;
    this.employee_extension.url = 'http://hl7.org/fhir/StructureDefinition/iso-21090-name-use';
    // this.employee_extension.valueString = uuidv4();
    this.employee_extension.valueString = 'uuidv4()';
    this.employee.communication = [this.employee_communication];
    this.employee.extension = [this.employee_extension];
    this.employee.birthDate = this.employeeFormGroup.get('dob').value;
    this.employee.resourceType = 'Patient';
    this.employee.name = this.employee_name;
    this.employee.address = [this.employee_address];

    const finalJSON = JSON.stringify(this.employee);

    console.log(finalJSON);

    this.patientService.postPatientData(finalJSON);
  }

  resetData() {
    this.employee = this.employee_name = this.employee_address = this.employee_extension
    = this.employee_language = this.employee_language_coding = this.employee_communication = null;
      this.employee = new Employee.Resource;
      this.employee_name = new Employee.Name;
      this.employee_address = new Employee.Address;
      this.employee_extension = new Employee.Extension;
      this.employee_language = new Employee.Language;
      this.employee_language_coding = new Employee.Coding;
      this.employee_communication = new Employee.Communication;

  }
  get resourceType() {
    return this.employeeFormGroup.get('resourceType');
  }

  get type() {
    return this.employeeFormGroup.get('type');
  }

  get dob() {
    return this.employeeFormGroup.get('dob');
  }

  get phoneNumber() {
    return this.employeeFormGroup.get('phoneNumber');
  }

  get password() {
    return this.employeeFormGroup.get('password');
  }

  get email() {
    return this.employeeFormGroup.get('email');
  }

  get givenName() {
    return this.employeeFormGroup.get('givenName');
  }

  get familyName() {
    return this.employeeFormGroup.get('familyName');
  }

  get addressCity() {
    return this.employeeFormGroup.get('addressCity');
  }
  get addressUnit() {
    return this.employeeFormGroup.get('addressUnit');
  }
  get addressStreet() {
    return this.employeeFormGroup.get('addressStreet');
  }
  get addressProv() {
    return this.employeeFormGroup.get('addressProv');
  }
  get addressPcode() {
    return this.employeeFormGroup.get('addressPcode');
  }
  get addressCountry() {
    return this.employeeFormGroup.get('addressCountry');
  }
  get language() {
    return this.employeeFormGroup.get('language');
  }

  get userName() {
    return this.employeeFormGroup.get('userName');
  }

  get agree() {
    return this.employeeFormGroup.get('agree');
  }

}
