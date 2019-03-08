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
import { e } from '@angular/core/src/render3';
import { runInThisContext } from 'vm';

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


class CommentInput {
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
  currentUserDepartment;

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
  dependentsList = [];
  dependentBoolean = false;
  dependentNumber = null;
  qrequest: any;

  questionsList = [];

  submitingFormData: {
    formId: any;
    itemToSend: any;
  };

  // itemToSend: FHIR.QuestionnaireResponse;
  itemReference;

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
    answer: null,
    code: null
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
    // remove submit button if there any


    // ADDING DEPENDANTS ON FHIR RESPONCE OBJECT
    // V get dependents
    // V build the div / form items with dependents
    // add dependentsList into the form data

    // add flag on/off
    // if item.dependents === true {
    // add class = 'enable-when-show'
    // } else {
    //   add class = 'enable-when-hide'
    // }
    // grab data
    // figure out how to store in the object on FHIR
    // add data to this.itemsToSend


    // change SR for employee , instead of dependent BOOLEAN add actuall dependents references

    // CREATING NEW SR FOR DEPENDANTS
    // basically make a copy of the current SR
    // remove dependents item
    // change subject to current patient + ID
    // POST them


    // ADDING DEPENDANTS STRAIGHT FROM THE CREATE SR PAGE
    // save current data in session storage
    // add a button 'add dependent'
    // route to the add dependent page
    // go back on submit
    // load the page
    // assign the data from session storage

    // this.activatedRoute.data.subscribe(data => this.processQuestionnaire(data.fields));
    this.dependentsList.push('NADIA TEST');
    this.activatedRoute.data.subscribe(data => this.getFormData(data.fields));
    // this.activatedRoute.data.subscribe(data => console.log(data));

    this.activatedRoute.data.subscribe(data => this.populateDeptNames(data.departments));

    this.userName = sessionStorage.getItem('userName');
    this.currentUserDepartment = sessionStorage.getItem('userDept');


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

