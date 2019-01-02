import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  NgControlStatusGroup
} from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';

import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as Employee from '../../interface/patient';
import * as uuid from 'uuid';

export interface AccountType {
  value: string;
  viewValue: string;
}

export interface LanguageType {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {
  datePickerConfig: Partial<BsDatepickerConfig>;

  // Declaration for Employree form group object

  employeeFormGroup: FormGroup;

  // Declarations for objects related Patients and Extensions

  // Employee base object

  employee;

  // Employee name object

  employee_name;

  // Employee address object

  employee_address;

  // Employee Contact (Phone)

  employee_telecom_phone;

  // Employee Contact (Email)

  employee_telecom_email;

  // Employee Extension object (Dependent Link)

  employee_extension_dependentlink;

  // Employee Extension object (Job Title)

  employee_extension_jobtitle;

  // Employee Extension object (Workplace)

  employee_extension_workplace;

  // Employee Extension object (Branch)

  employee_extension_branch;

  // Employee Extension object (Type)

  employee_extension_type;

  // Employee Extension object (Cross Reference One)

  employee_extension_crossreferenceone;

  // Employee Extension object (Cross Reference Two)

  employee_extension_crossreferencetwo;

  // Employe Language Object

  employee_language;

  // Employee Language Coding Object

  employee_language_coding;

  // Employee Communication Object

  employee_communication;

  // Employee Identifier object

  employee_identifier;

  // Employee Identifier Type subobject

  employee_identifier_type;

  // Array for Dependent Objects

  dependentsArray: any[];

  // Store list of Departments

  department: any;

  // Store list of Branches

  branches: any;

  // Store a UUID to link Employee and Dependent objects

  linkId;

  // list of  Languages
  languages = ['English', 'French'];

  // list of Provinces and territories in alphabetical order
  // tslint:disable-next-line:max-line-length
  provinces = ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'];


  // list of countries
  countries = ['Canada'];

  minDate: Date;
  maxDate: Date;



  i;
  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient,
    public translate: TranslateService,
    private oauthService: OAuthService,
    private userService: UserService,
    private patientService: PatientService,
    private router: Router
  ) {
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('fr');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');


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
    { value: 'French', viewValue: 'French' }
  ];

