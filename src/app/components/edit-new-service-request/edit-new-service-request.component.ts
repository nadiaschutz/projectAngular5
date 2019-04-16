import { Component, OnInit } from '@angular/core';

import { QuestionnaireService } from '../../service/questionnaire.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Item } from '../models/item.model';
import { ItemToSend } from '../models/itemToSend.model';


import * as FHIR from '../../interface/FHIR';

@Component({
  selector: 'app-edit-new-service-request',
  templateUrl: './edit-new-service-request.component.html',
  styleUrls: ['./edit-new-service-request.component.scss']
})
export class EditNewServiceRequestComponent implements OnInit {

  formId = null;
  responseId = null;
  documentReferenceId = null;

  clientId = null;
  clientName = null;

  documents = null;
  fileLink = [];
  itemReference;
  documentId;


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
    answer: ''
  };


  trackByEl(index: number, el: any): string { return el.linkId; }


  constructor(
    public translate: TranslateService,
    private questionnaireService: QuestionnaireService,
    private router: Router
  ) { }

  ngOnInit() {
    // get response id
    this.questionnaireService.newResponseIdSubject.subscribe(
      data => this.getQuestionnaireResponseId(data),
      error => this.getQuestionnaireResponseIdError(error)
    );

    // call server with the response id to get data
    this.questionnaireService.getResponse(this.responseId).subscribe(
      data => this.getResponseData(data),
      error => this.getResponseDataError(error)
    );
  }

  retrieveDocumentReferenceObject(data) {
    this.documents = data;
    this.documents.item.forEach(element => {
      if (element.text === 'Document') {
        this.documentReferenceId = element.answer[0].valueReference.reference;
      }
    });
  }






  /************************************************/
  /******************* BUTTONS ********************/
  /************************************************/



  // FIX ON CANCEL
  onCancel() {
    this.questionnaireService.deleteServiceRequest(this.responseId).subscribe(data => {
      console.log(data);
    }, error => {
      console.error(error);
    });

    this.navigateMain();
  }

  navigateMain() {
    if (this.formId === '1952') {
      this.router.navigate(['/dashboard']);
    }
    if (this.formId === '1953') {
      this.router.navigate(['/servreqmain']);
    }
  }


  onNext() {

    if (this.itemReference) {
      this.items.push(this.itemReference);
    }


    this.mapItemToItems();
    console.log(this.items);
    console.log(this.itemToSend);
    // pushing document into items arr


    // sending itemToSend to server
    this.questionnaireService
      .saveRequest(this.itemToSend)
      .subscribe(
        data => this.onSaveSuccess(data),
        error => this.onSaveError(error)
      );
  }


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





  getQuestionnaireResponseId(data) {
    if (data) {
      this.responseId = data;
      console.log('response id:', this.responseId);
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  getQuestionnaireResponseIdError(error) {
    console.log(error);
  }











  getResponseData(data) {
    if (data) {
      this.itemToSend = data;
      console.log('this.itemToSend:', this.itemToSend);

      this.itemToSend.item.forEach(element => {
        if (element.text === 'Document') {
          this.documentId = element.answer[0].valueReference.reference;
          this.documentId = this.documentId.substring(this.documentId.indexOf('/') + 1);
          console.log(this.documentId);
          this.getDocument(this.documentId);
        }
      });

      // mapping items from server to items in angular

      this.formId = data.questionnaire.reference;
      this.formId = this.formId.substring(this.formId.indexOf('/') + 1);
      console.log('this.formId:', this.formId);
      if (this.formId) {
        this.getForm(this.formId);
      }
    }
    if (this.formId !== '1953') {
      this.clientName = this.itemToSend.subject.display;
      console.log('clientName:', this.clientName);
    }
  }






  // console.log('this.items AFTER assigning them to data from server:', this.items);

  getResponseDataError(error) {
    console.log(error);
  }


  getForm(formId) {
    this.questionnaireService
      .getForm(formId)
      .subscribe(
        data => this.getFormData(data),
        error => this.getFormDataError(error)
      );
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
    this.mapItems();
    console.log(this.items);



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



  mapItems() {
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

  }
  /************************************************/







  handleSuccess(data) {
    this.qrequest = data.item;

    console.log(this.qrequest);

    this.items = this.qrequest.map(el => ({ ...this.item, linkId: el.linkId, text: el.text }));

    console.log(this.items);
    this.checkDependentItem(this.items);

    console.log(this.dependents);


  }

  // getResponse() {
  //   // get service response data
  //   this.questionnaireService.newServRespSubject.subscribe(
  //     data => this.handleSuccessResponse(data),
  //     error => this.handleErrorResponse(error)
  //   );
  // }



  handleError(error) {
    console.log(error);
  }









  handleSuccessSubmit(data) {
    console.log(data);
  }
  handleErrorSubmit(error) {
    console.log(error);
  }







  checkDependentItem(itemsServer) {
    itemsServer.forEach(element => {
      if (element.text === 'Dependent Involved') {
        this.dependents = true;
      }
    });
  }




  getDocument(doc) {
    this.questionnaireService.getDocument(doc).subscribe(
      data => this.getDocumentData(data),
      error => this.getDocumentDataError(error)
    );
  }

  getDocumentData(data) {
    console.log(data);
    this.documents = data;
  }
  getDocumentDataError(error) {
    console.log(error);
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

      documentReference.indexed = new Date();
      documentReference.type = documentReferenceCodeableConcept;
      documentReference.content = [content];

      that.questionnaireService.postDataFile(JSON.stringify(documentReference)).subscribe(
        data => {
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
      answer: 'DocumentReference/' + obj
    };
  }

  retrieveDocuments(data) {
    this.documents = data;
  }








}

  // handleSuccessResponse(data) {
  //   console.log(data);
  //   this.itemToSend = data;
  //   console.log(this.itemToSend);
  //   console.log(this.items);

  //   this.items = this.itemToSend.item.map(el => {
  //     if (el.text === 'Document') {
  //       return {
  //         linkId: el.linkId,
  //         text: el.text,
  //         answer: el.answer[0].valueReference.reference
  //       };
  //     }
  //     if (el.text === 'Health Exam Done Externally' || el.text === 'Dependent Involved' ) {
  //       return {
  //         linkId: el.linkId,
  //         text: el.text,
  //         answer: el.answer[0].valueBoolean
  //       };
  //     } else {
  //       return {
  //         linkId: el.linkId,
  //         text: el.text,
  //         answer: el.answer[0].valueString
  //       };
  //     }
  //   });

  //   console.log(this.items);
  // }

  // handleErrorResponse(error) {
  //   console.log(error);
  // }




