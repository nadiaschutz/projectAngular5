import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';

import { OAuthService } from 'angular-oauth2-oidc';

import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';
import { AdminHomeScreenService } from '../../service/admin-home-screen.service';

import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as Employee from '../../interface/patient';
import * as uuid from 'uuid';
import { formatDate } from '@angular/common';
import { distinctUntilChanged } from 'rxjs/operators';
import { FHIRElement } from '../../interface/FHIR';
import * as FHIR from '../../interface/FHIR';

export interface AccountType {
  value: string;
  viewValue: string;
}

export interface LanguageType {
  value: string;
  viewValue: string;
}

export interface NameValueLookup {
  text?: string;
  value?: string;
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
  dependentsArray: any[];
  department: any = [];
  branches: any;
  jobLocationList: NameValueLookup[] = [];
  employeeDepartmentList: NameValueLookup[] = [];
  currentRole;
  showSuccessMessage = false;
  showFailureMessage = false;
  failureMessage = '';

  // list of  Languages
  languages = ['English', 'French'];

  // list of Provinces and territories in alphabetical order
  // tslint:disable-next-line:max-line-length
  provinces = ['Alberta', 'British Columbia',
    'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
    'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario',
    'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'];


  minDate: Date;
  maxDate: Date;

  constructor(
    private fb: FormBuilder,
    public translate: TranslateService,
    private oauthService: OAuthService,
    private userService: UserService,
    private patientService: PatientService,
    private adminHomeScreenService: AdminHomeScreenService,
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

    this.showSuccessMessage = false;
    this.showFailureMessage = false;
    this.currentRole = sessionStorage.getItem('userRole');
    this.datePickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'YYYY-MM-DD',
        showWeekNumbers: false
      });

    this.dependentsArray = new Array();
    // Set Department List

    // Initialize Employee Form Group for DOM

    this.employeeFormGroup = this.fb.group({
      familyName: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ]),

      // First Name
      givenName: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ]),
      dob: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [
        Validators.required,
        // Validators.pattern('/^[1-9]{1}[0-9]{9}$/')
        Validators.minLength(10),
        Validators.maxLength(10),
      ]),
      addressStreet: new FormControl('', Validators.required),
      addressCity: new FormControl('', Validators.required),
      addressProv: new FormControl('', Validators.required),
      addressPcode: new FormControl('', [Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6)
      ]),
      addressCountry: new FormControl('', [Validators.required]),
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

    });

    this.onChanges();
    this.getAndSetDepartmentList();

  }


  // callback function to handle errors
  handleError(error) {
    console.log(error);
  }


  extractKeyValuePairsFromBundle(bundle) {
    if (bundle && bundle['entry']) {
      const bundleEntries = bundle['entry'];

      const list = bundleEntries.map(item => {
        if (item && item.resource) {
          const temp = {
            value: item.resource.resourceType + '/' + item.resource.id,
            text: item.resource.name
          };

          return temp;
        }
        return { value: null, text: null };
      });

      return list;
    }

    return [];
  }

  getAndSetDepartmentList() {
    let arrToSort = [];
    this.adminHomeScreenService.getDepartmentNames()
      .subscribe(bundle => {
        console.log('employee department => ', bundle);
        arrToSort = this.extractKeyValuePairsFromBundle(bundle);
        console.log(arrToSort);
        this.employeeDepartmentList = arrToSort.sort((obj1, obj2) => {
          const textA = obj1.text.toUpperCase();
          const textB = obj2.text.toUpperCase();
          if (textA > textB) {
            return 1;
          }
          if (textA < textB) {
            return -1;
          }
          return 0;
        });


      },
        (err) => console.log('Employee Department list error', err));
  }

  onChanges(): void {
    console.log(this.employeeFormGroup.get('departmentName'));

    // listen to one aprticular field for form change
    this.employeeFormGroup.get('departmentName')
      .valueChanges
      // .pipe(distinctUntilChanged((a, b) => {
      //   return JSON.stringify(a) === JSON.stringify(b);
      // }))
      .subscribe(val => {
        if (val !== '') {
          console.log(val);
          // get job locations dropdown items
          this.adminHomeScreenService.getJobLocations({ organization: val })
            .subscribe(locations => {
              console.log('job list =>', locations);
              this.jobLocationList = this.extractKeyValuePairsFromBundle(locations);
              this.employeeFormGroup.get('departmentBranch').enable();
              console.log(this.jobLocationList);
            },
              (err) => {
                console.log('Job locations list error => ', err);
              });
        } else {
          this.employeeFormGroup.get('departmentBranch').disable();
          this.jobLocationList = [];
        }
      });
  }

  // Sets the employee when called. Builds a new Patient object, along with associated
  // objects, generates a unique ID to link patient resources (useful for linking)
  // employees & dependents
  async saveEmployee() {
    const employeePRI = this.employeeFormGroup.value.id;
    const employeeWithPRI = await this.patientService.getEmployeeWithPRIAsync(employeePRI);
    if (employeeWithPRI['entry']) {
      // An employee records exists with the same PRI
      this.showSuccessMessage = false;
      this.showFailureMessage = true;
      this.failureMessage = 'An employee with the same PRI exists';
    } else {
      const employee = new FHIR.Patient;
      employee.resourceType = 'Patient';

      // Identifier
      const identifier = new FHIR.Identifier;
      identifier.use = 'official';
      identifier.system = 'https://bcip.smilecdr.com/fhir/employeeid';
      identifier.value = this.employeeFormGroup.value.id;
      employee.identifier = [identifier];

      // Address
      const address = new FHIR.Address;
      address.city = this.employeeFormGroup.value.addressCity.trim();
      address.line = [this.employeeFormGroup.value.addressStreet.trim()];
      address.postalCode = this.employeeFormGroup.value.addressPcode.trim();
      address.country = this.employeeFormGroup.value.addressCountry.trim();
      address.state = this.employeeFormGroup.value.addressProv.trim();
      employee.address = address;

      // Extensions
      const extensionsArray = [];

      // Job Title
      const jobTitleExtension = new FHIR.Extension;
      jobTitleExtension.url = 'https://bcip.smilecdr.com/fhir/jobtile';
      jobTitleExtension.valueString = this.employeeFormGroup.get('jobTitle').value;
      extensionsArray.push(jobTitleExtension);

      // Client Department
      const departmentExtension = new FHIR.Extension;
      const departmentReference = new FHIR.Reference;
      departmentExtension.url = 'https://bcip.smilecdr.com/fhir/workplace';
      departmentReference.reference = this.employeeFormGroup.get('departmentName').value;
      departmentExtension.valueReference = departmentReference;
      extensionsArray.push(departmentExtension);

      // Branch
      const branchExtension = new FHIR.Extension;
      const branchReference = new FHIR.Reference;
      branchReference.reference = this.employeeFormGroup.get('departmentBranch').value;
      branchExtension.url = 'https://bcip.smilecdr.com/fhir/branch';
      branchExtension.valueReference = branchReference;
      extensionsArray.push(branchExtension);

      // Cross Reference One extension
      const crossRefOneExtension = new FHIR.Extension;
      crossRefOneExtension.url = 'https://bcip.smilecdr.com/fhir/crossreferenceone';
      crossRefOneExtension.valueString = this.employeeFormGroup.get('referenceOne').value;
      extensionsArray.push(crossRefOneExtension);

      // Cross Reference Two extension
      const crossRefTwoExtension = new FHIR.Extension;
      crossRefTwoExtension.url = 'https://bcip.smilecdr.com/fhir/crossreferencetwo';
      crossRefTwoExtension.valueString = this.employeeFormGroup.get('referenceTwo').value;
      extensionsArray.push(crossRefTwoExtension);

      // Dependent extension
      const dependentExtension = new FHIR.Extension;
      dependentExtension.url = 'https://bcip.smilecdr.com/fhir/dependentlink';
      dependentExtension.valueString = uuid();
      extensionsArray.push(dependentExtension);

      // Type extension
      const employeeTypeExtension = new FHIR.Extension;
      employeeTypeExtension.url = 'https://bcip.smilecdr.com/fhir/employeetype';
      employeeTypeExtension.valueString = 'Employee';
      extensionsArray.push(employeeTypeExtension);

      employee.extension = extensionsArray;

      // Employee name
      const name = new FHIR.HumanName;
      name.family = this.employeeFormGroup.value.familyName;
      name.given = [this.employeeFormGroup.value.givenName];
      employee.name = [name];

      // Language
      const communication = new FHIR.PatientCommunication;
      const languageCodeableConcept = new FHIR.CodeableConcept;
      const languageCoding = new FHIR.Coding;
      if (this.employeeFormGroup.value.language.toLowerCase() === 'english') {
        languageCoding.code = 'en';
      } else {
        languageCoding.code = 'fr';
      }
      languageCoding.system = 'urn:ietf:bcp:47';
      languageCoding.display = this.employeeFormGroup.value.language;
      languageCodeableConcept.coding = [languageCoding];
      communication.language = languageCodeableConcept;
      employee.communication = [communication];

      // Telecom
      const phone = new FHIR.ContactPoint;
      phone.system = 'phone';
      phone.value = this.employeeFormGroup.value.phoneNumber;
      phone.use = 'work';

      const email = new FHIR.ContactPoint;
      email.system = 'email';
      email.value = this.employeeFormGroup.value.email;
      email.use = 'work';

      employee.telecom = [phone, email];

      // Date of birth
      employee.birthDate = formatDate(this.employeeFormGroup.value.dob, 'yyyy-MM-dd', 'en');
      const employeeJSON = JSON.stringify(employee);
      this.patientService.postPatientData(employeeJSON).subscribe(data => {
        console.log(data);
        this.showFailureMessage = false;
        this.showSuccessMessage = true;
      });
    }
  }

  returnToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  goToSummary() {
    this.router.navigateByUrl('/employeesummary');
  }

  addDependent() {
    this.router.navigateByUrl('/dependentform');
  }

}
