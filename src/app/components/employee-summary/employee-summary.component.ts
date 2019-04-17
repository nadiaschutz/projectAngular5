import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { AdminHomeScreenService } from '../../service/admin-home-screen.service';
import { UtilService } from '../../service/util.service';
import { TranslateService } from '@ngx-translate/core';
import { TitleCasePipe } from '@angular/common';
import { distinctUntilChanged } from 'rxjs/operators';
import * as FHIR from '../../interface/FHIR';

import { formatDate } from '@angular/common';
// import { Language } from 'src/app/interface/employee';
export interface LanguageType {
  value: string;
  viewValue: string;
}
export interface NameValueLookup {
  text?: string;
  value?: string;
}

@Component({
  selector: 'app-employee-summary',
  templateUrl: './employee-summary.component.html',
  styleUrls: ['./employee-summary.component.scss']
})
export class EmployeeSummaryComponent implements OnInit, OnDestroy {
  summaryId = '';
  // linkID = 'a44109ad-e58b-47cd-b348-7556e4d2c117';
  linkID = '';
  selected;
  employeetype;
  dependentArray = [];
  servceRequestDatas = [];
  cursorClassEnables;
  prePlacement = false;

  // jobTitle;

  regionalOffices = [];
  districtOffices = [];
  deptName = [];
  deptBranch = [];
  departmentOfUser;
  currentEmplDept;

  jobLocationList: NameValueLookup[] = [];
  jobLocationListWithIdLookup = {};
  employeeDepartmentList: NameValueLookup[] = [];
  employeeDepartmentListWithIdLookup = {};

  confirmSubmit = false;
  successHeaderCheck;
  activateSubmitButton = null;

  editEmployee;

  datePickerConfig: Partial<BsDatepickerConfig>;

  // Declaration for Employree form group object

  employeeFormGroup: FormGroup;


  department: any;
  branches: any;

  linkId;

  // list of  Languages
  languages = ['English', 'French'];

  // list of Provinces and territories in alphabetical order
  // tslint:disable-next-line:max-line-length
  // provinces =

  // list of countries
  countries = ['Canada'];
  currentRole;
  minDate: Date;
  maxDate: Date;

  constructor(
    public translate: TranslateService,
    private titleCase: TitleCasePipe,
    private fb: FormBuilder,
    private userService: UserService,
    private patientService: PatientService,
    private adminHomeScreenService: AdminHomeScreenService,
    private router: Router,
    private qrequestService: QrequestService,
    private utilService: UtilService
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
    {
      value: 'Newfoundland and Labrador',
      viewValue: 'Newfoundland and Labrador'
    },
    { value: 'Northwest Territories', viewValue: 'Northwest Territories' },
    { value: 'Nova Scotia', viewValue: 'Nova Scotia' },
    { value: 'Nunavut', viewValue: 'Nunavut' },
    { value: 'Ontario', viewValue: 'Ontario' },
    { value: 'Prince Edward Island', viewValue: 'Prince Edward Island' },
    { value: 'Quebec', viewValue: 'Quebec' },
    { value: 'Saskatchewan', viewValue: 'Saskatchewan' },
    { value: 'Yukon', viewValue: 'Yukon' }
  ];
  dateinform;