    this.items.forEach(indivElem => {
      // tslint:disable-next-line:forin
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          if (key === indivElem.linkId) {
            indivElem.answer = value[key];
          }
        }
      }
    });

    console.log(this.items);
    // console.log(this.userName, this.currentUserDepartment);

    // this.disableInputsForReview = true;
    this.savingData();

    this.questionnaireService
      .saveRequest(this.itemToSend)
      .subscribe(
        data => this.handleSuccessOnSave(data),
        error => this.handleErrorOnSave(error)
      );

    console.log(this.itemToSend);

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
    this.getDate();

    // const questionnaireResponse = new FHIR.QuestionnaireResponse;
    // const questionnaireIdentifier = new FHIR.Identifier;

    // questionnaireIdentifier.value = 'SERVREQ';

    // questionnaireResponse.resourceType = 'QuestionnaireResponse';

    // const questionnaireReference = new FHIR.Reference;
    // questionnaireReference.reference = 'Questionnaire/' + this.formId;

    // questionnaireResponse.status = 'in-progress';

    // questionnaireResponse.authored = new Date;

    // const subjectReference = new FHIR.Reference;
    // subjectReference.reference = 'Patient/' + this.clientId;
    // subjectReference.display = this.clientGivenName + ' ' + this.clientFamilyName;

    // questionnaireResponse.identifier = questionnaireIdentifier;
    // questionnaireResponse.subject = subjectReference;

    const items = [];

    // for (const questions of this.questionsList) {
    //   for (const question of questions) {
    //     const item = new FHIR.QuestionnaireResponseItem;
    //     if (!question['enableWhen']) {
    //       item.linkId = question['linkId'];
    //       item.text = question['text'];
    //       item.answer = question['answer'];
    //       items.push(item);
    //     } else if (question['enableWhen'] && question['enabled']) {
    //       item.linkId = question['linkId'];
    //       item.text = question['text'];
    //       item.answer = question['answer'];
    //       items.push(item);
    //     }
    //   }
    // }

    // if (this.documentReference !== {}) {
    //   items.push(this.documentReference);
    // }
    // getting itemReference
    this.questionnaireService.newDocumentSubject.subscribe(
      data => this.getDocument(data),
      error => this.handleError(error)
    );

    // pushing document into items arr
    if (this.itemReference) {
      this.items.push(this.itemReference);
    }

    // creating itemToSend
    this.createItemToSend();

    // adding extra items to itemToSend.item[]
    this.mapItemToItems();
    // questionnaireResponse.item = items;
    // this.itemToSend = questionnaireResponse;
    console.log(this.itemToSend);
  }


  createItemToSend() {

    this.itemToSend = {
      resourceType: 'QuestionnaireResponse',
      questionnaire: {
        reference: 'Questionnaire/' + this.formId
      },
      status: 'in-progress',
      authored: new Date,
      identifier: {
        value: 'SERVREQ'
      },
      subject: {
        reference: 'Patient/' + this.clientId,
        display: this.clientGivenName + ' ' + this.clientFamilyName
      },
      item: []
    };

  }

  mapItemToItems() {
    // this.items.forEach(i => {
    //   if (!i.answer) {
    //     console.log(i);

    //   }
    // });

    const itemsFiltered = this.items.filter(itemToStay => itemToStay.answer !== null);
    console.log("DON'T CRY", itemsFiltered);
    this.itemToSend.item = itemsFiltered.map(el => {

      console.log(el.linkId, typeof (el.answer));
      if (el.linkId !== '') {
        // console.log(el.linkId, el.answer);
        // if (el.text === 'Document') {
        //   return {
        //     linkId: el.linkId,
        //     text: el.text,
        //     answer: [
        //       {
        //         valueReference: {
        //           reference: el.answer
        //         }
        //       }
        //     ]
        //   };
        // }


        return {
          linkId: el.linkId,
          text: el.text,
          answer:
            el.text === 'Document' ? [
              {
                valueReference: {
                  reference: el.answer
                }
              }
            ] :
              typeof (el.answer) === 'boolean' ? [
                {
                  valueCoding: {
                    code: el.code
                  }
                },
                {
                  valueBoolean: el.answer
                }
              ] :
                typeof (el.answer) === 'string' ? [
                  {
                    valueCoding: {
                      code: el.code
                    }
                  },
                  {
                    valueString: el.answer
                  }
                ] :
                  null
        };


        // if (
        //   el.text === 'Dependent Involved' ||
        //   el.text === 'Health Exam Done Externally'
        // ) {
        //   return {
        //     linkId: el.linkId,
        //     text: el.text,
        //     answer: [
        //       {
        //         valueBoolean: el.answer
        //       }
        //     ]
        //   };
        // } else {
        //   return {
        //     linkId: el.linkId,
        //     text: el.text,
        //     answer: [
        //       {
        //         valueString: el.answer
        //       }
        //     ]
        //   };
        // }

      }


    });
  }

  getDocument(data) {
    this.itemReference = data;
  }

  getClientData(data) {
    let dependentLink;
    console.log(data);
    this.clientBoD = data.birthDate;
    this.clientGivenName = data.name[0].given[0];
    this.clientFamilyName = data.name[0].family;
    // search for the dependent link
    if (data['extension']) {
      data['extension'].forEach(extension => {
        // console.log('TRUE', extension['url']);
        if (extension['url'].indexOf('dependentlink') !== -1) {
          dependentLink = extension['valueString'];
          console.log(dependentLink);
        }
      });
    }

    // calling data to get dependents

    if (dependentLink) {
      this.patientService
        .getPatientByLinkID('ac96074d-4c5f-47f1-8fae-8d7dc71eff55' + '&employeetype=Dependent')
        .subscribe(
          dependentData => this.getDependentsData(dependentData),
          error => this.handleErrorClientError(error)
        );
    }


  }

  handleErrorClientError(error) {
    console.log(error);
  }


  getDependentsData(data) {
    if (data.total > 0) {
      console.log('DEPENDENTS', data);
      data.entry.forEach(dependent => {
        let name;
        console.log(dependent.resource.name);
        name = dependent.resource.name[0].given[0] + ' ' + dependent.resource.name[0].family;
        // name.push(dependent.resource.name[0].family);
        console.log(name);
        this.dependentsList.push(name);
      });
    }
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
        if (el.code[1].code === 'PHONE') {


          const formField = this.textInput(el);
          formField['placeholder'] = 'type your phone';
          formField['validation'] = el.enableWhen ? undefined : [
            Validators.required,
            Validators.pattern(
              '^[(]{0,1}[0-9]{3}[)]{0,1}[-s.]{0,1}[0-9]{3}[-s.]{0,1}[0-9]{4}$'
            )
          ];
          formField['enableWhenQ'] = el.enableWhen ? el.enableWhen[0].question : false;
          formField['enableWhenA'] = el.enableWhen ? el.enableWhen[0].answerCoding.code : false;
          formField['value'] = null;
          formField['elementClass'] = el.enableWhen ? 'enable-when-hide' : 'enable-when-show';
          return formField;

          // return {
          //   type: 'input',
          //   label: el.text,
          //   inputType: 'text',
          //   placeholder: 'type your phone',
          //   name: el.linkId,
          //   enableWhenQ: el.enableWhen ? el.enableWhen[0].question : false,
          //   enableWhenA: el.enableWhen ? el.enableWhen[0].answerCoding.code : false,
          //   value: '',
          //   validation: [Validators.required, Validators.pattern(
          //     '^[(]{0,1}[0-9]{3}[)]{0,1}[-s.]{0,1}[0-9]{3}[-s.]{0,1}[0-9]{4}$'
          //   )]
          // };

        } else if (el.code[1].code === 'EMAIL') {

          const formField = this.textInput(el);
          formField['placeholder'] = 'type your email';
          formField['validation'] = el.enableWhen ? undefined : [Validators.required, Validators.email];
          formField['enableWhenQ'] = el.enableWhen ? el.enableWhen[0].question : false;
          formField['enableWhenA'] = el.enableWhen ? el.enableWhen[0].answerCoding.code : false;
          formField['value'] = null;

          formField['flag'] = el.enableWhen ? false : true;
          formField['elementClass'] = el.enableWhen ? 'enable-when-hide' : 'enable-when-show';
          // flag: el.enableWhen ? false : true,
          return formField;


        } else if (el.code[1].code === 'COMMENT') {

          const formField = this.commentInput(el);
          formField['placeholder'] = 'type your text';
          formField['validation'] = undefined;
          formField['enableWhenQ'] = el.enableWhen ? el.enableWhen[0].question : false;
          formField['enableWhenA'] = el.enableWhen ? el.enableWhen[0].answerCoding.code : false;
          formField['value'] = null;

          formField['flag'] = el.enableWhen ? false : true;

          formField['elementClass'] = el.enableWhen ? 'enable-when-hide' : 'enable-when-show';

          // flag: el.enableWhen ? false : true,
          return formField;

        } else if (el.text === 'Created By') {

          const formField = this.textInput(el);
          formField['placeholder'] = 'type your text';
          // formField['validation'] = el.enableWhen ? null : [
          //   Validators.required
          // ];
          return formField;
        } else if (el.text === 'User Account Department') {

          const formField = this.textInput(el);
          formField['placeholder'] = 'type your text';
          // formField['validation'] = el.enableWhen ? null : [
          //   Validators.required
          // ];
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
            value: null,
            validation: el.enableWhen ? undefined : [Validators.required, Validators.minLength(4)],
            // validation: [Validators.required, Validators.minLength(4)],
            elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',
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
          options: options,
          flag: el.enableWhen ? false : true,
          placeholder: 'Select an option',
          // validation: el.enableWhen ? [Validators.required] : null,
          validation: el.enableWhen ? undefined : [Validators.required],
          // validation: [Validators.required],
          value: null,
          elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',
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
          value: null,
          elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',
        };

      } if (el.type === 'boolean') {
        return {
          type: 'checkbox',
          label: el.text,
          name: el.linkId,
          enableWhenQ: el.enableWhen ? el.enableWhen[0].question : false,
          enableWhenA: el.enableWhen ? el.enableWhen[0].answerCoding.code : false,
          elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',

          // placeholder: 'Select an option',
          // validation: el.enableWhen ? null : [Validators.required],
          value: el.enableWhen ? null : false,
        };
      }
    });



    console.log('BEFORE ADDING DEPENDENT', this.configuration);
    if (this.dependentsList !== []) {


      this.dependentsList.forEach((dependent) => {
        console.log(this.dependentsList);
        this.configuration.push(
          {
            type: 'depend',
            name: '24-3',
            label: dependent,
            // enableWhenQ: '24',
            // enableWhenA: true,
            elementClass: 'enable-when-show',

            // placeholder: 'Select an option',
            // validation: el.enableWhen ? null : [Validators.required],
            value: false,

          }
        );
      });

    }

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


    console.log('AFTER ADDING DEPENDENT', this.configuration);
    console.log(this.config);
    // this.config.forEach(element => {
    //   if (element.enableWhenA && element.enableWhenQ) {
    //     console.log('HEY BABY!', element.enableWhenA, element.enableWhenQ);
    //     element.elementClass = 'enable-when-hide';
    //     // this.form.setDisabled(element.name, true);
    //   } else {
    //     element.elementClass = 'enable-when-show';
    //     // this.form.setDisabled(element.name, false);
    //   }

    // });


    // maping part of the data from the server to item
    this.items = this.qrequest.map(el => ({
      ...this.item,
      linkId: el.linkId,
      text: el.text,
      code: el.code[0].code
    }));
  }



  textInput(data) {
    return TextInput.create({
      type: 'input',
      label: data.text,
      inputType: 'text',
      name: data.linkId,
      // enableWhenQ: data.enableWhen ? data.enableWhen[0].question : false,
      // enableWhenA: data.enableWhen ? data.enableWhen[0].answerCoding.code : false,
    });
  }

  commentInput(data) {
    return CommentInput.create({
      type: 'comment',
      label: data.text,
      name: data.linkId,
      // enableWhenQ: data.enableWhen ? data.enableWhen[0].question : false,
      // enableWhenA: data.enableWhen ? data.enableWhen[0].answerCoding.code : false,
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
      validation: [Validators.required],
      enableWhenQ: data.enableWhen ? data.enableWhen[0].question : false,
      enableWhenA: data.enableWhen ? data.enableWhen[0].answerCoding.code : false,
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
      // this.form.setDisabled('1', true);
      // this.form.setDisabled('14', true);
      this.form.setValue('1', this.userName);
      this.form.setValue('14', this.currentUserDepartment);
      console.log(this.form);

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
            // this.form.setDisabled(el.name, false);

            // this.form.createControl(el).setValidators(console.log(el));
            // this.form.createControl([ctrl => ctrl.value === "Turn me off" ? null: Validators.required(ctrl)]);
            // mobile: new FormControl('', [ctrl => ctrl.value === "Turn me off" ? null: Validators.required(ctrl)]),
          } else {
            el.flag = false;
            el.elementClass = 'enable-when-hide';
            // this.form.setDisabled(el.name, true);
            // el.validation = undefined;
            this.form.setValue(el.name, null);
            this.config.forEach(elem => {
              if (elem.enableWhenA && elem.enableWhenQ) {
                if (el.name === elem.enableWhenQ && elem.elementClass === 'enable-when-show') {
                  elem.elementClass = 'enable-when-hide';
                  // this.form.setDisabled(elem.name, true);
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

