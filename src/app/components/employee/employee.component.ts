
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';

import { Router } from '@angular/router';
import { PatientService } from '../../service/patient.service';
import { TranslateService } from '@ngx-translate/core';
import * as Employee from '../../interface/employee';
import * as datepicker from 'js-datepicker';
import * as uuid from 'uuid';


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
  employeeFormGroup: FormGroup;
  clientFormGroup: FormGroup;
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

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

  dependents: any[];

  // Store list of Departments

  department: any;

  // Store list of Branches

  branches: any;


  // Store a UUID to link Employee and Dependent objects

  linkId;

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
  }

  accountTypes: AccountType[] = [
    { value: 'Employee', viewValue: 'Employee' },
    { value: 'Dependent', viewValue: 'Dependent' }
  ];


  ngOnInit() {

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


    // this.firstFormGroup = this.fb.group({
    //   firstCtrl: ['', Validators.required]
    // });
    // this.secondFormGroup = this.fb.group({
    //   secondCtrl: ['', Validators.required]
    // });

    // Initialize Employee Form Group for DOM

    this.employeeFormGroup = this.fb.group({
      resourceType: 'Patient',
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
      id: ['', [Validators.required]],
      jobTitle: ['', [Validators.required]],
      departmentName: ['', [Validators.required]],
      departmentBranch: ['', [Validators.required]],
      referenceOne: [''],
      referenceTwo: [''],
    });

    const retrievedObject = localStorage.getItem('employee');
    const parsedObject = JSON.parse( retrievedObject);
    console.log(parsedObject);

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

  setEmployee() {

    this.linkId = uuid();

    this.employee = new Employee.Resource;
    this.employee_name = new Employee.Name;
    this.employee_address = new Employee.Address;
    this.employee_language = new Employee.Language;
    this.employee_language_coding = new Employee.Coding;
    this.employee_communication = new Employee.Communication;
    this.employee_identifier = new Employee.Identifier;
    this.employee_extension_jobtitle = new Employee.Extension;
    this.employee_extension_workplace = new Employee.Extension;
    this.employee_extension_branch = new Employee.Extension;
    this.employee_extension_crossreferenceone = new Employee.Extension;
    this.employee_extension_crossreferencetwo = new Employee.Extension;
    this.employee_extension_dependentlink = new Employee.Extension;
    this.employee_extension_type = new Employee.Extension;
    this.employee_telecom_email = new Employee.Telecom;
    this.employee_telecom_phone = new Employee.Telecom;


    // Employee identifer

    this.employee_identifier.use = 'work';
    this.employee_identifier.value = this.employeeFormGroup.get('id').value;

    // Employee Address

    this.employee_address.city = this.employeeFormGroup.get('addressCity').value;
    this.employee_address.line = [this.employeeFormGroup.get('addressStreet').value];
    this.employee_address.postalcode = this.employeeFormGroup.get('addressPcode').value;
    this.employee_address.country = this.employeeFormGroup.get('addressCountry').value;
    this.employee_address.state = this.employeeFormGroup.get('addressProv').value;


    // Extensions related to employment information


    // Job title extension

    this.employee_extension_jobtitle.url = 'https://bcip.smilecdr.com/fhir/jobtile';
    this.employee_extension_jobtitle.valueString = this.employeeFormGroup.get('jobTitle').value;


    // Workplace extension

    this.employee_extension_workplace.url = 'https://bcip.smilecdr.com/fhir/workplace';
    this.employee_extension_workplace.valueString = this.employeeFormGroup.get('departmentName').value;

    // Branch extension

    this.employee_extension_branch.url = 'https://bcip.smilecdr.com/fhir/branch';
    this.employee_extension_branch.valueString = this.employeeFormGroup.get('departmentBranch').value;

    // Cross Reference One extension

    this.employee_extension_crossreferenceone.url = 'https://bcip.smilecdr.com/fhir/crossreferenceone';
    this.employee_extension_crossreferenceone.value = this.employeeFormGroup.get('referenceOne').value;

    // Cross Reference Two extension

    this.employee_extension_crossreferencetwo.url = 'https://bcip.smilecdr.com/fhir/crossreferencetwo';
    this.employee_extension_crossreferencetwo.valueString = this.employeeFormGroup.get('referenceTwo').value;

    // Cross Reference One extension

    this.employee_extension_dependentlink.url = 'https://bcip.smilecdr.com/fhir/dependentlink';
    this.employee_extension_dependentlink.valueString = this.linkId;

    // Type extension

    this.employee_extension_type.url = 'https://bcip.smilecdr.com/fhir/employeetype';
    this.employee_extension_type.valueString = this.employeeFormGroup.get('type').value;

    this.employee.extension = [
      this.employee_extension_branch,
      this.employee_extension_crossreferenceone,
      this.employee_extension_dependentlink,
      this.employee_extension_crossreferencetwo,
      this.employee_extension_jobtitle,
      this.employee_extension_workplace
    ];

    // Employe Name

    this.employee_name.family = this.employeeFormGroup.get('familyName').value;
    this.employee_name.given = [this.employeeFormGroup.get('givenName').value];

    // Language info

    if (this.employeeFormGroup.get('language').value === 'English' || this.employeeFormGroup.get('language').value === 'english') {
      this.employee_language_coding.code = 'en';
      this.employee_language_coding.system = 'urn:ietf:bcp:47';
      this.employee_language_coding.display = this.employeeFormGroup.get('language').value;
    }

    // Telecome (phone)

    this.employee_telecom_phone.system = 'phone';
    this.employee_telecom_phone.value = this.employeeFormGroup.get('phoneNumber').value;
    this.employee_telecom_phone.use = 'work';

    // Telecome (email)

    this.employee_telecom_email.system = 'email';
    this.employee_telecom_email.value = this.employeeFormGroup.get('email').value;
    this.employee_telecom_email.use = 'work';

    this.employee.identifer = [this.employee_identifier];
    this.employee_language.coding = [this.employee_language_coding];
    this.employee_communication.language = this.employee_language;
    this.employee.telecom = [this.employee_telecom_phone, this.employee_telecom_email];
    this.employee.communication = [this.employee_communication];
    this.employee.birthDate = this.employeeFormGroup.get('dob').value;
    this.employee.resourceType = 'Patient';
    this.employee.name = this.employee_name;
    this.employee.address = [this.employee_address];

    const finalJSON = JSON.stringify(this.employee);
    this.patientService.postPatientData(finalJSON);

    localStorage.removeItem('employee');
    localStorage.setItem('employee', finalJSON);

    this.router.navigate(['/dashboard']);

    console.log(finalJSON);

  }

  printData(data) {
    console.log (data);
  }

  resetData() {
    this.employee = new Employee.Resource;
    this.employee_name = new Employee.Name;
    this.employee_address = new Employee.Address;
    this.employee_language = new Employee.Language;
    this.employee_language_coding = new Employee.Coding;
    this.employee_communication = new Employee.Communication;
    this.employee_identifier = new Employee.Identifier;
    this.employee_extension_jobtitle = new Employee.Extension;
    this.employee_extension_workplace = new Employee.Extension;
    this.employee_extension_branch = new Employee.Extension;
    this.employee_extension_crossreferenceone = new Employee.Extension;
    this.employee_extension_crossreferencetwo = new Employee.Extension;
    this.employee_extension_dependentlink = new Employee.Extension;
    this.employee_telecom_email = new Employee.Telecom;
    this.employee_telecom_phone = new Employee.Telecom;

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
