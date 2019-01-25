import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';
import { TranslateService } from '@ngx-translate/core';

import * as Dependent from '../../interface/patient';
import * as datepicker from 'js-datepicker';
import * as uuid from 'uuid';

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { formatDate } from '@angular/common';


export interface AccountType {
  value: string;
  viewValue: string;
}

export interface LanguageType {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-dependent',
  templateUrl: './dependent.component.html',
  styleUrls: ['./dependent.component.scss']
})
export class DependentComponent implements OnInit {
  datePickerConfig: Partial<BsDatepickerConfig>;

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

  employee;
  employeeID;

  // Link ID used to assign to Dependent

  depLinkID;

  constructor(

    private fb: FormBuilder,
    private httpClient: HttpClient,
    public translate: TranslateService,
    private oauthService: OAuthService,
    private userService: UserService,
    private patientService: PatientService,
    private router: Router,
    private bsDatepickerConfig: BsDatepickerConfig

  ) {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.minDate.setDate(this.minDate.getDate() - 43800);
    this.maxDate.setDate(this.maxDate.getDate());
   }

  accountTypes: AccountType[] = [
    { value: 'Employee', viewValue: 'Employee' },
    { value: 'Dependent', viewValue: 'Dependent' }
  ];

  languageList: LanguageType[] = [
    { value: 'English', viewValue: 'English' },
    { value: 'French', viewValue: 'French' },

  ];

  ngOnInit() {

    const id = this.userService.returnEmployeeSummaryID();

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

    if (id) {
      this.patientService.getPatientDataByID(id).subscribe(
        data => this.grabID(data),
        error => this.handleError(error)
      );
    }

    this.dependentFormGroup = this.fb.group({

      // Last Name
      familyName: new FormControl('', [Validators.required, Validators.minLength(2)]),

      // First Name
      givenName: new FormControl('', [Validators.required, Validators.minLength(2)]),

      // Date of Birth
      dob: new FormControl('', Validators.required),

      // Email
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
      ]),

      // Client's phone number (can be any number of their choosing)
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern('^[+]?(?:[0-9]{2})?[0-9]{10}$')
      ]),

      // Address section
      addressStreet: new FormControl('', Validators.required),
      addressCity: new FormControl('', Validators.required),
      addressProv: new FormControl('', Validators.required),
      addressPcode: new FormControl('', [
        Validators.required]),
      addressCountry: new FormControl('', Validators.required),

      // Clients preferred language
      language: new FormControl(null, Validators.required),
    });


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
    const dependent_extension_type = new Dependent.Extension;



    // Assign link ID to dependent

    dependent_extension_dependentlink.url = 'https://bcip.smilecdr.com/fhir/dependentlink';
    dependent_extension_dependentlink.valueString = this.employeeID;

    // Save type of patient (dependent in this case)

    // Type extension

    dependent_extension_type.url = 'https://bcip.smilecdr.com/fhir/employeetype';
    dependent_extension_type.valueString = 'Dependent';


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

    if (this.dependentFormGroup.get('language').value.toLowerCase() === 'english') {
      dependent_language_coding.code = 'en';
      dependent_language_coding.system = 'urn:ietf:bcp:47';
      dependent_language_coding.display = this.dependentFormGroup.get('language').value;
    } else {
      dependent_language_coding.code = 'fr';
      dependent_language_coding.system = 'urn:ietf:bcp:47';
      dependent_language_coding.display = this.dependentFormGroup.get('language').value;
    }

    // Telecome (phone)

    dependent_telecom_phone.system = 'phone';
    dependent_telecom_phone.value = this.dependentFormGroup.get('phoneNumber').value;
    dependent_telecom_phone.use = 'work';

    // Telecome (email)
    this.dependent.extension = [dependent_extension_dependentlink, dependent_extension_type];
    dependent_telecom_email.system = 'email';
    dependent_telecom_email.value = this.dependentFormGroup.get('email').value;
    dependent_telecom_email.use = 'work';
    this.dependent.identifier = [dependent_identifier];
    dependent_language.coding = [dependent_language_coding];
    dependent_communication.language = dependent_language;
    this.dependent.telecom = [dependent_telecom_phone, dependent_telecom_email];
    this.dependent.communication = [dependent_communication];
    this.dependent.birthDate = this.dependentFormGroup.get('dob').value;
    this.dependent.birthDate = formatDate(this.dependent.birthDate, 'yyyy-MM-dd', 'en');
    this.dependent.resourceType = 'Patient';
    this.dependent.name = dependent_name;
    this.dependent.address = [dependent_address];

    const finalJSON = JSON.stringify(this.dependent);

    this.patientService.postPatientData(finalJSON).subscribe(data => {
      this.returnIDFromResponse(data)
      this.router.navigateByUrl('/clientsummary')
    });
  }

  returnIDFromResponse(data) {
    this.userService.getEmployeeSummaryID(data.id);
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

  grabID(data) {

    this.employee = data;
    if (data) {
      data.extension.forEach(element => {
        if (element.url === 'https://bcip.smilecdr.com/fhir/dependentlink') {
          this.employeeID = element.valueString;
        }
      });
    }

  }

  assignIDtoDependent(data) {
    this.depLinkID = data;
  }

  // Initialize a list of Patients in the system, allowing the user to select
  // which Employee they can link to



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
