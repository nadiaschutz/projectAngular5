import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { OAuthService } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';
import { TranslateService } from '@ngx-translate/core';

import * as FHIR from '../../interface/FHIR';
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

  minDate;
  maxDate;

  datePickerConfig: Partial<BsDatepickerConfig>;
  employee;
  dependentFormGroup: FormGroup;
  showSuccessMessage = false;
  showFailureMessage = false;
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

  languageList: LanguageType[] = [
    { value: 'English', viewValue: 'English' },
    { value: 'French', viewValue: 'French' },

  ];

  provinces = ['Alberta', 'British Columbia',
    'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
    'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario',
    'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'];

  ngOnInit() {
    this.datePickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'YYYY-MM-DD',
        showWeekNumbers: false
      });

    this.employee = JSON.parse(sessionStorage.getItem('patientSelected'));

    this.dependentFormGroup = this.fb.group({

      familyName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      givenName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      dob: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern('^[+]?(?:[0-9]{2})?[0-9]{10}$')
      ]),
      addressStreet: new FormControl('', Validators.required),
      addressCity: new FormControl('', Validators.required),
      addressProv: new FormControl('', Validators.required),
      addressPcode: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6)]),
      addressCountry: new FormControl('', Validators.required),
      language: new FormControl(null, Validators.required),
    });
  }

  setDependent() {

    const dependent = new FHIR.Patient;
    const address = new FHIR.Address;
    const dependentExtension = new FHIR.Extension;
    const employeeTypeExtension = new FHIR.Extension;
    const phone = new FHIR.ContactPoint;
    const email = new FHIR.ContactPoint;
    const name = new FHIR.HumanName;
    const communication = new FHIR.PatientCommunication;
    const languageCodeableConcept = new FHIR.CodeableConcept;
    const languageCoding = new FHIR.Coding;
    const extensionsArray = [];

    dependentExtension.url = this.employee['linkId']['url'];
    dependentExtension.valueString = this.employee['linkId']['valueString'];

    employeeTypeExtension.url = 'https://bcip.smilecdr.com/fhir/employeetype';
    employeeTypeExtension.valueString = 'Dependent';

    extensionsArray.push(dependentExtension, employeeTypeExtension);

    address.city = this.dependentFormGroup.get('addressCity').value;
    address.line = [this.dependentFormGroup.get('addressStreet').value];
    address.postalCode = this.dependentFormGroup.get('addressPcode').value;
    address.country = this.dependentFormGroup.get('addressCountry').value;
    address.state = this.dependentFormGroup.get('addressProv').value;

    name.family = this.dependentFormGroup.get('familyName').value;
    name.given = [this.dependentFormGroup.get('givenName').value];

    if (this.dependentFormGroup.get('language').value.toLowerCase() === 'english') {
      languageCoding.code = 'en';
    } else {
      languageCoding.code = 'fr';
    }
    languageCoding.system = 'urn:ietf:bcp:47';
    languageCoding.display = this.dependentFormGroup.get('language').value;
    languageCodeableConcept.coding = [languageCoding];
    communication.language = languageCodeableConcept;

    phone.system = 'phone';
    phone.value = this.dependentFormGroup.get('phoneNumber').value;
    phone.use = 'work';

    email.system = 'email';
    email.value = this.dependentFormGroup.get('email').value;
    email.use = 'work';

    dependent.extension = extensionsArray;
    dependent.address = address;
    dependent.name = [name];
    dependent.resourceType = 'Patient';
    dependent.telecom = [phone, email];
    dependent.communication = [communication];
    dependent.birthDate = formatDate(this.dependentFormGroup.get('dob').value, 'yyyy-MM-dd', 'en');

    const finalJSON = JSON.stringify(dependent);

    this.patientService.postPatientData(finalJSON).subscribe(data => {
      this.returnIDFromResponse(data);
      this.router.navigateByUrl('/clientsummary');
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

  handleError(error) {
    console.log(error);
  }

}
