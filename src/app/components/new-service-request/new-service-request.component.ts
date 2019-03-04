import { Component, OnInit, ViewChild, SkipSelf, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { QuestionnaireService } from '../../service/questionnaire.service';
import { Item } from '../models/item.model';
import { Element } from '../models/element.model';
import { forEach } from '@angular/router/src/utils/collection';
import { ItemToSend } from '../models/itemToSend.model';
import { PatientService } from 'src/app/service/patient.service';
import { formatDate } from '@angular/common';

import * as FHIR from '../../interface/FHIR';
import { link } from 'fs';


// for custom form components to work
import { Validators } from '@angular/forms';
import { Field } from '../dynamic-forms/field.interface';
import { FieldConfig } from '../dynamic-forms/field-config.interface';
import { DynamicFormComponent } from '../dynamic-forms/dynamic-form.component';
import { CustomValidator } from '../dynamic-forms/custom-validator';
import { FileDetector } from 'protractor';
import { ValueAddress } from 'src/app/interface/organization';
import { element } from '@angular/core/src/render3/instructions';

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
  selector: 'app-new-service-request',
  templateUrl: './new-service-request.component.html',
  styleUrls: ['./new-service-request.component.scss']
})
export class NewServiceRequestComponent implements OnInit, AfterViewInit {
  // @ViewChild('advReqForm') form: NgForm;
  // serviceRequestResponce: ServiceRequestResponce = {
  // };

  style = 'col-11';
  configuration;
  userName;
  loaded = false;
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  config: FieldConfig[] = [];

  departmentList = [];

  formId = 'TEST3';

  responseId = null;
  clientId = null;
  smileUserId = null;
  clientGivenName = null;
  clientFamilyName = null;
  clientBoD = null;

  documents;
  fileLink = [];
  documentReference = {};

  disableInputsForReview = false;
  createdsuccessfully = false;

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

  dependents = false;
  dependentBoolean = false;
  dependentNumber = 0;
  qrequest: any;

  questionsList = [];

  submitingFormData: {
    formId: any;
    itemToSend: any;
  };