  ngOnInit() {



    if (sessionStorage.getItem('patientSelected')) {
      sessionStorage.removeItem('patientSelected');
    }

    this.currentRole = sessionStorage.getItem('userRole');
    this.departmentOfUser = sessionStorage.getItem('userDept');
    console.log(this.departmentOfUser);

    this.datePickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'YYYY-MM-DD',
        showWeekNumbers: false
      });

    this.summaryId = sessionStorage.getItem('patientSummaryId');
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

    this.employeeFormGroup = this.fb.group({
      familyName: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ]),
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
        Validators.maxLength(10)
      ]),
      addressStreet: new FormControl('', Validators.required),
      addressCity: new FormControl('', Validators.required),
      addressProv: new FormControl('', Validators.required),
      addressPcode: new FormControl('', [Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6)
      ]),
      addressCountry: new FormControl('', Validators.required),
      language: new FormControl('', Validators.required)
    });

  }

  ngOnDestroy() {
    // sessionStorage.removeItem('patientSummaryId');
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

          if (item.resource.resourceType === 'Organization') {
            this.employeeDepartmentListWithIdLookup[item.resource.id] = item.resource.name;
          }
          if (item.resource.resourceType === 'Location') {
            this.jobLocationListWithIdLookup[item.resource.id] = item.resource.name;
          }

          return temp;
        }
        return { value: null, text: null };
      });

      return list;
    }

    return [];
  }

  getAndSetDepartmentList() {
    this.adminHomeScreenService.getDepartmentNames()
      .subscribe(bundle => {
        console.log('employee department => ', bundle);
        this.employeeDepartmentList = this.extractKeyValuePairsFromBundle(bundle);
      },
        (err) => console.log('Employee Department list error', err));
  }

  async getNameFromReference(reference) {
    const data = await this.utilService.getResourceFromReferenceAsync(reference);
    const name = data['name'];
    return name;
  }

  onChanges(): void {
    // listen to one aprticular field for form change
    this.employeeFormGroup.get('departmentName')
      .valueChanges
      .pipe(distinctUntilChanged((a, b) => {
        return JSON.stringify(a) === JSON.stringify(b);
      }))
      .subscribe(val => {
        if (val !== '') {
          // get job locations dropdown items
          this.adminHomeScreenService.getJobLocations({ organization: val })
            .subscribe(locations => {
              console.log('job list =>', locations);
              this.jobLocationList = this.extractKeyValuePairsFromBundle(locations);
              this.employeeFormGroup.get('departmentBranch').enable();
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

  populatePatientArray(data) {
    // this.utilService.recordEventHandler('read', data);

    const temp = {};

    temp['dateModified'] = data['meta']['lastUpdated'];
    temp['id'] = data['id'];
    temp['given'] = data['name'][0]['given'][0];
    temp['family'] = data['name'][0]['family'];
    sessionStorage.setItem('emplFam', data['name'][0]['family']);
    sessionStorage.setItem('emplGiven', data['name'][0]['given'][0]);
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

        if (extension.valueReference) {
          temp['department']['reference'] = extension.valueReference.reference;
          this.getNameFromReference(extension.valueReference.reference).then(name => {
            temp['department']['valueString'] = name;
            console.log(temp['department']['valueString']);
          });
        }
        // if (extension.valueReference) {

        //   // temp['department']['reference'] = extension.valueReference.reference;
        //     const temp1 = this.getNameFromReference(extension.valueReference.reference).toPromise();
        //     const name = temp1;
        //     console.log(name);
        // }
      }
    });
    data['extension'].forEach(extension => {
      if (extension['url'] === 'https://bcip.smilecdr.com/fhir/jobtitle' ||
        extension['url'] === 'https://bcip.smilecdr.com/fhir/jobtile') {
        temp['jobtitle'] = {};
        temp['jobtitle']['url'] = extension.url;
        temp['jobtitle']['valueString'] = extension.valueString;
      }
    });
    data['extension'].forEach(extension => {
      if (extension['url'] === 'https://bcip.smilecdr.com/fhir/jobclass') {
        temp['jobClass'] = {};
        temp['jobClass']['url'] = extension.url;
        temp['jobClass']['valueString'] = extension.valueString;
      }
    });
    data['extension'].forEach(extension => {
      if (extension['url'] === 'https://bcip.smilecdr.com/fhir/joblevel') {
        temp['jobLevel'] = {};
        temp['jobLevel']['url'] = extension.url;
        temp['jobLevel']['valueString'] = extension.valueString;
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
        if (extension.valueReference) {
          temp['branch']['reference'] = extension.valueReference.reference;

          this.getNameFromReference(extension.valueReference.reference).then(name => {
            temp['branch']['valueString'] = name;
          });
        }
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
    temp['resourceType'] = data['resourceType'];
    temp['communication'] = data['communication'];

    data['telecom'].forEach(telecom => {
      temp['telecom'].push(telecom);
    });
    temp['telecom'] = data['telecom'];
    const historyQuery = '/' + temp['id'] + '/_history/1';
    temp['dateModified'] = data['meta']['lastUpdated'];


    this.patientService
      .getPatientData(historyQuery)
      .subscribe(firstData =>
        temp['dateCreated'] = firstData['meta']['lastUpdated'],
        error => this.handleError(error)
      );

    this.selected = temp;


    sessionStorage.setItem('emplType', this.selected['employeeType']['valueString']);

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



    this.currentEmplDept = this.selected.department.valueString;
    console.log(this.currentEmplDept);

  }

  setSelectedServiceRequestID(id) {
    sessionStorage.setItem('selectedServiceRequestID', id);
    this.router.navigateByUrl('/service-request-summary');
  }

  selectedPatient(event: any) {
    console.log(event.target.value);
  }



  newServiceRequest() {
    this.router.navigate(['/newservicerequest']);
  }
  handleError(error) {
    console.log(error);
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
            temp['value'] = false;
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
            temp['value'] = false;
            this.dependentArray.push(temp);
          }
        }
      });
    }
    sessionStorage.setItem('dependents', JSON.stringify(this.dependentArray));

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
    if (data.entry) {
      this.servceRequestDatas = data.entry;
    }
  }

  getServReqDataError(error) {
    console.log(error);
  }

  getServiceType(serviceRequestObj): string {
    let result: any;
    result = '-';
    if (serviceRequestObj.resource.item) {
      result = this.getAnswer('PSOHPSERV', serviceRequestObj.resource);
    }
    return result;
  }

  getAssessmentType(serviceRequestObj) {
    let result: any;
    result = '-';

    if (serviceRequestObj.resource.item) {
      // return this.getLinkValueFromObject(serviceRequestObj, 'PSOHP Service', 2);
      result = this.getAnswer('ASSESTYPE', serviceRequestObj.resource);
    }


    return result;
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

  setBranchList(data) {
    this.branches = data.branchlist;
  }

  // callback function to set the department list dropdown from the JSON included
  // TODO: change implementation to load from list of organizations
  setDepartments(data) {
    this.department = data.department;
  }

  editEmployeeToggle() {
    this.editEmployee = !this.editEmployee;
    this.getAndSetDepartmentList();
    this.employeeFormGroup.controls['familyName'].patchValue(
      this.selected['family']
    );
    this.employeeFormGroup.controls['givenName'].patchValue(
      this.selected['given']
    );
    this.employeeFormGroup.controls['dob'].patchValue(this.selected['dob']);
    this.selected['telecom'].forEach(tele => {
      if (tele['system'] === 'email') {
        this.employeeFormGroup.controls['email'].patchValue(tele['value']);
      }
      if (tele['system'] === 'phone') {
        this.employeeFormGroup.controls['phoneNumber'].patchValue(
          tele['value']
        );
      }
    });
    this.selected['communication'].forEach(language => {
      language['language']['coding'].forEach(usedLanguage => {
        this.employeeFormGroup.controls['language'].patchValue(
          usedLanguage['display']
        );
      });
    });
    this.selected['address'].forEach(address => {
      this.employeeFormGroup.controls['addressStreet'].patchValue(
        address['line'][0]
      );
      this.employeeFormGroup.controls['addressCity'].patchValue(address.city);
      this.employeeFormGroup.controls['addressProv'].patchValue(
        this.titleCase.transform(address.state)
      );
      this.employeeFormGroup.controls['addressPcode'].patchValue(
        address.postalCode
      );
      this.employeeFormGroup.controls['addressCountry'].patchValue(
        address.country
      );
    });

    if (this.selected['employeeType']['valueString'] === 'Employee') {

      this.employeeFormGroup.addControl(
        'id',
        new FormControl('', [
          Validators.required,
          Validators.minLength(9),
          Validators.maxLength(9)
        ])
      );

      this.employeeFormGroup.addControl(
        'jobTitle',
        new FormControl(''));

      this.employeeFormGroup.addControl(
        'jobClass',
        new FormControl(''));

      this.employeeFormGroup.addControl(
        'jobLevel',
        new FormControl(''));

      this.employeeFormGroup.addControl(
        'departmentName',
        new FormControl('', Validators.required)
      );
      this.employeeFormGroup.addControl(
        'departmentBranch',
        new FormControl('', Validators.required)
      );
      this.employeeFormGroup.addControl('referenceOne', new FormControl(''));
      this.employeeFormGroup.addControl('referenceTwo', new FormControl(''));

      if (this.selected['identifier']) {
        this.employeeFormGroup.controls['id'].patchValue(
          this.selected['identifier']['value']
        );
      }

      if (this.selected['jobtitle']) {
        this.employeeFormGroup.controls['jobTitle'].patchValue(
          this.selected['jobtitle']['valueString']
        );
      }

      if (this.selected['jobLevel']) {
        this.employeeFormGroup.controls['jobLevel'].patchValue(
          this.selected['jobLevel']['valueString']
        );
      }

      if (this.selected['jobClass']) {
        this.employeeFormGroup.controls['jobClass'].patchValue(
          this.selected['jobClass']['valueString']
        );
      }

      if (this.selected['department']) {
        this.employeeFormGroup.controls['departmentName'].patchValue(
          this.selected['department']['reference']
        );
      }

      if (this.selected['branch']) {
        this.employeeFormGroup.controls['departmentBranch'].patchValue(
          this.selected['branch']['reference']
        );
      }

      if (this.selected['crossref1']) {
        this.employeeFormGroup.controls['referenceOne'].patchValue(
          this.selected['crossref1']['valueString']
        );
      }

      if (this.selected['crossref2']) {
        this.employeeFormGroup.controls['referenceTwo'].patchValue(
          this.selected['crossref2']['valueString']
        );
      }
      this.getAndSetDepartmentList();

    }

    this.onChanges();
  }

  updateEmployee() {

    const employee = new FHIR.Patient;
    const identifier = new FHIR.Identifier;
    const address = new FHIR.Address;
    const jobTitleExtension = new FHIR.Extension;
    const departmentExtension = new FHIR.Extension;
    const departmentReference = new FHIR.Reference;
    const jobLevelExtension = new FHIR.Extension;
    const jobClassExtension = new FHIR.Extension;
    const branchExtension = new FHIR.Extension;
    const branchReference = new FHIR.Reference;
    const crossRefOneExtension = new FHIR.Extension;
    const crossRefTwoExtension = new FHIR.Extension;
    const dependentExtension = new FHIR.Extension;
    const employeeTypeExtension = new FHIR.Extension;
    const phone = new FHIR.ContactPoint;
    const email = new FHIR.ContactPoint;
    const name = new FHIR.HumanName;
    const communication = new FHIR.PatientCommunication;
    const languageCodeableConcept = new FHIR.CodeableConcept;
    const languageCoding = new FHIR.Coding;

    // Extensions
    const extensionsArray = [];
    // Employee identifer

    if (this.selected['employeeType']['valueString'] === 'Employee') {
      identifier.use = 'official';
      identifier.value = this.employeeFormGroup.get('id').value;
      identifier.system =
        'https://bcip.smilecdr.com/fhir/employeeid';
    }

    // Address
    address.city = this.employeeFormGroup.value.addressCity.trim();
    address.line = [this.employeeFormGroup.value.addressStreet.trim()];
    address.postalCode = this.employeeFormGroup.value.addressPcode.trim();
    address.country = this.employeeFormGroup.value.addressCountry.trim();
    address.state = this.employeeFormGroup.value.addressProv.trim();

    // Extensions related to employment information

    if (this.selected['employeeType']['valueString'] === 'Employee') {
      // Job title extension

      if (this.employeeFormGroup.get('jobTitle').value) {
        jobTitleExtension.url = 'https://bcip.smilecdr.com/fhir/jobtitle';
        jobTitleExtension.valueString = this.employeeFormGroup.get('jobTitle').value;
        extensionsArray.push(jobTitleExtension);
      }

      if (this.employeeFormGroup.get('jobLevel').value) {
        jobLevelExtension.url = 'https://bcip.smilecdr.com/fhir/joblevel';
        jobLevelExtension.valueString = this.employeeFormGroup.get('jobLevel').value;
        extensionsArray.push(jobLevelExtension);
      }

      if (this.employeeFormGroup.get('jobClass').value) {
        jobClassExtension.url = 'https://bcip.smilecdr.com/fhir/jobclass';
        jobClassExtension.valueString = this.employeeFormGroup.get('jobClass').value;
        extensionsArray.push(jobClassExtension);
      }

      // Workplace extension

      departmentExtension.url = 'https://bcip.smilecdr.com/fhir/workplace';
      departmentReference.reference = this.employeeFormGroup.get('departmentName').value;
      departmentExtension.valueReference = departmentReference;
      extensionsArray.push(departmentExtension);

      // Branch

      branchReference.reference = this.employeeFormGroup.get('departmentBranch').value;
      branchExtension.url = 'https://bcip.smilecdr.com/fhir/branch';
      branchExtension.valueReference = branchReference;
      extensionsArray.push(branchExtension);

      // Cross Reference One extension
      if (this.employeeFormGroup.get('referenceOne').value) {
        crossRefOneExtension.url = 'https://bcip.smilecdr.com/fhir/crossreferenceone';
        crossRefOneExtension.valueString = this.employeeFormGroup.get('referenceOne').value;
        extensionsArray.push(crossRefOneExtension);
      }
      // Cross Reference Two extension
      if (this.employeeFormGroup.get('referenceOne').value) {

        crossRefTwoExtension.url = 'https://bcip.smilecdr.com/fhir/crossreferencetwo';
        crossRefTwoExtension.valueString = this.employeeFormGroup.get('referenceTwo').value;
        extensionsArray.push(crossRefTwoExtension);
      }
    }

    // Dependent link  extension

    dependentExtension.url = 'https://bcip.smilecdr.com/fhir/dependentlink';
    dependentExtension.valueString = this.selected['linkID']['valueString'];
    extensionsArray.push(dependentExtension);

    // Type extension
    employeeTypeExtension.url = 'https://bcip.smilecdr.com/fhir/employeetype';

    if (this.selected['employeeType']['valueString'] === 'Employee') {
      employeeTypeExtension.valueString = 'Employee';
    } else {
      employeeTypeExtension.valueString = 'Dependent';
    }
    extensionsArray.push(employeeTypeExtension);


    employee.extension = extensionsArray;

    // Employe Name


    // Language info

    if (this.employeeFormGroup.value.language.toLowerCase() === 'english') {
      languageCoding.code = 'en';
    } else {
      languageCoding.code = 'fr';
    }
    languageCoding.system = 'urn:ietf:bcp:47';
    languageCoding.display = this.employeeFormGroup.value.language;
    languageCodeableConcept.coding = [languageCoding];
    communication.language = languageCodeableConcept;

    // Employee name
    name.family = this.employeeFormGroup.value.familyName;
    sessionStorage.setItem('emplFam', this.employeeFormGroup.value.familyName);

    name.given = [this.employeeFormGroup.value.givenName];
    sessionStorage.setItem('emplGiven', this.employeeFormGroup.value.givenName);

    // Telecom
    phone.system = 'phone';
    phone.value = this.employeeFormGroup.value.phoneNumber;
    phone.use = 'work';

    email.system = 'email';
    email.value = this.employeeFormGroup.value.email;
    email.use = 'work';


    if (this.employeeFormGroup.value.language.toLowerCase() === 'english') {
      languageCoding.code = 'en';
    } else {
      languageCoding.code = 'fr';
    }
    languageCoding.system = 'urn:ietf:bcp:47';
    languageCoding.display = this.employeeFormGroup.value.language;
    languageCodeableConcept.coding = [languageCoding];
    communication.language = languageCodeableConcept;


    employee.birthDate = this.employeeFormGroup.get('dob').value;
    employee.birthDate = formatDate(employee.birthDate, 'yyyy-MM-dd', 'en');

    employee.communication = [communication];
    employee.telecom = [phone, email];
    employee.name = [name];
    employee.extension = extensionsArray;
    employee.identifier = [identifier];
    employee.address = address;
    employee.id = this.selected['id'];
    employee.resourceType = 'Patient';
    // Stringify the final object
    const finalJSON = JSON.stringify(employee);

    this.patientService.updatePatient(this.selected['id'], finalJSON).subscribe(
      data => {
        console.log('POST SUCCESSFUL!', data);
        this.populatePatientArray(data);
        this.routeToSummary(this.selected['id']);
        this.editEmployee = false;
      },
      error => this.handleError(error)
    );
  }

  getAnswer(code, obj) {
    let result = '-';
    obj.item.forEach(element => {

      if (element.linkId === code) {
        result = element.answer[0].valueCoding.display;
      }
    });
    return result;
  }

  /**
   * Disables inputs when returning back to edit the account details. Useful
   * for disabling the textboxes during the confirmation screen. Also allows
   * for the header at the top to change text, asking the user if they want
   * to continue before posting the data to the server.
   */
  disableInputsBeforeSubmission() {
    if (this.validateForm()) {
      this.confirmSubmit = true;
      this.employeeFormGroup.disable();
      this.employeeFormGroup.updateValueAndValidity();
    }
  }

  /**
   * Enables inputs when returning back to edit the account details. Useful
   * for disabling the textboxes during the confirmation screen
   */
  returnToEditInputs() {
    this.activateSubmitButton = false;
    this.confirmSubmit = false;
    this.employeeFormGroup.enable();
    this.employeeFormGroup.updateValueAndValidity();
  }

  /**
   * Checks the form to see if it's valid, and set a flag to true.
   * Important for making sure the submit button turns on properly,
   * as disabling any inputs in an Angular Form means the entire form
   * object is invalid, regardless of whether or not the form really is
   * valid.
   */
  validateForm() {
    if (this.employeeFormGroup.valid) {
      this.activateSubmitButton = true;
    }
    return this.activateSubmitButton;
  }

  backToDashboard() {
    sessionStorage.removeItem('patientSummaryId');
    this.router.navigateByUrl('/dashboard');
  }

  addDependent() {
    console.log(this.selected);
    const piecesToSave = {};
    piecesToSave['id'] = this.selected['id'];
    piecesToSave['linkId'] = this.selected['linkID'];
    sessionStorage.setItem('patientSelected', JSON.stringify(piecesToSave));
    this.router.navigateByUrl('/dependentform');
  }

  checkPrePlacement(e) {
    this.prePlacement = e.target.checked;
    sessionStorage.setItem('prePlacement', JSON.stringify(this.prePlacement));
  }
}
