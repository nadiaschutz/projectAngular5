import { Component, OnInit, ViewChild, SkipSelf } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
import { PatientService } from 'src/app/service/patient.service';
import { formatDate } from '@angular/common';

import * as FHIR from '../../interface/FHIR';
import { link } from 'fs';

@Component({
  selector: 'app-new-service-request',
  templateUrl: './new-service-request.component.html',
  styleUrls: ['./new-service-request.component.scss']
})
export class NewServiceRequestComponent implements OnInit {
  // @ViewChild('advReqForm') form: NgForm;
  // serviceRequestResponce: ServiceRequestResponce = {
  // };

  formId = 'TEST1';
  responseId = null;
  clientId = null;
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
    private userService: UserService,
    private patientService: PatientService
  ) {}

  ngOnInit() {
    this.createdsuccessfully = false;
    this.questionnaireService
      .getForm(this.formId)
      .subscribe(
        data => this.processQuestionnaire(data),
        error => this.handleError(error)
      );
    this.clientId = this.userService.returnSelectedID();
    console.log(this.clientId);

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
    reader.onloadend = function() {

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

      documentReferenceCodeableConcept.coding = [ documentReferenceCoding];
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
    this.router.navigate(['/servreqmain']);
  }

  onSave() {
    // this.savingData();
    const questionnaireResponse = new FHIR.QuestionnaireResponse;

    questionnaireResponse.resourceType = 'QuestionnaireResponse';

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

  onNext() {
    this.disableInputsForReview = true;
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
    const questionnaireResponse = new FHIR.QuestionnaireResponse;

    questionnaireResponse.resourceType = 'QuestionnaireResponse';

    const questionnaireReference = new FHIR.Reference;
    questionnaireReference.reference = 'Questionnaire/' + this.formId;

    questionnaireResponse.status = 'in-progress';

    questionnaireResponse.authored = new Date;

    const subjectReference = new FHIR.Reference;
    subjectReference.reference = 'Patient/' + this.clientId;
    subjectReference.display = this.clientGivenName + ' ' + this.clientFamilyName;
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

  processQuestionnaire(data) {
    this.qrequest = data.item;
    const questions = [];
    const enableWhenList = [];
    for (const questionnaire of this.qrequest) {
      if (!questionnaire['enableWhen']) {
        const temp: any = {};
        const linkId = questionnaire['linkId'];
        temp['linkId'] = linkId;
        temp['text'] = questionnaire['text'];
        temp['type'] = questionnaire['type'];
        temp['required'] = questionnaire['required'];
        temp['option'] = questionnaire['option'];
        temp['answer'] = '';
        questions[linkId] = [temp];
      } else {
        const temp = {};
        temp['linkId'] = questionnaire['linkId'];
        temp['text'] = questionnaire['text'];
        temp['type'] = questionnaire['type'];
        temp['answer'] = '';
        temp['enableWhen'] = questionnaire['enableWhen'];
        enableWhenList.push(temp);
      }
    }
    console.log(questions);
    console.log(enableWhenList);
    for (const enableQuestion of enableWhenList) {
      const parentQuestionLinkId = enableQuestion.enableWhen[0]['question'];
      questions[parentQuestionLinkId].push(enableQuestion);
      console.log(questions[parentQuestionLinkId]);
    }
    console.log(questions);
    if (Object.keys(questions).length > 0) {
      for (const key of Object.keys(questions)) {
        this.questionsList.push(questions[key]);
      }
    }
    console.log(this.questionsList);
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
      if (el.text === 'Health Exam Done Externally' || el.text === 'Dependent Involved' ) {
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

  checkingEnableWhen(value, index) {
    if (this.questionsList.length > 0) {
      this.questionsList[index].forEach(question => {
        if (question['enableWhen']) {
          question.enabled = false;
          question['enableWhen'].forEach(element => {
            if (element['answerCoding']['code'] === value) {
              question.enabled = true;
            }
          });
        }
      });
    }
  }
}

