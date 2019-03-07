import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  NgControlStatusGroup
} from '@angular/forms';

import { OAuthService } from 'angular-oauth2-oidc';

import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';

import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as Employee from '../../interface/patient';
import * as uuid from 'uuid';
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
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {
  datePickerConfig: Partial<BsDatepickerConfig>;

  // Declaration for Employree form group object

  employeeFormGroup: FormGroup;


  // Employee base object

  employee;
  employee_name;
  employee_address;
  employee_telecom_phone;
  employee_telecom_email;
  employee_extension_dependentlink;
  employee_extension_jobtitle;
  employee_extension_workplace;
  employee_extension_branch;
  employee_extension_type;
  employee_extension_crossreferenceone;
  employee_extension_crossreferencetwo;
  employee_language;
  employee_language_coding;
  employee_communication;
  employee_identifier;
  employee_identifier_type;
  dependentsArray: any[];
  department: any = [];
  branches: any;

  // Store a UUID to link Employee and Dependent objects

  linkId;

  // list of  Languages
  languages = ['English', 'French'];

  // list of Provinces and territories in alphabetical order
  // tslint:disable-next-line:max-line-length
  provinces = ['Alberta', 'British Columbia',
  'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario',
  'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'];


  // list of countries
  countries = ['Canada'];

  minDate: Date;
  maxDate: Date;

  currentUserDepartment: string;
  // currentUserDepartmentTEST = 'BARSIK';
  currentUserBranch: string;


  i;
  constructor(
    private fb: FormBuilder,
    public translate: TranslateService,
    private oauthService: OAuthService,
    private userService: UserService,
    private patientService: PatientService,
    private router: Router,
    private bsDatepickerConfig: BsDatepickerConfig
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

    this.currentUserDepartment = sessionStorage.getItem('userDept');
    this.currentUserBranch = sessionStorage.getItem('userBranch');

    this.datePickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'YYYY-MM-DD',
        showWeekNumbers: false
      });

    this.dependentsArray = new Array();
    this.i = 0;
    // Set Department List

    this.userService
      .fetchAllDepartmentNames().subscribe(
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
        // Validators.pattern('/^[1-9]{1}[0-9]{9}$/')
        Validators.minLength(10),
        Validators.maxLength(10),
      ]),
      // Address section
      addressStreet: new FormControl('', Validators.required),
      addressCity: new FormControl('', Validators.required),
      addressProv: new FormControl('', Validators.required),
      addressPcode: new FormControl('', [Validators.required]),
      addressCountry: new FormControl('', Validators.required),

      // Clients preferred language
      language: new FormControl('', Validators.required),

      // PRI (handled in Patient with an extension)
      id: new FormControl('', [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(9)
      ]),

      // Job title (handled in Patient with an extension)
      jobTitle: new FormControl('', Validators.required),

      // Department they work in (handled in Patient with an extension)
      departmentName: new FormControl('', Validators.required),


      // Branch they work in (handled in Patient with an extension)
      departmentBranch: new FormControl('', Validators.required),

      // References related to the employee (handled in Patient with an extension)
      referenceOne: new FormControl(''),
      referenceTwo: new FormControl('')
      // referenceTwo: ['']

      // departmentName.setValue(this.options[0]);
    });

    // this.employeeFormGroup.setValue({
    //   familyName: null,
    //   givenName: null,
    //   dob: null,
    //   email: null,
    //   phoneNumber: null,
    //   addressStreet: null,
    //   addressCity: null,
    //   addressProv: null,
    //   addressPcode: null,
    //   addressCountry: null,
    //   jobTitle: null,
    //   id: null,
    //   departmentName: this.currentUserDepartment,
    //   departmentBranch: this.currentUserBranch
    // });

    // tslint:disable-next-line:max-line-length
    // Validators.pattern('[abceghjklmnprstvxyABCEGHJKLMNPRSTVXY][0-9][abceghjklmnprstvwxyzABCEGHJKLMNPRSTVWXYZ] ?[0-9][abceghjklmnprstvwxyzABCEGHJKLMNPRSTVWXYZ][0-9]')]),
  }

  onChange(e) {
    console.log(e);
  }

  // callback function to set the branch list dropdown from the JSON included
  // TODO: change implementation to load from list of organizations
  setBranchList(data) {
    this.branches = data.branchlist;
  }

  // callback function to set the department list dropdown from the JSON included
  // TODO: change implementation to load from list of organizations
  setDepartments(data) {
    console.log(data.entry, this.department);

    data.entry.forEach(element => {
      this.department.push(element['resource']['name']);
    });
    // this.department = data.department;
  }

  // populateDeptNames(data: any) {
  //   data.entry.forEach(element => {
  //     this.departmentList.push(element['resource']['name']);
  //   });
  // }

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
    // this.employee_created_by = new Employee.Identifier();
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


    // created by

    // this.employee_created_by

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
    this.employee.birthDate = formatDate(this.employee.birthDate, 'yyyy-MM-dd', 'en');
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
