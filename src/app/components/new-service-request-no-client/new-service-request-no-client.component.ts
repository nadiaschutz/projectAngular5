import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { QuestionnaireService } from '../../service/questionnaire.service';
import { Item } from '../models/item.model';
import { Element } from '../models/element.model';
import { forEach } from '@angular/router/src/utils/collection';
import { ItemToSend } from '../models/itemToSend.model';
import { analyzeAndValidateNgModules } from '@angular/compiler';

import * as FHIR from '../../interface/FHIR';
import { PatientService } from 'src/app/service/patient.service';

// for custom form components to work
import { Validators } from '@angular/forms';
import { Field } from '../dynamic-forms/field.interface';
import { FieldConfig } from '../dynamic-forms/field-config.interface';
import { DynamicFormComponent } from '../dynamic-forms/dynamic-form.component';
import { CustomValidator } from '../dynamic-forms/custom-validator';
import { FileDetector } from 'protractor';
import { ValueAddress } from 'src/app/interface/organization';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

class TextInput {
  static create(event: FieldConfig) {
    return {
      type: event.type,
      label: event.label,
      inputType: event.inputType,
      name: event.name
    };
  }
}

class SelectField {
  static create(event: FieldConfig) {
    return {
      type: event.type,
      label: event.label,
      inputType: event.inputType,
      name: event.name
    };
  }
}

@Component({
  selector: 'app-new-service-request-no-client',
  templateUrl: './new-service-request-no-client.component.html',
  styleUrls: ['./new-service-request-no-client.component.scss']
})
// export class NewServiceRequestNoClientComponent
//   implements OnInit, NgAft {
export class NewServiceRequestNoClientComponent implements OnInit, AfterViewInit {
  // @ViewChild('serReqForm') form: NgForm;

  // var for styling each form field
  style = 'col-11';
  configuration;
  userName;
  loaded = false;

  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  config: FieldConfig[] = [];

  formId = '1953';

  responseId = null;
  clientId = null;
  clientGivenName = null;
  clientFamilyName = null;
  clientBoD = null;
  currentUserDepartment;
  currentUserDepartmentTEST = 'test';
  currentUserRole;

  documents = null;
  fileLink = [];
  itemReference;
  departmentList = [];
  departmentListTEST = [
    'test Department Nadia',
    'Global Affairs Canada (GAC)',
    'test',
    'Defence Research and Development Canada (DRDC)',
    'Canadian Northern Economic Development Agency (CanNor)',
    'Correctional Service Canada (CSC)',
    'Communications Research Centre Canada (CRC)',
    'Canadian Space Agency (CSA)',
    'Canadian Northern Economic Development Agency (CanNor)',
    'Canadian Heritage (PCH)',
    'Canadian Grain Commission (CGC)',
    'Canadian Coast Guard (CCG)',
    'Canada Border Services Agency (CBSA)',
    'Agriculture and Agri-Foods Canada (AAFC)'];



  today = new Date();
  myDay;
  dd: any;
  mm: any;
  yyyy: any;
  time: any;
  hr: any;
  min: any;
  sec: any;
  msec: any;

  fileString;

