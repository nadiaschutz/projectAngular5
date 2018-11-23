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



@Component({
  selector: 'app-new-service-request-no-client',
  templateUrl: './new-service-request-no-client.component.html',
  styleUrls: ['./new-service-request-no-client.component.scss']
})
export class NewServiceRequestNoClientComponent implements OnInit {
  // @ViewChild('serReqForm') form: NgForm;

  formId = '1953';
  responseId = null;



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
  dependentNumber = null;
  qrequest: any;

  submitingFormData: {
    formId: any;
    itemToSend: any;
  };

  itemToSend: ItemToSend = {
    resourceType: 'string',
    extension: null,
    status: null,
    subject: null,
    authored: null,
    item: []
  };



  items: Item [];

  item: Item = {
    linkId: '',
    text: '',
    answer: ''
  };


  trackByEl(index: number, el: any): string { return el.linkId; }




  constructor(
    public translate: TranslateService,
    private questionnaireService: QuestionnaireService,
    private router: Router
  ) { }

  ngOnInit() {

    this.questionnaireService.getForm(this.formId).subscribe(
      data => this.handleSuccess(data),
      error => this.handleError(error)
    );
  }




  onCancel() {
    this.router.navigate(['/servreqmain']);
  }


   onSave() {
    // this.savingData();
    // this.questionnaireService.saveRequest(this.itemToSend).subscribe(
    //   data => this.handleSuccessOnSave(data),
    //   error => this.handleErrorOnSave(error)
    // );
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

    const preview = document.querySelector('uploader');
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
   onNext() {
    this.savingData();

    this.questionnaireService.saveRequest(this.itemToSend).subscribe(
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

   savingData() {

     this.getDate();

     // To-Do: check if has dependents => add dependents, add patient/#, subject, exstention

     if (this.dependents === true) {

       this.items.forEach(element => {
         console.log(element.text);

         if (element.text === 'Dependent Involved') {
           this.dependentNumber = '0';
           return element.answer = this.dependentNumber;
         }
       });
     }

     this.items.push(this.itemReference);

      this.itemToSend = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        authored: this.myDay,
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
        return {
          linkId: el.linkId,
          text: el.text,
          answer: [{
            valueString: el.answer
          }]
        };
      });

      console.log(this.itemToSend);
  }

   addDependent() {

   }

  handleSuccess(data) {
    this.qrequest = data.item;

    console.log(this.qrequest);

   this.items = this.qrequest.map(el => ({ ...this.item, linkId: el.linkId, text: el.text}));

    console.log(this.items);
    this.checkDependentItem(this.items);

    console.log(this.dependents);

    console.log(this.responseId);
   if (this.responseId === null) {
    this.getResponseId();
   }


  }


  handleError (error) {
    console.log(error);
  }


  handleSuccessOnSave(data) {
    console.log(data);
    this.responseId = data.id;
    console.log(this.responseId);
    this.questionnaireService.shareResponseId(this.responseId);
    this.questionnaireService.shareServiceFormId(this.formId);

    this.router.navigate(['/summary']);
  }


  handleErrorOnSave (error) {
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
    this.questionnaireService.getResponse(this.responseId).subscribe(
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
    return this.myDay = this.yyyy + '-' + this.mm + '-' + this.dd + 'T' + this.hr + ':' + this.min + ':' + this.sec + '.581+00:00';
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

  checkingEnableWhen() {
    this.qrequest.forEach((el, index) => {
      // check if type = "choice"
       if (el.type === 'choice') {
         // console.log(el.item);
        // console.log(el);
        // check enableWhen data
         if (el.item ) {
          // forEach loop
          el.item.forEach((e, i) => {
             // console.log(i);
             // console.log(e);
             // console.log(e.enableWhen[0]);
            // check if enblewhen.question number === linkId number and enableWhen.answerString === model.data

            // tslint:disable-next-line:no-shadowed-variable
            this.items.forEach((element, index) => {
              if (e.enableWhen[i].question === element[index].linkId && e.enableWhen[i].answerString === element[index].answer ) {
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



}
