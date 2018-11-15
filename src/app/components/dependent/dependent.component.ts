import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';
import { TranslateService } from '@ngx-translate/core';

import * as Dependent from '../../interface/patient';
import * as datepicker from 'js-datepicker';
import * as uuid from 'uuid';


export interface AccountType {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-dependent',
  templateUrl: './dependent.component.html',
  styleUrls: ['./dependent.component.css']
})
export class DependentComponent implements OnInit {

  // Declaration for Dependent form group object

  dependentFormGroup: FormGroup;

  // Dependent base object

  dependent;

  // Dependent Extension object (Dependent Link)

  // dependent_extension_dependentlink;

  // Dependent name object

  // dependent_name;

  // Dependent address object

  // dependent_address;

  // Dependent Contact (Phone)

  // dependent_telecom_phone;

  // Dependent Contact (Email)

  // dependent_telecom_email;

  // Employe Language Object

  // dependent_language;

  // Dependent Language Coding Object

  // dependent_language_coding;

  // Dependent Communication Object

  // dependent_communication;

  // Dependent Identifier object

  // dependent_identifier;

  // Dependent Identifier Type subobject

  // dependent_identifier_type;

  // Array for Dependent Objects

  dependentsArray: any[];

  // Store list of Departments

  department: any;

  // Store list of Branches

  branches: any;

  constructor(

    private fb: FormBuilder,
    private httpClient: HttpClient,
    public translate: TranslateService,
    private oauthService: OAuthService,
    private userService: UserService,
    private patientService: PatientService,
    private router: Router

  ) { }

  accountTypes: AccountType[] = [
    { value: 'Employee', viewValue: 'Employee' },
    { value: 'Dependent', viewValue: 'Dependent' }
  ];

  ngOnInit() {


    console.log('from the dependednt form', this.userService.getObjectBase());

    this.dependentsArray = new Array;


    // Set Department List

    this.userService.getDepartmentList().subscribe(
      data => this.setDepartments(data),
      error => this.handleError(error)
    );

    // Set Branch List

    this.userService.getBranchList().subscribe(
      data => this.setBranchList(data),
      error => this.handleError(error)
    );


    this.dependentFormGroup = this.fb.group({
      type: ['', [Validators.required]],
      familyName: ['', [Validators.required]],
      givenName: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      addressStreet: ['', [Validators.required]],
      addressCity: ['', [Validators.required]],
      addressProv: ['', [Validators.required]],
      addressPcode: ['', [Validators.required]],
      addressCountry: ['', [Validators.required]],
      language: ['', [Validators.required]],
    });

    // const retrievedObject = localStorage.getItem('dependent');
    // const parsedObject = JSON.parse(retrievedObject);
    // console.log(parsedObject);
  }


  setDependent() {

    // this.linkId = uuid();

    this.dependent = new Dependent.Resource;
    const dependent_name = new Dependent.Name;
    const dependent_address = new Dependent.Address;
    const dependent_language = new Dependent.Language;
    const dependent_language_coding = new Dependent.Coding;
    const dependent_communication = new Dependent.Communication;
    const dependent_identifier = new Dependent.Identifier;
    const dependent_telecom_email = new Dependent.Telecom;
    const dependent_telecom_phone = new Dependent.Telecom;
    const dependent_extension_dependentlink = new Dependent.Extension;

    const linkId = localStorage.getItem('employee');
    const parsedId = JSON.parse(linkId);


    dependent_extension_dependentlink.url = 'https://bcip.smilecdr.com/fhir/dependentlink';

    for (const item of this.userService.getObjectBase().entry) {
      dependent_extension_dependentlink.valueString = item.resource.extension[2].valueString;
    }

    // Dependent Address

    dependent_address.city = this.dependentFormGroup.get('addressCity').value;
    dependent_address.line = [this.dependentFormGroup.get('addressStreet').value];
    dependent_address.postalCode = this.dependentFormGroup.get('addressPcode').value;
    dependent_address.country = this.dependentFormGroup.get('addressCountry').value;
    dependent_address.state = this.dependentFormGroup.get('addressProv').value;


    // Employe Name

    dependent_name.family = this.dependentFormGroup.get('familyName').value;
    dependent_name.given = [this.dependentFormGroup.get('givenName').value];

    // Language info

    if (this.dependentFormGroup.get('language').value === 'English' || this.dependentFormGroup.get('language').value === 'english') {
      dependent_language_coding.code = 'en';
      dependent_language_coding.system = 'urn:ietf:bcp:47';
      dependent_language_coding.display = this.dependentFormGroup.get('language').value;
    }

    // Telecome (phone)

    dependent_telecom_phone.system = 'phone';
    dependent_telecom_phone.value = this.dependentFormGroup.get('phoneNumber').value;
    dependent_telecom_phone.use = 'work';

    // Telecome (email)
    this.dependent.extension = [dependent_extension_dependentlink];
    dependent_telecom_email.system = 'email';
    dependent_telecom_email.value = this.dependentFormGroup.get('email').value;
    dependent_telecom_email.use = 'work';
    this.dependent.identifier = [dependent_identifier];
    dependent_language.coding = [dependent_language_coding];
    dependent_communication.language = dependent_language;
    this.dependent.telecom = [dependent_telecom_phone, dependent_telecom_email];
    this.dependent.communication = [dependent_communication];
    this.dependent.birthDate = this.dependentFormGroup.get('dob').value;
    this.dependent.resourceType = 'Patient';
    this.dependent.name = dependent_name;
    this.dependent.address = [dependent_address];

    const finalJSON = JSON.stringify(this.dependent);
    this.dependentsArray.push(finalJSON);


    this.userService.setObjectBase(this.dependent);


    this.patientService.postPatientData(finalJSON);
    // this.bundleObjects();
  }

  // Head over to summary screen
  goToSummary() {
    this.router.navigateByUrl('/employeesummary');
  }
  // Return back to employee screen
  backToEmployee() {
    this.router.navigate(['/employeeform']);
  }

  setBranchList(data) {
    this.branches = data.branchlist;
  }

  setDepartments(data) {
    this.department = data.department;
  }

  handleError(error) {
    console.log(error);
  }

  get resourceType() {
    return this.dependentFormGroup.get('resourceType');
  }

  get type() {
    return this.dependentFormGroup.get('type');
  }

  get dob() {
    return this.dependentFormGroup.get('dob');
  }

  get phoneNumber() {
    return this.dependentFormGroup.get('phoneNumber');
  }

  get password() {
    return this.dependentFormGroup.get('password');
  }

  get email() {
    return this.dependentFormGroup.get('email');
  }

  get givenName() {
    return this.dependentFormGroup.get('givenName');
  }

  get familyName() {
    return this.dependentFormGroup.get('familyName');
  }

  get addressCity() {
    return this.dependentFormGroup.get('addressCity');
  }

  get addressStreet() {
    return this.dependentFormGroup.get('addressStreet');
  }
  get addressProv() {
    return this.dependentFormGroup.get('addressProv');
  }
  get addressPcode() {
    return this.dependentFormGroup.get('addressPcode');
  }
  get addressCountry() {
    return this.dependentFormGroup.get('addressCountry');
  }
  get language() {
    return this.dependentFormGroup.get('language');
  }

}