  dependents = false;
  dependentBoolean = false;
  dependentNumber = 0;
  qrequest: any;
  qrequestTEST = [
    {
      "linkId": "1",
      "text": "Name of the Requester",
      "type": "text",
      "required": true
    },
    {
      "linkId": "2",
      "text": "Department Name",
      "type": "choice",
      "required": true,
      "option": [
        {
          "valueCoding": {
            "code": "Agriculture and Agri-Foods Canada (AAFC)"
          }
        },
        {
          "valueCoding": {
            "code": "Canada Border Services Agency (CBSA)"
          }
        },
        {
          "valueCoding": {
            "code": "Canadian Coast Guard (CCG)"
          }
        },
        {
          "valueCoding": {
            "code": "Canadian Grain Commission (CGC)"
          }
        },
        {
          "valueCoding": {
            "code": "Canadian Heritage (PCH)"
          }
        },
        {
          "valueCoding": {
            "code": "Canadian Northern Economic Development Agency (CanNor)"
          }
        },
        {
          "valueCoding": {
            "code": "Canadian Space Agency (CSA)"
          }
        },
        {
          "valueCoding": {
            "code": "Communications Research Centre Canada (CRC)"
          }
        },
        {
          "valueCoding": {
            "code": "Correctional Service Canada (CSC)"
          }
        },
        {
          "valueCoding": {
            "code": "Defence Research and Development Canada (DRDC)"
          }
        },
        {
          "valueCoding": {
            "code": "Department of Finance Canada (FIN)"
          }
        },
        {
          "valueCoding": {
            "code": "Department of Justice Canada (JC)"
          }
        },
        {
          "valueCoding": {
            "code": "Employment and Social Development Canada (ESDC)"
          }
        },
        {
          "valueCoding": {
            "code": "Environment and Climate Change Canada (ECCC)"
          }
        },
        {
          "valueCoding": {
            "code": "Fisheries and Oceans Canada (DFO)"
          }
        },
        {
          "valueCoding": {
            "code": "Global Affairs Canada (GAC)"
          }
        },
        {
          "valueCoding": {
            "code": "Health Canada (HC)"
          }
        },
        {
          "valueCoding": {
            "code": "Immigration, Refugees and Citizenship Canada (IRCC)"
          }
        },
        {
          "valueCoding": {
            "code": "Indigenous and Northern Affairs Canada (INAC)"
          }
        },
        {
          "valueCoding": {
            "code": "Innovation, Science and Economic Development Canada (ISEDC)"
          }
        },
        {
          "valueCoding": {
            "code": "National Defence (DND)"
          }
        },
        {
          "valueCoding": {
            "code": "Natural Resources Canada (NRCan)"
          }
        },
        {
          "valueCoding": {
            "code": "Privy Council Office (PCO)"
          }
        },
        {
          "valueCoding": {
            "code": "Public Health Agency of Canada (PHAC)"
          }
        },
        {
          "valueCoding": {
            "code": "Public Prosecution Service of Canada (PPSC)"
          }
        },
        {
          "valueCoding": {
            "code": "Public Safety Canada (PSC)"
          }
        },
        {
          "valueCoding": {
            "code": "Public Services and Procurement Canada (PSPC)"
          }
        },
        {
          "valueCoding": {
            "code": "Royal Canadian Mounted Police (RCMP)"
          }
        },
        {
          "valueCoding": {
            "code": "Service Canada (SC)"
          }
        },
        {
          "valueCoding": {
            "code": "Shared Services Canada (SSC)"
          }
        },
        {
          "valueCoding": {
            "code": "Statistics Canada (StatCan)"
          }
        },
        {
          "valueCoding": {
            "code": "Transport Canada (TC)"
          }
        },
        {
          "valueCoding": {
            "code": "Transportation Safety Board of Canada (TSB)"
          }
        },
        {
          "valueCoding": {
            "code": "Treasurer Board of Canada Secretariat (TBS)"
          }
        },
        {
          "valueCoding": {
            "code": " Veterans Affairs Canada (VAC)"
          }
        },
        {
          "valueCoding": {
            "code": "Administrative Tribunals Support Service of Canada (ATSSC)"
          }
        },
        {
          "valueCoding": {
            "code": "Atlantic Canada Opportunities Agency (ACOA)"
          }
        },
        {
          "valueCoding": {
            "code": "Canada Economic Development for Quebec regions (CED)"
          }
        },
        {
          "valueCoding": {
            "code": "Canada Industrial Relations Board (CIRB)"
          }
        },
        {
          "valueCoding": {
            "code": "Canada School of Public Service (CSPS)"
          }
        },
        {
          "valueCoding": {
            "code": "Canadian Dairy Commission (CDC)"
          }
        },
        {
          "valueCoding": {
            "code": "Canadian Radio-television & Telecommunication Commission (CTRC)"
          }
        },
        {
          "valueCoding": {
            "code": "Canadian Transportation Agency (CTA)"
          }
        },
        {
          "valueCoding": {
            "code": "International Joint Commission (IJC)"
          }
        },
        {
          "valueCoding": {
            "code": "Office of the Chief Electoral Officer of Canada (CEO)"
          }
        },
        {
          "valueCoding": {
            "code": "Office of the Commissioner for Federal Judicial Affairs (FJA)"
          }
        },
        {
          "valueCoding": {
            "code": "Office of the Privacy Commissioner of Canada (OPC)"
          }
        },
        {
          "valueCoding": {
            "code": "Office of the Registrar of the Supreme Court of Canada (ORSCC)"
          }
        },
        {
          "valueCoding": {
            "code": "Office of the Secretary to the Governor General (OSGG)"
          }
        },
        {
          "valueCoding": {
            "code": "Public Service Commission of Canada (PSC)"
          }
        },
        {
          "valueCoding": {
            "code": "Status of Woman Canada (SWC)"
          }
        },
        {
          "valueCoding": {
            "code": "Canadian Environmental Assessment Agency (CEAA)"
          }
        },
        {
          "valueCoding": {
            "code": "Canadian Human Rights Commission (CHRC)"
          }
        },
        {
          "valueCoding": {
            "code": "Canadian Intellectual Property Office (CIPO)"
          }
        },
        {
          "valueCoding": {
            "code": "Canadian International Trade Tribunal (CITT)"
          }
        },
        {
          "valueCoding": {
            "code": "Courts Administration Service (CAS)"
          }
        },
        {
          "valueCoding": {
            "code": "Farm Products Council of Canada (FPCC)"
          }
        },
        {
          "valueCoding": {
            "code": "Federal Economic Development Agency for Southern Ontario (FedDev Ontario)"
          }
        },
        {
          "valueCoding": {
            "code": "Immigration and Refugee Board of Canada (IRB)"
          }
        },
        {
          "valueCoding": {
            "code": "Infrastructure Canada (INFC)"
          }
        },
        {
          "valueCoding": {
            "code": "Library and Archive Canada (LAC)"
          }
        },
        {
          "valueCoding": {
            "code": "Military Grievance External Review Committee (MGERC)"
          }
        },
        {
          "valueCoding": {
            "code": "Office of the Commissioner of Official Languages (OCOL)"
          }
        },
        {
          "valueCoding": {
            "code": "Office of the Information Commissioner of Canada (OIC)"
          }
        },
        {
          "valueCoding": {
            "code": "Office of the Public Sector Integrity Commissioner (PSIC)"
          }
        },
        {
          "valueCoding": {
            "code": "Parole Board of Canada (PBC)"
          }
        },
        {
          "valueCoding": {
            "code": "Patented Medicine Prices Review Board (PMPRB)"
          }
        },
        {
          "valueCoding": {
            "code": "Translation Bureau (SVC)"
          }
        },
        {
          "valueCoding": {
            "code": "Western Economic Diversification Canada (WD)"
          }
        },
        {
          "valueCoding": {
            "code": "Public Service Occupational Health Program (PSOHP)"
          }
        }
      ]
    },
    {
      "linkId": "3",
      "text": "Contact Email",
      "type": "text"
    },
    {
      "linkId": "4",
      "text": "Contact Phone No",
      "type": "text"
    },
    {
      "linkId": "5",
      "text": "Select Request Type",
      "type": "choice",
      "required": true,
      "option": [
        {
          "valueCoding": {
            "code": "Advice or Consultation-PSOHP Program in general"
          }
        },
        {
          "valueCoding": {
            "code": "Advice or Consultation-Occupational Health Assessment"
          }
        },
        {
          "valueCoding": {
            "code": "Advice or Consultation-FTWE"
          }
        },
        {
          "valueCoding": {
            "code": "Advice or Consultation-Superannuation"
          }
        },
        {
          "valueCoding": {
            "code": "Advice or Consultation-Travel Health"
          }
        },
        {
          "valueCoding": {
            "code": "Advice or Consultation-Immunization"
          }
        },
        {
          "valueCoding": {
            "code": "Advice or Consultation-OHAG"
          }
        },
        {
          "valueCoding": {
            "code": "Advice or Consultation-Workplace environment"
          }
        },
        {
          "valueCoding": {
            "code": "Advice or Consultation-Postings"
          }
        },
        {
          "valueCoding": {
            "code": "Advice or Consultation-Overseas"
          }
        },
        {
          "valueCoding": {
            "code": "Incident Management-Client incidents or Employee incidents"
          }
        },
        {
          "valueCoding": {
            "code": "Incident Management-Privacy Breach or Security Breach"
          }
        },
        {
          "valueCoding": {
            "code": "Incident Management-Complaint"
          }
        },
        {
          "valueCoding": {
            "code": "Incident Management-Medical/Clinical Incident"
          }
        },
        {
          "valueCoding": {
            "code": "Incident Management-Aggressive/violent Behaviour"
          }
        }
      ]
    },
    {
      "linkId": "6",
      "text": "Detail of Request",
      "type": "text"
    }
  ];



