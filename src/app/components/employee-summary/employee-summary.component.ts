import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  NgControlStatusGroup
} from '@angular/forms';
import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';
import { Router } from '@angular/router';
import { QrequestService } from 'src/app/service/qrequest.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { TranslateService } from '@ngx-translate/core';
import { TitleCasePipe } from '@angular/common';

import * as Employee from '../../interface/patient';
// import { Language } from 'src/app/interface/employee';
export interface LanguageType {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-employee-summary',
  templateUrl: './employee-summary.component.html',
  styleUrls: ['./employee-summary.component.scss']
})

export class EmployeeSummaryComponent implements OnInit {
  summaryId = '';
  // linkID = 'a44109ad-e58b-47cd-b348-7556e4d2c117';
  linkID = '';
  selected;
  employeetype;
  dependentArray = [];
  servceRequestDatas = [];
  cursorClassEnables;

  // jobTitle;

  regionalOffices = [];
  districtOffices = [];
  deptName = [];
  deptBranch = [];

  confirmSubmit = false;
  successHeaderCheck;
  activateSubmitButton = null;

  editEmployee;

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
  // provinces = 


  // list of countries
  countries = ['Canada'];

  minDate: Date;
  maxDate: Date;



  constructor(
    public translate: TranslateService,
    private titleCase: TitleCasePipe,
    private fb: FormBuilder,
    private userService: UserService,
    private patientService: PatientService,
    private router: Router,
    private qrequestService: QrequestService
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

  languageList: LanguageType[] = [
    { value: 'English', viewValue: 'English' },
    { value: 'French', viewValue: 'French' }
  ];

  provinces: LanguageType[] = [
    { value: 'Alberta', viewValue: 'Alberta' },
    { value: 'British Columbia', viewValue: 'British Columbia' },
    { value: 'Manitoba', viewValue: 'Manitoba' },
    { value: 'New Brunswick', viewValue: 'New Brunswick' },
    { value: 'Newfoundland and Labrador', viewValue: 'Newfoundland and Labrador' },
    { value: 'Northwest Territories', viewValue: 'Northwest Territories' },
    { value: 'Nova Scotia', viewValue: 'Nova Scotia' },
    { value: 'Nunavut', viewValue: 'Nunavut' },
    { value: 'Ontario', viewValue: 'Ontario' },
    { value: 'Prince Edward Island', viewValue: 'Prince Edward Island' },
    { value: 'Quebec', viewValue: 'Quebec' },
    { value: 'Saskatchewan', viewValue: 'Saskatchewan' },
    { value: 'Yukon', viewValue: 'Yukon' }]; 
    
  ngOnInit() {

    /**
     * Initializes list for regional offices on our system
     */
    this.userService
      .fetchAllRegionalOffices()
      .subscribe(
        data => this.populateRegionalOffices(data),
        error => this.handleError(error)
      );

    /**
     * Initializes list for district offices on our system
     */
    this.userService
      .fetchAllDistrictOffices()
      .subscribe(
        data => this.populateDistrictOffices(data),
        error => this.handleError(error)
      );

    /**
     * Initializes the names of all departments on our system
     */
    this.userService.fetchAllDepartmentNames().subscribe (
      data => this.populateDeptNames(data),
      error => this.handleError(error)
    );

    /**
     * Initializes the list of branches from our system
     */
    this.userService.fetchAllDepartmentBranches().subscribe (
      data => this.populateDeptBranches(data),
      error => this.handleError(error)
    );

    this.summaryId = this.userService.returnSelectedID();
    this.userService.getEmployeeSummaryID(this.summaryId);
    if (this.summaryId) {
      this.patientService
        .getPatientDataByID(this.summaryId)
        .subscribe(
          data => this.populatePatientArray(data),
          error => this.handleError(error)
        );
    } else if (!this.summaryId) {
      this.router.navigateByUrl('/dashboard');
    }

    // if (this.selected) {
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
          Validators.pattern('^\d{3}-?\d{3}-?\d{4}$')
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
        referenceOne: [''],
        referenceTwo: ['']
      });
    // }

  }

  populatePatientArray(data) {
    this.linkID = '';
    // this.selected = data;
    const temp = {};

    temp['given'] = data['name'][0]['given'][0];
    temp['family'] = data['name'][0]['family'];
    temp['dob'] = data['birthDate'];
    temp['identifier'] = {};
    if (data['identifier']) {
      data['identifier'].forEach(identifier => {
        temp['identifier']['use'] = identifier['use'];
        temp['identifier']['system'] = identifier['system'];
        temp['identifier']['value'] = identifier['value'];
      });
    }
    data['extension'].forEach(extension => {
      if (extension['url'] === 'https://bcip.smilecdr.com/fhir/workplace') {
        temp['department'] = {};
        temp['department']['url'] = extension.url;
        temp['department']['valueString'] = extension.valueString;
      }
    });
    data['extension'].forEach(extension => {
      if (extension['url'] === 'https://bcip.smilecdr.com/fhir/jobtile') {
        temp['jobtitle'] = {};
        temp['jobtitle']['url'] = extension.url;
        temp['jobtitle']['valueString'] = extension.valueString;
      }
    });
    data['extension'].forEach(extension => {
      if (extension['url'] === 'https://bcip.smilecdr.com/fhir/employeetype') {
        temp['employeeType'] = {};
        temp['employeeType']['url'] = extension.url;
        temp['employeeType']['valueString'] = extension.valueString;
      }
    });
    data['extension'].forEach(extension => {
      if (extension['url'] === 'https://bcip.smilecdr.com/fhir/branch') {
        temp['branch'] = {};
        temp['branch']['url'] = extension.url;
        temp['branch']['valueString'] = extension.valueString;
      }
    });
    data['extension'].forEach(extension => {
      if (extension['url'] === 'https://bcip.smilecdr.com/fhir/dependentlink') {
        temp['linkID'] = {};
        temp['linkID']['url'] = extension.url;
        temp['linkID']['valueString'] = extension.valueString;
      }
    });
    data['extension'].forEach(extension => {
      if (
        extension['url'] === 'https://bcip.smilecdr.com/fhir/crossreferenceone'
      ) {
        temp['crossref1'] = {};
        temp['crossref1']['url'] = extension.url;
        temp['crossref1']['valueString'] = extension.valueString;
      }
    });
    data['extension'].forEach(extension => {
      if (
        extension['url'] === 'https://bcip.smilecdr.com/fhir/crossreferencetwo'
      ) {
        temp['crossref2'] = {};
        temp['crossref2']['url'] = extension.url;
        temp['crossref2']['valueString'] = extension.valueString;
      }
    });

    temp['telecom'] = [];
    temp['address'] = [];

    data['address'].forEach(address => {
      temp['address'].push(address);
    });

    temp['communication'] = data['communication'];

    data['telecom'].forEach(telecom => {
      temp['telecom'].push(telecom);
    });
    temp['telecom'] = data['telecom'];
    this.selected = temp;

    this.patientService
      .getPatientByLinkID(this.selected['linkID']['valueString'])
      .subscribe(
        dataPatient => this.populateDependentArray(dataPatient),
        error => this.handleError(error)
      );

    this.qrequestService
      .getServReqForClient(this.summaryId)
      .subscribe(
        dataSerReq => this.getServReqData(dataSerReq),
        error => this.getServReqDataError(error)
      );
  }

  selectedPatient(event: any) {
    console.log(event.target.value);
  }

  addDependent() {
    this.router.navigateByUrl('/dependentform');
  }

  newServiceRequest() {
    this.router.navigate(['/newservicerequest']);
  }
  handleError(error) {
    console.log(error);
  }

  backToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  populateDependentArray(data) {
    this.dependentArray = [];
    if (this.selected['employeeType']['valueString'] === 'Employee') {

      data.entry.forEach(element => {
        const individualEntry = element.resource;
        for (const extensions of individualEntry.extension) {
          if (extensions.valueString === 'Dependent') {
            console.log('yup, theres a dependent');
            const temp = {};
            temp['id'] = individualEntry['id'];
            temp['given'] = individualEntry['name'][0]['given'][0];
            temp['family'] = individualEntry['name'][0]['family'];
            this.dependentArray.push(temp);
          }
        }
      });
    } else {
      this.dependentArray = [];
      data.entry.forEach(element => {
        const individualEntry = element.resource;
        for (const extensions of individualEntry.extension) {
          if (extensions.valueString === 'Employee') {
            const temp = {};
            temp['id'] = individualEntry['id'];
            temp['given'] = individualEntry['name'][0]['given'][0];
            temp['family'] = individualEntry['name'][0]['family'];
            this.dependentArray.push(temp);
          }
        }
      });
    }
    // if (data.entry) {
    //   data.entry.forEach(element => {
    //     const individualEntry = element.resource;
    //     for (const extension of individualEntry.extension) {
    //       if (extension.valueString === 'Dependent') {
    //         this.dependentArray.push(individualEntry);
    //       }
    //     }
    //   });
    // }
  }

  routeToSummary(data) {
    this.selected = '';
    this.dependentArray = [];
    this.summaryId = data;
    this.userService.getSelectedID(data);
    this.patientService
        .getPatientDataByID(this.summaryId)
        .subscribe(
          dataNew => this.populatePatientArray(dataNew),
          error => this.handleError(error)
        );
  }
  getServReqData(data) {
    console.log(data.entry);
    if (data.entry) {
      this.servceRequestDatas = data.entry;
    }
  }

  getServReqDataError(error) {
    console.log(error);
  }

  getServiceType(serviceRequestObj): string {
    let result = '-';
    // console.log(serviceRequestObj);
    // console.log(serviceRequestObj.questionnaire.reference);
    if (serviceRequestObj.resource.item) {
      // console.log(serviceRequestObj.resource.item);
      serviceRequestObj.resource.item.forEach(item => {
        if (item.text === 'PSOHP Service') {
          if (item['answer']) {
            result = item.answer[0].valueString.substring(
              item.answer[0].valueString.indexOf('(') + 1,
              item.answer[0].valueString.length
            );
            result = result.substring(0, result.length - 1);
            // console.log(result);
          }
        }
      });
    }
    return result;
  }

  getAssessmentType(serviceRequestObj): string {
    return this.getLinkValueFromObject(serviceRequestObj, 'PSOHP Service', 2);
  }

  getLinkValueFromObject(serviceRequestObj, text: string, dashNum): string {
    let result = '-';
    if (serviceRequestObj.resource.item) {
      serviceRequestObj.resource.item.forEach(item => {
        // console.log(item);
        if (item.text === text) {
          if (item['answer']) {
            if (item.answer[0].valueString.indexOf('-') > 0) {
              if (dashNum === 1) {
                result = item.answer[0].valueString.substring(
                  0,
                  item.answer[0].valueString.indexOf('-')
                );
              }
              if (dashNum === 2) {
                result = item.answer[0].valueString.substring(
                  item.answer[0].valueString.indexOf('-') + 1
                );
                result = result.substring(0, result.indexOf('-'));
              }
            } else {
              result = item.answer[0].valueString;
            }
          }
        }
      });
    }
    return result;
  }

  /**
   * Used in conjunction with the user service. Gets all Regional Offices
   * stored on the server to link to a Practitioner.
   * @param data
   */
  populateRegionalOffices(data: any) {
    data.entry.forEach(element => {
      this.regionalOffices.push(element.resource);
    });
  }

  /**
   * Used in conjunction with the user service. Gets all District Offices
   * stored on the server to link to a Practitioner.
   * @param data
   */
  populateDistrictOffices(data: any) {
    data.entry.forEach(element => {
      this.districtOffices.push(element.resource);
    });
  }

  /**
   * Used in conjunction with the user service. Gets all Department Names
   * stored on the server to link to a Practitioner.
   * @param data
   */
  populateDeptNames(data: any) {
    data.entry.forEach(element => {
      this.deptName.push(element.resource);
    });
  }

  /**
   * Used in conjunction with the user service. Gets all Department Branches
   * stored on the server to link to a Practitioner.
   * @param data
   */
  populateDeptBranches(data: any) {
    data.entry.forEach(element => {
      this.deptBranch.push(element.resource);
    });
  }

  editEmployeeToggle() {
    this.editEmployee = !this.editEmployee;
    this.employeeFormGroup.controls['familyName'].patchValue(this.selected['family']);
    this.employeeFormGroup.controls['givenName'].patchValue(this.selected['given']);
    this.employeeFormGroup.controls['dob'].patchValue(this.selected['dob']);
    this.employeeFormGroup.controls['id'].patchValue(this.selected['id']);
    this.selected['telecom'].forEach(tele => {
      if (tele['system'] === 'email') {
        this.employeeFormGroup.controls['email'].patchValue(tele['value']);
      }
      if (tele['system'] === 'phone') {
        this.employeeFormGroup.controls['phoneNumber'].patchValue(tele['value']);
      }
    });
    this.selected['communication'].forEach(language => {
      language['language']['coding'].forEach(usedLanguage => {
        this.employeeFormGroup.controls['language'].patchValue(usedLanguage['display']);
      });
    });
    this.selected['address'].forEach(address => {
      this.employeeFormGroup.controls['addressStreet'].patchValue(address['line'][0]);
      this.employeeFormGroup.controls['addressCity'].patchValue(address.city);
      this.employeeFormGroup.controls['addressProv'].patchValue(this.titleCase.transform(address.state));
      this.employeeFormGroup.controls['addressPcode'].patchValue(address.postalCode);
      this.employeeFormGroup.controls['addressCountry'].patchValue(address.country);
    });
    
    console.log(this.employeeFormGroup['value']);
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