  ngOnInit() {

    this.datePickerConfig = Object.assign({},
      {containerClass: 'theme-dark-blue'});

    this.dependentsArray = new Array();
    this.i = 0;
    // Set Department List

    this.userService
      .getDepartmentList()
      .subscribe(
        data => this.setDepartments(data),
        error => this.handleError(error)
      );

    // Set Branch List

    this.userService
      .getBranchList()
      .subscribe(
        data => this.setBranchList(data),
        error => this.handleError(error)
      );

    // Initialize Employee Form Group for DOM

    this.employeeFormGroup = this.fb.group({
      // Employee type
      // type: new FormControl(null, Validators.required),

      // Last Name
      familyName: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ]),

      // First Name
      givenName: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ]),

      // Date of Birth
      dob: new FormControl('', Validators.required),

      // Email
      email: new FormControl('', [Validators.required, Validators.email]),

      // Client's phone number (can be any number of their choosing)
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern('^[+]?(?:[0-9]{2})?[0-9]{10}$')
      ]),

      // Address section
      addressStreet: new FormControl('', Validators.required),
      addressCity: new FormControl('', Validators.required),
      addressProv: new FormControl('', Validators.required),
      addressPcode: new FormControl('', [Validators.required]),
      addressCountry: new FormControl('', Validators.required),

      // Clients preferred language
      language: new FormControl(null, Validators.required),

      // PRI (handled in Patient with an extension)
      id: new FormControl('', [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(9)
      ]),

      // Job title (handled in Patient with an extension)
      jobTitle: new FormControl('', Validators.required),

      // Department they work in (handled in Patient with an extension)
      departmentName: new FormControl(null, Validators.required),

      // Branch they work in (handled in Patient with an extension)
      departmentBranch: new FormControl(null, Validators.required),

      // References related to the employee (handled in Patient with an extension)
      referenceOne: [''],
      referenceTwo: ['']
    });

    // tslint:disable-next-line:max-line-length
    // Validators.pattern('[abceghjklmnprstvxyABCEGHJKLMNPRSTVXY][0-9][abceghjklmnprstvwxyzABCEGHJKLMNPRSTVWXYZ] ?[0-9][abceghjklmnprstvwxyzABCEGHJKLMNPRSTVWXYZ][0-9]')]),
  }

  // callback function to set the branch list dropdown from the JSON included
  // TODO: change implementation to load from list of organizations
  setBranchList(data) {
    this.branches = data.branchlist;
  }

  // callback function to set the department list dropdown from the JSON included
  // TODO: change implementation to load from list of organizations
  setDepartments(data) {
    this.department = data.department;
  }

  // callback function to handle errors
  handleError(error) {
    console.log(error);
  }

  // Sets the employee when called. Builds a new Patient object, along with associated
  // objects, generates a unique ID to link patient resources (useful for linking)
  // employees & dependents

  setEmployee() {
    // Generate unique ID to link new Dependents created
    this.linkId = uuid();

    // Initialize all objects being used for the Patient resource
    this.employee = new Employee.Resource();
    this.employee_name = new Employee.Name();
    this.employee_address = new Employee.Address();
    this.employee_language = new Employee.Language();
    this.employee_language_coding = new Employee.Coding();
    this.employee_communication = new Employee.Communication();
    this.employee_identifier = new Employee.Identifier();
    this.employee_extension_jobtitle = new Employee.Extension();
    this.employee_extension_workplace = new Employee.Extension();
    this.employee_extension_branch = new Employee.Extension();
    this.employee_extension_crossreferenceone = new Employee.Extension();
    this.employee_extension_crossreferencetwo = new Employee.Extension();
    this.employee_extension_dependentlink = new Employee.Extension();
    this.employee_extension_type = new Employee.Extension();
    this.employee_telecom_email = new Employee.Telecom();
    this.employee_telecom_phone = new Employee.Telecom();

    // Employee identifer

    this.employee_identifier.use = 'official';
    this.employee_identifier.value = this.employeeFormGroup.get('id').value;
    this.employee_identifier.system =
      'https://bcip.smilecdr.com/fhir/employeeid';

    // Employee Address

    this.employee_address.city = this.employeeFormGroup
      .get('addressCity')
      .value.trim();
    this.employee_address.line = [
      this.employeeFormGroup.get('addressStreet').value.trim()
    ];
    this.employee_address.postalCode = this.employeeFormGroup
      .get('addressPcode')
      .value.trim();
    this.employee_address.country = this.employeeFormGroup
      .get('addressCountry')
      .value.trim();
    this.employee_address.state = this.employeeFormGroup
      .get('addressProv')
      .value.trim();

    // Extensions related to employment information

    // Job title extension

    this.employee_extension_jobtitle.url =
      'https://bcip.smilecdr.com/fhir/jobtile';
    this.employee_extension_jobtitle.valueString = this.employeeFormGroup.get(
      'jobTitle'
    ).value;

    // Workplace extension

    this.employee_extension_workplace.url =
      'https://bcip.smilecdr.com/fhir/workplace';
    this.employee_extension_workplace.valueString = this.employeeFormGroup.get(
      'departmentName'
    ).value;

    // Branch extension

    this.employee_extension_branch.url =
      'https://bcip.smilecdr.com/fhir/branch';
    this.employee_extension_branch.valueString = this.employeeFormGroup.get(
      'departmentBranch'
    ).value;

    // Cross Reference One extension

    this.employee_extension_crossreferenceone.url =
      'https://bcip.smilecdr.com/fhir/crossreferenceone';
    this.employee_extension_crossreferenceone.valueString = this.employeeFormGroup.get(
      'referenceOne'
    ).value;

    // Cross Reference Two extension

    this.employee_extension_crossreferencetwo.url =
      'https://bcip.smilecdr.com/fhir/crossreferencetwo';
    this.employee_extension_crossreferencetwo.valueString = this.employeeFormGroup.get(
      'referenceTwo'
    ).value;

    // Cross Reference One extension

    this.employee_extension_dependentlink.url =
      'https://bcip.smilecdr.com/fhir/dependentlink';
    this.employee_extension_dependentlink.valueString = this.linkId;

    // Type extension

    this.employee_extension_type.url =
      'https://bcip.smilecdr.com/fhir/employeetype';
    this.employee_extension_type.valueString = 'Employee';

    this.employee.extension = [
      this.employee_extension_branch,
      this.employee_extension_crossreferenceone,
      this.employee_extension_dependentlink,
      this.employee_extension_crossreferencetwo,
      this.employee_extension_jobtitle,
      this.employee_extension_workplace,
      this.employee_extension_type
    ];

    // Employe Name

    this.employee_name.family = this.employeeFormGroup.get('familyName').value;
    this.employee_name.given = [this.employeeFormGroup.get('givenName').value];

    // Language info

    if (
      this.employeeFormGroup.get('language').value.toLowerCase() === 'english'
    ) {
      this.employee_language_coding.code = 'en';
      this.employee_language_coding.system = 'urn:ietf:bcp:47';
      this.employee_language_coding.display = this.employeeFormGroup.get(
        'language'
      ).value;
    } else {
      this.employee_language_coding.code = 'fr';
      this.employee_language_coding.system = 'urn:ietf:bcp:47';
      this.employee_language_coding.display = this.employeeFormGroup.get(
        'language'
      ).value;
    }

    // Telecome (phone)

    this.employee_telecom_phone.system = 'phone';
    this.employee_telecom_phone.value = this.employeeFormGroup.get(
      'phoneNumber'
    ).value;
    this.employee_telecom_phone.use = 'work';

    // Telecome (email)

    this.employee_telecom_email.system = 'email';
    this.employee_telecom_email.value = this.employeeFormGroup.get(
      'email'
    ).value;
    this.employee_telecom_email.use = 'work';

    this.employee.identifier = [this.employee_identifier];
    this.employee_language.coding = [this.employee_language_coding];
    this.employee_communication.language = this.employee_language;
    this.employee.telecom = [
      this.employee_telecom_phone,
      this.employee_telecom_email
    ];
    this.employee.communication = [this.employee_communication];
    this.employee.birthDate = this.employeeFormGroup.get('dob').value;
    this.employee.resourceType = 'Patient';
    this.employee.name = this.employee_name;
    this.employee.address = [this.employee_address];

    // Stringify the final object
    const finalJSON = JSON.stringify(this.employee);

    // console.log(this.employeeFormGroup);
    // this.router.navigate(['/dashboard']);

    // console.log(this.employee)
    // console.log( JSON.stringify(this.employee))

    this.patientService.postPatientData(finalJSON).subscribe(data => {
      this.returnIDFromResponse(data),
        this.router.navigateByUrl('/clientsummary');
    });
  }

  returnToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  returnIDFromResponse(data) {
    const tempID = this.userService.getEmployeeSummaryID(data.id);
    return tempID;
  }
  goToSummary() {
    this.router.navigateByUrl('/employeesummary');
  }

  addDependent() {
    this.router.navigateByUrl('/dependentform');
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

  get id() {
    return this.employeeFormGroup.get('id');
  }

  get jobTitle() {
    return this.employeeFormGroup.get('jobTitle');
  }

  get departmentName() {
    return this.employeeFormGroup.get('departmentName');
  }

  get departmentBranch() {
    return this.employeeFormGroup.get('departmentBranch');
  }

  get referenceOne() {
    return this.employeeFormGroup.get('referenceOne');
  }

  get referenceTwo() {
    return this.employeeFormGroup.get('referenceTwo');
  }
}