  submitingFormData: {
    formId: any;
    itemToSend: any;
  };

  itemToSend: ItemToSend = {
    resourceType: '',
    questionnaire: null,
    status: null,
    subject: null,
    authored: null,
    item: []
  };

  items: Item[];

  item: Item = {
    linkId: '',
    text: '',
    answer: null
  };

  trackByEl(index: number, el: any): string {
    return el.linkId;
  }

  constructor(
    public translate: TranslateService,
    private questionnaireService: QuestionnaireService,
    private router: Router,
    private userService: UserService,
    private patientService: PatientService,
    private oauthService: OAuthService,
    private http: HttpClient
  ) {

    // // getting formId to display form fields
    // this.questionnaireService
    //   .getForm(this.formId)
    //   .subscribe(
    //     data => this.getFormData(data),
    //     error => this.getFormDataError(error)
    //   );

    // //     this.person = this.http.get("https://jsonplaceholder.typicode.com/posts/1")
    // //  .map(res => res.json()).toPromise();
    // // this.http.get(environment.queryURI + '/Questionnaire/' + query, { headers: this.getHeaders() });

    // this.userService.fetchUserName();
    // this.userService.fetchCurrentRole();
    // this.userService.fetchCurrentUserDept();
    // this.userName = sessionStorage.getItem['userName'];

    // /**
    //  * Initializes the list of branches from our system
    //  */
    // this.userService
    //   .fetchAllDepartmentNames()
    //   .subscribe(
    //     data => this.populateDeptNames(data),
    //     error => this.handleError(error)
    //   );

    // this.userService.subscribeUserDept().subscribe(
    //   data => {
    //     if (data) {
    //       this.currentUserDepartment = data;
    //       // this.settingFunction();
    //       this.userName = this.oauthService.getIdentityClaims()['name'];
    //       console.log(this.currentUserDepartment);
    //     }

    //   },
    //   error => this.responseError(error)
    // );

    // this.userService
    //   .subscribeRoleData()
    //   .subscribe(
    //     data => (this.currentUserRole = data),
    //     error => this.handleError(error)
    //   );

    // // smile user ID

    // console.log(this.userName);

    // // fhir user id
    // this.userService.subscribeUserFHIRID().subscribe(data => console.log(data));

  }

