import { Component, OnInit, ViewChild } from '@angular/core';
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

import * as FHIR from '../../interface/FHIR';

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

  documents = null;
  fileLink = [];
  itemReference;

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

  itemToSend: ItemToSend = {
    resourceType: '',
    extension: null,
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
    private patientService: PatientService
  ) {}

  ngOnInit() {
    this.questionnaireService
      .getForm(this.formId)
      .subscribe(
        data => this.handleSuccess(data),
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
    const that = this;
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


      that.questionnaireService.postDataFile(JSON.stringify(documentReference)).subscribe(
        data =>   {
          that.retrieveDocuments(data),
          that.createItemReferenceObject(data);
        }
      );

      // console.log (contentAttachment);
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

  createItemReferenceObject(data) {
    const obj: string = data.id;
    // const item = new FHIR.Item;
    // const answer = new FHIR.Answer;
    // const reference = new FHIR.Reference;

    // reference.reference = 'DocumentReference/' + obj.id;

    // answer.valueReference = reference;

    // item.linkId = '30';
    // item.text = obj.content[0].attachment.title;
    // item.answer = answer;
    // this.itemReference = item;
    // console.log('here is the object for doc ref:' , item );
    // return item;

    this.itemReference = {
      linkId: '30',
      // text: obj.content[0].attachment.title,
      text: 'Document',
      answer:  'DocumentReference/' + obj
    };


  }

  retrieveDocuments(data) {
    this.documents = data;
  }


  onCancel() {
    this.router.navigate(['/servreqmain']);
  }

  onSave() {
    this.savingData();
    this.questionnaireService.saveRequest(this.itemToSend).subscribe(
      data => this.handleSuccessOnSave(data),
      error => this.handleErrorOnSave(error)
    );
  }

  onNext() {
    this.savingData();

    this.questionnaireService
      .saveRequest(this.itemToSend)
      .subscribe(
        data => this.handleSuccessOnSave(data),
        error => this.handleErrorOnSave(error)
      );

    console.log(this.itemToSend);

    this.submitingFormData.itemToSend = this.itemToSend;
    this.submitingFormData.formId = this.formId;
    console.log(this.submitingFormData, this.submitingFormData.itemToSend);
    this.questionnaireService.shareServiceResponseData(this.itemToSend);

    this.questionnaireService.shareServiceResponseData(this.responseId);
  }

  savingData() {
    this.getDate();

    // To-Do: check if has dependents => add dependents

    // ToDo: add patient/#, subject, exstention

    if (this.dependents === true) {
      this.items.forEach(element => {
        console.log(element.text);

        if (element.text === 'Dependent Involved') {
          if (this.dependentNumber === 0) {
            return (element.answer = false);
          } else {
            return (element.answer = true);
          }
        }
      });
    }

    // pushing document into itmes arr
    if (this.itemReference) {
      this.items.push(this.itemReference);
    }


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
      extension: [
        {
          url: 'https://bcip.smilecdr.com/fhir-request/givenName',
          valueCode: this.clientGivenName
        },
        {
          url: 'https://bcip.smilecdr.com/fhir-request/familyName',
          valueCode: this.clientFamilyName
        },
        {
          url: 'https://bcip.smilecdr.com/fhir-request/birthDate',
          valueDateTime: this.clientBoD
        }
      ],
      item: []
    };


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

  addDependent() {}

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

  handleSuccess(data) {
    this.qrequest = data.item;
    console.log(this.qrequest);
    const enableWhenList = [];
    // maping part of the data from the server to item
    // const temp = ['1'];
    // const dep = ['1.1'];
    // dep.push('1.2');
    // const arr = [temp, dep];
    for (const questionnaire of this.qrequest) {
      if (!questionnaire['enableWhen']) {
        const temp = {};
        temp['linkId'] = questionnaire['linkId'];
        temp['text'] = questionnaire['text'];
        temp['type'] = questionnaire['type'];
        temp['enabled'] = questionnaire['required'];
        temp['option'] = questionnaire['option'];
        temp['answer'] = '';
        this.questionsList.push([temp]);
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
    for (const enableWhen of enableWhenList) {
      const linkId = enableWhen['linkId'];
      const primaryLinkId = (linkId.substring(0, linkId.indexOf('.'))) - 1;
      const subLinkId = linkId.substring(linkId.indexOf('.') + 1, linkId.length);
      enableWhen['enabled'] = false;
      this.questionsList[primaryLinkId][subLinkId] = enableWhen;
    }
    console.log(this.questionsList);
  }


  handleError(error) {
    console.log(error);
  }

  buildQuestionnaireItem() {}


  // getting response from thr server on "next"
  handleSuccessOnSave(data) {
    console.log(data);
    this.responseId = data.id;
    console.log(this.responseId);
    this.questionnaireService.shareResponseId(this.responseId);
    this.questionnaireService.shareServiceFormId(this.formId);

    this.router.navigate(['/summary']);
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
    console.log('Hello');
    if (this.questionsList.length > 0) {
      console.log(value, index);
      this.questionsList[index].forEach(question => {
        if (question['enableWhen']) {
          question.enabled = false;
          console.log(question);
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
