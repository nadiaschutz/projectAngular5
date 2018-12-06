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
import { analyzeAndValidateNgModules } from '@angular/compiler';

import * as FHIR from '../../interface/FHIR';
import { PatientService } from 'src/app/service/patient.service';



@Component({
  selector: 'app-new-service-request-no-client',
  templateUrl: './new-service-request-no-client.component.html',
  styleUrls: ['./new-service-request-no-client.component.scss']
})
export class NewServiceRequestNoClientComponent implements OnInit {
  // @ViewChild('serReqForm') form: NgForm;

  formId = '1953';

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
    private patientService: PatientService
  ) {}






  ngOnInit() {

    // getting formId to display form fields
    this.questionnaireService
      .getForm(this.formId)
      .subscribe(
        data => this.getFormData(data),
        error => this.getFormDataError(error)
      );


      if (this.formId !== '1953') {
        // getting clientId
        this.clientId = this.userService.returnSelectedID();
        console.log(this.clientId);
        // getting data for client to add to itmesToSend
        if (this.clientId) {
          this.patientService
            .getPatientDataByID(this.clientId)
            .subscribe(
              data => this.getClientData(data),
              error => this.getClientError(error)
            );
        } else if (!this.clientId) {
          this.router.navigateByUrl('/dashboard');
        }

      }

  }
  /*********************************************/





/************************************************/
/******************* onCancel() *****************/
/************************************************/

  // TO_DO: do post request to delete in-progress service requests
  onCancel() {
    if (this.formId === '1952') {
      this.router.navigate(['/dashboard']);
    }
    if (this.formId === '1953') {
      this.router.navigate(['/servreqmain']);
    }
  }





/************************************************/
/******************* onSave() *******************/
/************************************************/


  // TO_DO:  fix save function!!
  // onSave() {
  //   this.savingData();
  //   this.questionnaireService.saveRequest(this.itemToSend).subscribe(
  //     data => this.handleSuccessOnSave(data),
  //     error => this.handleErrorOnSave(error)
  //   );
  // }





/************************************************/
/******************* onNext() *******************/
/************************************************/
  onNext() {
    this.savingData();

    // sending itemToSend to server
    this.questionnaireService
      .saveRequest(this.itemToSend)
      .subscribe(
        data => this.onSaveSuccess(data),
        error => this.onSaveError(error)
      );

    console.log(this.itemToSend);


  }
/*********************************************/





/************************************************/
/***************** savingData() *****************/
/************************************************/

  savingData() {
    this.getDate();

    // To-Do: check if has dependents => add dependents

    // ToDo: add patient/#, subject, exstention

    if (this.dependents === true) {
      this.items.forEach(element => {
        // console.log(element.text);
        if (element.text === 'Dependent Involved') {
          if (this.dependentNumber === 0) {
            return (element.answer = false);
          } else {
            return (element.answer = true);
          }
        }
      });
    }

    // pushing document into items arr
    if (this.itemReference) {
      this.items.push(this.itemReference);
    }

    // creating itemToSend
    this.createItemToSend();

    // adding extra items to itemToSend.item[]
    this.mapItemToItems();
  }





/************************************************/
/************** getClientData(data) *************/
/************************************************/

  getClientData(data) {
    console.log(data);
    this.clientBoD = data.birthDate;
    this.clientGivenName = data.name[0].given[0];
    this.clientFamilyName = data.name[0].family;
  }

  getClientError(error) {
    console.log(error);
  }





/************************************************/
/****************** getFormData() ***************/
/************************************************/
  getFormData(data) {
    this.qrequest = data.item;
    console.log(this.qrequest);

    // maping part of the data from the server to item
    this.items = this.qrequest.map(el => ({
      ...this.item,
      linkId: el.linkId,
      text: el.text
    }));
    console.log(this.items);


    // checkingif there are any checkboxes in the form
    this.items.forEach(el => {
      if (el.text === 'Health Exam Done Externally' || el.text === 'Dependent Involved') {
        el.answer = false;
      }
    });

    // checking dependents
    this.checkDependentItem(this.items);
    // console.log(this.dependents);

    // console.log(this.responseId);
    // if (this.responseId === null) {
    //   this.getResponseId();
    // }
  }

  getFormDataError(error) {
    console.log(error);
  }
/************************************************/





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








  checkDependentItem(itemsServer) {
    itemsServer.forEach(element => {
      if (element.text === 'Dependent Involved') {
        this.dependents = true;
        console.log('dependents in the form:', this.dependents);
      }
    });
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










/************************************************/
/**************** addDocument() *****************/
/************************************************/

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



  createItemReferenceObject(data) {
    const obj: string = data.id;

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












/************************************************/
/******** enableWhen () not finished!! **********/
/************************************************/

checkingEnableWhen() {
  this.qrequest.forEach((el, index) => {
    // check if type = "choice"
    if (el.type === 'choice') {
      // console.log(el.item);
      // console.log(el);
      // check enableWhen data
      if (el.item) {
        // forEach loop
        el.item.forEach((e, i) => {
          // console.log(i);
          // console.log(e);
          // console.log(e.enableWhen[0]);
          // check if enblewhen.question number === linkId number and enableWhen.answerString === model.data

          // tslint:disable-next-line:no-shadowed-variable
          this.items.forEach((element, index) => {
            if (
              e.enableWhen[i].question === element[index].linkId &&
              e.enableWhen[i].answerString === element[index].answer
            ) {
              console.log(true);
              // show options
              console.log(e.option);
              return e.option;
            }
          });
        });
      }
    }
  });
}


/***************** the end **********************/
}