  ngOnInit() {


    this.userService.subscribeRoleData().subscribe(() => {
      this.userName = sessionStorage.getItem('userName');
    });
    this.userName = sessionStorage.getItem('userName');

    this.userService.subscribeUserDept().subscribe(() => {
      this.currentUserDepartment = sessionStorage.getItem('userDept');
    });
    this.currentUserDepartment = sessionStorage.getItem('userDept');

    // getting formId to display form fields
    this.questionnaireService
      .getForm(this.formId)
      .subscribe(
        data => this.getFormData(data),
        error => this.getFormDataError(error)
      );
    // this.getFormData();


    /**
     * Initializes the list of branches from our system
     */
    this.userService
      .fetchAllDepartmentNames()
      .subscribe(
        data => this.populateDeptNames(data),
        error => this.handleError(error)
      );


    // this.userService.subscribeUserDept().subscribe(
    //   data => {
    //     if (data) {
    //       this.currentUserDepartment = data;
    //       // this.settingFunction();
    //       this.userName = this.oauthService.getIdentityClaims()['name'];
    //       console.log('onInit1', this.currentUserDepartment);
    //     }
    //   },
    //   error => this.responseError(error)
    // );


    // smile user ID

    console.log('onInit2', this.userName, this.currentUserDepartment);
    console.log('onInit3', this.form);

    // fhir user id
    // this.userService.subscribeUserFHIRID().subscribe(data => console.log('onInit3', data));
    this.loaded = true;
    // this.settingFunction();


  }