  itemToSend: FHIR.QuestionnaireResponse;

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
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private patientService: PatientService,
    private oauthService: OAuthService
  ) { }

  ngOnInit() {

    // this.activatedRoute.data.subscribe(data => this.processQuestionnaire(data.fields));
    this.activatedRoute.data.subscribe(data => this.getFormData(data.fields));
    // this.activatedRoute.data.subscribe(data => console.log(data));

    this.activatedRoute.data.subscribe(data => this.populateDeptNames(data.departments));


    this.createdsuccessfully = false;


    this.clientId = sessionStorage.getItem('patientSummaryId');

    if (this.clientId) {
      this.patientService
        .getPatientDataByID(this.clientId)
        .subscribe(
          data => this.getClientData(data),
          error => this.handleErrorClientError(error)
        );
    } else if (!this.clientId) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  wrap() {
    const x = $('.field-holder-2 form-input');
    for (let i = 0; i < x.length; i++) {
      $(x[i]).wrap('<div class=\'' + this.style + '\'></div>');
    }
  }

  addDiv() {
    const sections = $('.dynamic-form .' + this.style);
    for (let i = 0; i < sections.length; i += 2) {
      sections.slice(i, i + 2).wrapAll('<div class=\'row\'></div>');
    }
  }


  populateDeptNames(data: any) {
    data.entry.forEach(element => {
      if (element['resource']['name']) {
        this.departmentList.push(element['resource']['name']);
      }
    });
  }



  /**
   *
   * @param $event
   *s
   * This function builds a new DocumentReference object,
   * Inserts the appropriate data from the response into declared
   * Objects, stringifies the object, and posts said string to the
   * FHIR server.
   */

  addDocument($event) {

    const documentReference = new FHIR.DocumentReference;
    const documentReferenceCodeableConcept = new FHIR.CodeableConcept;
    const documentReferenceCoding = new FHIR.Coding;
    const content = new FHIR.Content;
    const contentAttachment = new FHIR.Attachment;
    const contentCode = new FHIR.Coding;
    let file;
    let trimmedFile = '';
    let size: number;
    let type;
    const date = new Date().toJSON();
    console.log(date);
    const fileList = $event.target.files;
    const reader = new FileReader();
    if (fileList[0]) {
      size = fileList[0].size;
      type = fileList[0].type;
      reader.readAsDataURL(fileList[0]);
    }
    const self = this;
    reader.onloadend = function () {

      file = reader.result;
      trimmedFile = file.split(',').pop();

      documentReference.resourceType = 'DocumentReference';

      contentAttachment.size = size;
      contentAttachment.contentType = type;
      contentAttachment.data = trimmedFile;
      contentAttachment.creation = date;
      contentAttachment.title = fileList[0].name;

      contentCode.code = 'urn:ihe:pcc:xphr:2007';
      contentCode.display = 'Personal Health Records';

      content.format = contentCode;
      content.attachment = contentAttachment;

      documentReferenceCoding.code = '51851-4';
      documentReferenceCoding.system = 'http://loinc.org';
      documentReferenceCoding.display = 'Administrative note';

      documentReferenceCodeableConcept.coding = [documentReferenceCoding];
      documentReferenceCodeableConcept.text = 'Administrative note';

      documentReference.instant = date;
      documentReference.type = documentReferenceCodeableConcept;
      documentReference.content = [content];


      self.questionnaireService.postDataFile(JSON.stringify(documentReference)).subscribe(
        data => self.documents = data,
        error => self.handleError(error)
      );
      return reader.result;

    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };

  }

  retrieveDocuments(data) {
    this.documents.push(data);
    console.log(this.documents);
  }

  downloadFile(incomingFile) {

    const byteCharacters = atob(incomingFile['content'][0]['attachment']['data']);

    const byteNumbers = new Array(byteCharacters.length);
    for (let index = 0; index < byteCharacters.length; index++) {
      byteNumbers[index] = byteCharacters.charCodeAt(index);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { 'type': incomingFile['content'][0]['attachment']['contentType'] });

    if (navigator.msSaveBlob) {
      const filename = incomingFile['content'][0]['attachment']['title'];
      navigator.msSaveBlob(blob, filename);
    } else {
      const fileLink = document.createElement('a');
      fileLink.href = URL.createObjectURL(blob);
      fileLink.setAttribute('visibility', 'hidden');
      fileLink.download = incomingFile['content'][0]['attachment']['title'];
      document.body.appendChild(fileLink);
      fileLink.click();
      document.body.removeChild(fileLink);
    }


    // const linkSource =
    //   'data:' +
    //   name['content'][0]['attachment']['contentType'] +
    //   ';base64,' +
    //   name['content'][0]['attachment']['data'];
    // console.log(linkSource);
    // const downloadLink = document.createElement('a');
    // const fileName = name['content'][0]['attachment']['title'];

    // downloadLink.href = linkSource;
    // downloadLink.download = fileName;
    // downloadLink.click();
  }

  // convertBase64ToFile (data) {
  //   const obj = data;
  //   this.fileLink = [];
  //   const binaryString = data.content[0].attachment.data;

  //   const binary = atob(binaryString.replace(/\s/g, ''));
  //   const len = binary.length;
  //   const buffer = new ArrayBuffer(len);
  //   const view = new Uint8Array(buffer);
  //   for (let i = 0; i < len; i++) {
  //       view[i] = binary.charCodeAt(i);
  //   }

  //   const blob = new Blob( [view], { type: data.content[0].attachment.contentType });
  //   const fileOfBlob = new File ([blob], data.content[0].attachment.title );
  //   const url = URL.createObjectURL(blob);
  //   console.log('url: ', url);
  //   this.fileLink.push(url);

  // }


  onCancel() {
    sessionStorage.removeItem('patientSummaryId');
    this.router.navigate(['/servreqmain']);
  }

  onSave() {
    // this.savingData();
    const questionnaireResponse = new FHIR.QuestionnaireResponse;
    const questionnaireIdentifier = new FHIR.Identifier;

    questionnaireIdentifier.value = 'SERVREQ';
    questionnaireResponse.resourceType = 'QuestionnaireResponse';
    questionnaireResponse.identifier = questionnaireIdentifier;

    const questionnaireReference = new FHIR.Reference;
    questionnaireReference.reference = 'Questionnaire/' + this.formId;
    questionnaireResponse.questionnaire = questionnaireReference;


    questionnaireResponse.status = 'in-progress';

    questionnaireResponse.authored = new Date;

    const subjectReference = new FHIR.Reference;
    subjectReference.reference = 'Patient/' + this.clientId;
    subjectReference.display = this.clientGivenName + ' ' + this.clientFamilyName;
    questionnaireResponse.subject = subjectReference;

    const items = [];
    console.log(this.questionsList);

    for (const questions of this.questionsList) {
      for (const question of questions) {
        if (question['answer'] && question['answer'].length > 0) {
          console.log(question['answer']);
          console.log(question['answer'].length);
          const item = new FHIR.QuestionnaireResponseItem;
          if (!question['enableWhen']) {
            item.linkId = question['linkId'];
            item.text = question['text'];
            item.answer = this.fetchAnswer(question);
            items.push(item);
          } else if (question['enableWhen'] && question['enabled']) {
            item.linkId = question['linkId'];
            item.text = question['text'];
            item.answer = this.fetchAnswer(question);
            items.push(item);
          }
        }
      }
    }
    console.log(this.documentReference);
    if (this.documentReference) {
      const documentItem = new FHIR.QuestionnaireResponseItem;
      documentItem.linkId = this.documentReference['linkId'];
      documentItem.text = this.documentReference['text'];
      documentItem.answer = this.fetchAnswer(this.documentReference);
      console.log(documentItem);
      items.push(documentItem);
    }
    questionnaireResponse.item = items;
    this.questionnaireService.saveRequest(questionnaireResponse).subscribe(
      data => this.handleSuccessOnSave(data),
      error => this.handleErrorOnSave(error)
    );
  }

  fetchAnswer(question): FHIR.Answer[] {
    const answerArray = new Array<FHIR.Answer>();
    const answer = new FHIR.Answer;
    if (question['type'] === 'choice' || question['type'] === 'text') {
      answer.valueString = question['answer'];
    }
    if (question['type'] === 'boolean') {
      answer.valueBoolean = question['answer'];
    }
    if (question['type'] === 'Reference') {
      const answerReference = new FHIR.Reference;
      answerReference.reference = question['answer'];
      answer.valueReference = answerReference;
    }
    answerArray.push(answer);
    return answerArray;
  }

  submit(value: { [name: string]: any }) {
    console.log(value);

    // check the value arr for empty data
    // pop empty data


    // map to items??

    // this.items.forEach(element => {
    //   for (const key in value) {
    //     if (value.hasOwnProperty(key)) {
    //       if (key === element.text) {
    //         element.answer = value[key];
    //       }
    //     }
    //   }
    // });

    // post on fhir



    // this.disableInputsForReview = true;
    // this.savingData();

    // this.questionnaireService
    //   .saveRequest(this.itemToSend)
    //   .subscribe(
    //     data => this.handleSuccessOnSave(data),
    //     error => this.handleErrorOnSave(error)
    //   );

    // console.log(this.itemToSend);

    // this.submitingFormData.itemToSend = this.itemToSend;
    // this.submitingFormData.formId = this.formId;
    // console.log(this.submitingFormData, this.submitingFormData.itemToSend);
    // this.questionnaireService.shareServiceResponseData(this.itemToSend);

    // this.questionnaireService.shareServiceResponseData(this.responseId);
  }

  onEdit() {
    this.disableInputsForReview = false;
  }

  backToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  savingData() {
    console.log('iam saved');

    const questionnaireResponse = new FHIR.QuestionnaireResponse;
    const questionnaireIdentifier = new FHIR.Identifier;

    questionnaireIdentifier.value = 'SERVREQ';

    questionnaireResponse.resourceType = 'QuestionnaireResponse';

    const questionnaireReference = new FHIR.Reference;
    questionnaireReference.reference = 'Questionnaire/' + this.formId;

    questionnaireResponse.status = 'in-progress';

    questionnaireResponse.authored = new Date;

    const subjectReference = new FHIR.Reference;
    subjectReference.reference = 'Patient/' + this.clientId;
    subjectReference.display = this.clientGivenName + ' ' + this.clientFamilyName;

    questionnaireResponse.identifier = questionnaireIdentifier;
    questionnaireResponse.subject = subjectReference;

    const items = [];

    for (const questions of this.questionsList) {
      for (const question of questions) {
        const item = new FHIR.QuestionnaireResponseItem;
        if (!question['enableWhen']) {
          item.linkId = question['linkId'];
          item.text = question['text'];
          item.answer = question['answer'];
          items.push(item);
        } else if (question['enableWhen'] && question['enabled']) {
          item.linkId = question['linkId'];
          item.text = question['text'];
          item.answer = question['answer'];
          items.push(item);
        }
      }
    }
    if (this.documentReference !== {}) {
      items.push(this.documentReference);
    }
    questionnaireResponse.item = items;
    this.itemToSend = questionnaireResponse;
    console.log(this.itemToSend);
  }

  getClientData(data) {
    console.log(data);
    this.clientBoD = data.birthDate;
    this.clientGivenName = data.name[0].given[0];
    this.clientFamilyName = data.name[0].family;
  }

  handleErrorClientError(error) {
    console.log(error);
  }


  // get form data from the server
  // handleSuccess(data) {
  //   this.qrequest = data.item;
  //   console.log(this.qrequest);
  //   // maping part of the data from the server to item
  //   this.items = this.qrequest.map(el => ({
  //     ...this.item,
  //     linkId: el.linkId,
  //     text: el.text
  //   }));
  //   console.log(this.items);
  //   // checking health exam done externaly

  //   this.items.forEach(el => {
  //     if (el.text === 'Health Exam Done Externally') {
  //       el.answer = false;
  //     }
  //   });

  //   // checking dependents
  //   // this.checkDependentItem(this.items);
  //   // console.log(this.dependents);

  //   console.log(this.responseId);
  //   if (this.responseId === null) {
  //     this.getResponseId();
  //   }
  // }

  getFormData(data) {
    console.log(data);
    this.qrequest = data.item;

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
        } else {
          return {
            type: 'input',
            label: el.text,
            inputType: 'text',
            placeholder: 'type your text',
            name: el.linkId,
            flag: el.enableWhen ? false : true,
            enableWhenQ: el.enableWhen ? el.enableWhen[0].question : false,
            enableWhenA: el.enableWhen ? el.enableWhen[0].answerCoding.code : false,
            value: '',
            // validation: el.enableWhen ? [Validators.required, Validators.minLength(4)] : null,
            validation: el.enableWhen ? null : [Validators.required, Validators.minLength(4)]
          };
        }
      }
      if (el.type === 'choice') {
        const options = [];
        el.option.forEach(el1 => {
          options.push(el1.valueCoding.code);
        });
        // FIX ME ASAP
        // if (el.text === 'Department Name') {
        //   const formField = this.selectField(el);
        //   formField['value'] = '';
        //   formField['options'] = this.departmentList;
        //   return formField;

        // } else {
        return {
          type: 'select',
          label: el.text,
          name: el.linkId,
          enableWhenQ: el.enableWhen ? el.enableWhen[0].question : false,
          enableWhenA: el.enableWhen ? el.enableWhen[0].answerCoding.code : false,
          flag: el.enableWhen ? false : true,
          options: options,
          placeholder: 'Select an option',
          // validation: el.enableWhen ? [Validators.required] : null,
          validation: el.enableWhen ? null : [Validators.required],
          value: ''
        };

        // [ctrl => ctrl.value === "Turn me off" ? null: Validators.required(ctrl)]
        // }

      } if (el.type === 'open-choice') {
        return {
          type: 'select',
          label: el.text,
          flag: el.enableWhen ? false : true,
          name: el.linkId,
          enableWhenQ: el.enableWhen ? el.enableWhen[0].question : false,
          enableWhenA: el.enableWhen ? el.enableWhen[0].answerCoding.code : false,
          class: 'checkEnableWhen($event.target.value, i)',
          placeholder: 'Select an option',
          value: ''
        };

      } if (el.type === 'boolean') {
        return {
          type: 'checkbox',
          label: el.text,
          name: el.linkId,
          enableWhenQ: el.enableWhen ? el.enableWhen[0].question : false,
          enableWhenA: el.enableWhen ? el.enableWhen[0].answerCoding.code : false,
          // placeholder: 'Select an option',
          // validation: el.enableWhen ? null : [Validators.required],
          value: false
        };
      }
    });

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

    this.config = this.configuration;


    console.log(this.configuration);
    console.log(this.config);
    this.config.forEach(element => {
      if (element.enableWhenA && element.enableWhenQ) {
        console.log('HEY BABY!', element.enableWhenA, element.enableWhenQ);
        element.elementClass = 'enable-when-hide';
      } else {
        element.elementClass = 'enable-when-show';
      }

    });


    // maping part of the data from the server to item
    this.items = this.qrequest.map(el => ({
      ...this.item,
      linkId: el.linkId,
      text: el.text
    }));
  }



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
    setTimeout(() => {
      let previousValid = this.form.valid;
      this.form.changes.subscribe(() => {
        if (this.form.valid !== previousValid) {
          previousValid = this.form.valid;
          this.form.setDisabled('submit', !previousValid);
        }
      });

      this.form.setDisabled('submit', true);
      // this.form.setValue('1', this.userName);
      // this.form.setValue('2', this.currentUserDepartment);

    });

    // if you want to style 2 form fields per a row do these :
    // this.wrap();
    // this.addDiv();
  }

  public checkEnableWhen(value, index) {
    this.config.forEach(el => {
      if (el.enableWhenA && el.enableWhenQ) {
        if (index === el.enableWhenQ) {
          // this.config.forEach(elem => {

          // });
          if (value === el.enableWhenA) {
            // console.log('BINGO@222!!', el.name);
            el.elementClass = 'enable-when-show';
            el.flag = true;
            // this.form.createControl(el).setValidators(console.log(el));
            // this.form.createControl([ctrl => ctrl.value === "Turn me off" ? null: Validators.required(ctrl)]);
            // mobile: new FormControl('', [ctrl => ctrl.value === "Turn me off" ? null: Validators.required(ctrl)]),
          } else {
            el.flag = false;
            el.elementClass = 'enable-when-hide';
            el.validation = undefined;
            this.form.setValue(el.name, '');
            this.config.forEach(elem => {
              if (elem.enableWhenA && elem.enableWhenQ) {
                if (el.name === elem.enableWhenQ && elem.elementClass === 'enable-when-show') {
                  elem.elementClass = 'enable-when-hide';
                }
              }

            });
          }
        }
      }
      console.log(el.name, el.validation);
    });
    console.log(this.config);
    // this.config = this.configuration;
  }

  handleError(error) {
    console.log(error);
  }


  // getting response from thr server on "next"
  handleSuccessOnSave(data) {
    console.log(data);
    this.createdsuccessfully = true;
    // this.responseId = data.id;
    // console.log(this.responseId);
    // this.questionnaireService.shareResponseId(this.responseId);
    // this.questionnaireService.shareServiceFormId(this.formId);
  }

  handleErrorOnSave(error) {
    console.log(error);
  }

  getResponseId() {
    this.questionnaireService.newResponseIdSubject.subscribe(
      data => this.handleSuccessResponseId(data),
      error => this.handleErrorResponseId(error)
    );
  }

  handleSuccessResponseId(data) {
    console.log(data);
    this.responseId = data;
    console.log(this.responseId);
    // get data from the server

    if (this.responseId !== null) {
      this.getResponse();
    }
  }

  handleErrorResponseId(error) {
    console.log(error);
  }

  getResponse() {
    this.questionnaireService
      .getResponse(this.responseId)
      .subscribe(
        data => this.handleSuccessResponse(data),
        error => this.handleErrorResponse(error)
      );
  }

  handleSuccessResponse(data) {
    console.log(data);
    this.itemToSend = data;
    console.log(this.itemToSend);
    console.log(this.items);

    this.items = this.itemToSend.item.map(el => {
      if (el.text === 'Document') {
        return {
          linkId: el.linkId,
          text: el.text,
          answer: el.answer[0].valueReference.reference
        };
      }
      if (el.text === 'Health Exam Done Externally' || el.text === 'Dependent Involved') {
        return {
          linkId: el.linkId,
          text: el.text,
          answer: el.answer[0].valueBoolean
        };
      } else {
        return {
          linkId: el.linkId,
          text: el.text,
          answer: el.answer[0].valueString
        };
      }
    });

    console.log(this.items);
  }

  handleErrorResponse(error) {
    console.log(error);
  }

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

  checkDependentItem(itemsServer) {
    itemsServer.forEach(element => {
      if (element.text === 'Dependent Involved') {
        this.dependents = true;
        console.log(this.dependents);
      }
    });
  }

  //  get status for the service request

  // checkingEnableWhen(value, index) {
  //   if (this.questionsList.length > 0) {
  //     this.questionsList[index].forEach(question => {
  //       if (question['enableWhen']) {
  //         question.enabled = false;
  //         question['enableWhen'].forEach(element => {
  //           if (element['answerCoding']['code'] === value) {
  //             question.enabled = true;
  //           }
  //         });
  //       }
  //     });
  //   }
  // }
}