  wrap() {
    const x = $('.field-holder-2 form-input');
    for (let i = 0; i < x.length; i++) {
      console.log(x[i]);
      $(x[i]).wrap('<div class=\'' + this.style + '\'></div>');
    }
  }

  addDiv() {
    const sections = $('.dynamic-form .' + this.style);
    for (let i = 0; i < sections.length; i += 2) {
      sections.slice(i, i + 2).wrapAll('<div class=\'row\'></div>');
    }
  }

  /******************* onCancel() *****************/

  // TO_DO: do post request to delete in-progress service requests
  onCancel() {
    this.router.navigate(['/servreqmain']);
  }

  /******************* onNext() *******************/

  submit(value: { [name: string]: any }) {
    console.log(value);
    console.log(this.items);
    // this.items = value.map(el => console.log(el));

    // });

    this.items.forEach(element => {
      console.log(element.text);

      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          if (key === element.text) {
            element.answer = value[key];
          }
        }
      }
    });

    this.savingData();

    //  sending itemToSend to server
    this.questionnaireService
      .saveRequest(this.itemToSend)
      .subscribe(
        data => this.onSaveSuccess(data),
        error => this.onSaveError(error)
      );

    console.log(this.items);

    console.log(this.itemToSend);
  }

  getDocument(data) {
    console.log(data);
    this.itemReference = data;
  }


  populateDeptNames(data: any) {
    data.entry.forEach(element => {
      if (element['resource']['name']) {
        this.departmentList.push(element['resource']['name']);
      }
    });
    console.log(this.departmentList);
  }

  /***************** savingData() *****************/

  savingData() {
    this.getDate();

    // getting itemReference
    this.questionnaireService.newDocumentSubject.subscribe(
      data => this.getDocument(data),
      error => this.responseIdError(error)
    );
    // pushing document into items arr
    if (this.itemReference) {
      this.items.push(this.itemReference);
    }

    // creating itemToSend
    this.createItemToSend();

    // adding extra items to itemToSend.item[]
    this.mapItemToItems();
  }

  /************** getClientData(data) *************/

  getClientData(data) {
    console.log(data);
    this.clientBoD = data.birthDate;
    this.clientGivenName = data.name[0].given[0];
    this.clientFamilyName = data.name[0].family;
  }

  getClientError(error) {
    console.log(error);
  }

  /****************** getFormData() ***************/

  getFormData(data) {
    // getFormData() {
    this.qrequest = data.item;
    console.log('getFormData1', data);

    this.configuration = this.qrequest.map(el => {
      // text
      if (el.type === 'text') {
        if (el.text === 'Contact Phone No') {

          // const formField = this.textInput(el);
          // formField['placeholder'] = 'type your phone';
          // formField['validation'] = [
          //   Validators.required,
          //   Validators.pattern(
          //     '^[(]{0,1}[0-9]{3}[)]{0,1}[-s.]{0,1}[0-9]{3}[-s.]{0,1}[0-9]{4}$'
          //   )
          // ];
          // return formField;
          return {
            type: 'input',
            label: el.text,
            inputType: 'text',
            placeholder: 'type your phone',
            name: el.linkId,
            value: '',
            validation: [Validators.required, Validators.pattern(
              '^[(]{0,1}[0-9]{3}[)]{0,1}[-s.]{0,1}[0-9]{3}[-s.]{0,1}[0-9]{4}$'
            )]
          };

        } else if (el.text === 'Contact Email') {

          const formField = this.textInput(el);
          formField['placeholder'] = 'type your email';
          formField['validation'] = [Validators.required, Validators.email];
          return formField;

        } else if (el.text === 'Name of the Requester') {

          const formField = this.textInput(el);
          formField['value'] = 'null';
          formField['placeholder'] = 'type your text';
          formField['validation'] = [
            Validators.required,
            Validators.minLength(4)
          ];
          return formField;

          // return {
          //   type: 'input',
          //   label: el.text,
          //   inputType: 'text',
          //   placeholder: 'type your text',
          //   name: el.linkId,
          //   value: '',
          //   validation: [Validators.required, Validators.minLength(4)]
          // };

        } else {
          return {
            type: 'input',
            label: el.text,
            inputType: 'text',
            placeholder: 'type your text',
            name: el.linkId,
            value: '',
            validation: [Validators.required, Validators.minLength(4)]
          };
        }
      }
      if (el.type === 'choice') {
        const options = [];
        el.option.forEach(el1 => {
          options.push(el1.valueCoding.code);
        });
        if (el.text === 'Department Name') {
          const formField = this.selectField(el);
          formField['value'] = this.currentUserDepartment;
          formField['options'] = this.departmentList;
          return formField;

        } else {
          return {
            type: 'select',
            label: el.text,
            name: el.linkId,
            options: options,
            placeholder: 'Select an option',
            validation: [Validators.required],
            value: ''
          };
        }

      }
    });
    console.log('configuration', this.configuration);
    this.configuration.push(
      {
        type: 'doc',
        class: 'documents',
        name: 'doc'
      },
      {
        type: 'line',
        name: 'line'
      },
      {
        type: 'button',
        name: 'submit',
        label: 'Next'
      }
    );
    // console.log('getFormData2', this.configuration);
    this.config = this.configuration;
    console.log('getFormData3', this.config);
    console.log('getFormData4', this.form);

    // maping part of the data from the server to item
    this.items = this.qrequest.map(el => ({
      ...this.item,
      linkId: el.linkId,
      text: el.text
    }));
    console.log('getFormData5', this.items);

    // console.log(this.responseId);
    // if (this.responseId === null) {
    //   this.getResponseId();
    // }

    // TEST
    // this.settingFunction();
    console.log('getFormData6', this.form);
  }

  getFormDataError(error) {
    console.log(error);
  }

  //   const formField = this.textInput(el);
  //                 console.log(formField);
  // formField ['placeholder'] = 'type your phone';
  // formField ['validation'] = [
  //     Validators.required , Validators.minLength(4)
  //   ];
  // return formField;

  textInput(data) {
    return TextInput.create({
      type: 'input',
      label: data.text,
      inputType: 'text',
      name: data.linkId,
    });
  }



  // options: options,
  // validation: [Validators.required]

  selectField(data) {
    return SelectField.create({
      type: 'select',
      label: data.text,
      inputType: 'text',
      placeholder: 'Select an option',
      name: data.linkId,
      validation: [Validators.required]
    });
  }
  /************************************************/
  // settingFunction() {
  ngAfterViewInit() {



    console.log('ngAfterViewInit1', this.currentUserDepartment, this.userName);
    // setTimeout(() => {
    console.log('ngAfterViewInit2', this.currentUserDepartment, this.userName);
    console.log('ngAfterViewInit2.1', this.configuration);
    console.log('ngAfterViewInit3', this.form);
    let previousValid = this.form.valid;
    this.form.changes.subscribe(() => {
      if (this.form.valid !== previousValid) {
        previousValid = this.form.valid;
        this.form.setDisabled('submit', !previousValid);
      }
    });

    this.form.setDisabled('submit', true);
    console.log('ngAfterViewInit4', this.form, this.config);

    // if (this.form) {
    //   console.log('ngAfterViewInit5', this.currentUserDepartment);
    this.form.setValue('1', 'masha');
    this.form.setValue('2', this.currentUserDepartment);

    // }
    console.log('ngAfterViewInit6', this.form.value);

    // });

    // if you want to style 2 form fields per a row do these :
    // this.wrap();
    // this.addDiv();
  }

  /************************************************/
  /*************** onSaveSuccess ******************/
  /************************************************/

  // getting response from thr server on "next"
  onSaveSuccess(data) {
    if (data.item) {
      console.log(data);
      this.responseId = data.id;
      console.log(this.responseId);

      this.questionnaireService.shareResponseId(this.responseId);
      // this.questionnaireService.shareServiceFormId(this.formId);
      this.router.navigate(['/summary']);
    }
  }

  onSaveError(error) {
    console.log(error);
  }
  /************************************************/

  /************************************************/
  /*************** getResponseId ******************/
  /************************************************/

  getResponseId() {
    this.questionnaireService.newResponseIdSubject.subscribe(
      data => this.responseIdSuccess(data),
      error => this.responseIdError(error)
    );
  }
  responseIdSuccess(data) {
    this.responseId = data;
    // get data from the server

    if (this.responseId !== null) {
      this.getResponse();
    }
  }

  responseIdError(error) {
    console.log(error);
  }

  /************************************************/
  /*************** getResponse() ******************/
  /************************************************/
  getResponse() {
    this.questionnaireService
      .getResponse(this.responseId)
      .subscribe(
        data => this.ResponseSuccess(data),
        error => this.responseError(error)
      );
  }

  ResponseSuccess(data) {
    console.log(data);
  }

  responseError(error) {
    console.log(error);
  }

  /************************************************/
  /************* createItemToSend() ***************/
  /************************************************/
  createItemToSend() {
    if (this.formId === '1953') {
      this.itemToSend = {
        resourceType: 'QuestionnaireResponse',
        questionnaire: {
          reference: 'Questionnaire/' + this.formId
        },
        status: 'in-progress',
        authored: this.myDay,
        item: []
      };
    } else {
      this.itemToSend = {
        resourceType: 'QuestionnaireResponse',
        questionnaire: {
          reference: 'Questionnaire/' + this.formId
        },
        status: 'in-progress',
        authored: this.myDay,
        subject: {
          reference: 'Patient/' + this.clientId,
          display: this.clientGivenName + ' ' + this.clientFamilyName
        },
        item: []
      };
    }
  }

  /************************************************/
  /************* mapItemToItems() *****************/
  /************************************************/

  mapItemToItems() {
    this.itemToSend.item = this.items.map(el => {
      if (el.text === 'Document') {
        return {
          linkId: el.linkId,
          text: el.text,
          answer: [
            {
              valueReference: {
                reference: el.answer
              }
            }
          ]
        };
      }
      if (
        el.text === 'Dependent Involved' ||
        el.text === 'Health Exam Done Externally'
      ) {
        return {
          linkId: el.linkId,
          text: el.text,
          answer: [
            {
              valueBoolean: el.answer
            }
          ]
        };
      } else {
        return {
          linkId: el.linkId,
          text: el.text,
          answer: [
            {
              valueString: el.answer
            }
          ]
        };
      }
    });
    console.log(this.itemToSend);
  }


  handleError(error) {
    console.log(error);
  }

  downloadFile(name) {
    const linkSource =
      'data:' +
      name['content'][0]['attachment']['contentType'] +
      ';base64,' +
      name['content'][0]['attachment']['data'];
    console.log(linkSource);
    const downloadLink = document.createElement('a');
    const fileName = name['content'][0]['attachment']['title'];

    downloadLink.href = linkSource;
    downloadLink.download = fileName;
  }

  /************************************************/
  /***************** getDate() ********************/
  /************************************************/

  // get date for authored: '2018-11-08T15:41:00.581+00:00'

  getDate() {
    this.dd = this.addZero(this.today.getDate());
    this.mm = this.addZero(this.today.getMonth() + 1);
    this.yyyy = this.today.getFullYear();
    this.time = this.today.getTime();
    this.hr = this.addZero(this.today.getHours());
    this.min = this.addZero(this.today.getMinutes());
    this.sec = this.addZero(this.today.getSeconds());
    this.msec = this.today.getMilliseconds();

    this.myDate();

    // to-do: fix mlseconds and timeZone

    // console.log(msec);
  }
  myDate() {
    return (this.myDay =
      this.yyyy +
      '-' +
      this.mm +
      '-' +
      this.dd +
      'T' +
      this.hr +
      ':' +
      this.min +
      ':' +
      this.sec +
      '.581+00:00');
  }

  addZero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  }
}
