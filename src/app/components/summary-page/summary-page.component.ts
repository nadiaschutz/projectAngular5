import { Component, OnInit } from '@angular/core';

import { QuestionnaireService } from '../../service/questionnaire.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Item } from '../models/item.model';
import { ItemToSend } from '../models/itemToSend.model';

@Component({
  selector: 'app-summary-page',
  templateUrl: './summary-page.component.html',
  styleUrls: ['./summary-page.component.scss']
})
export class SummaryPageComponent implements OnInit {

  formId = null;
  responseId = null;
  documentReferenceId = null;

  clientId = null;
  clientName = null;


  documentId;
  documents = null;
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







    // get Document Reference based on the ID from the QuestionnaireResponse

    // this.questionnaireService.getDocumentReferenceByQuery(this.documentReferenceId).subscribe (
    //   data => this.retrieveDocumentReferenceObject(data),
    //   error => this.handleError(error)
    // );

    // get service request form
    // this.questionnaireService.getForm(this.formId).subscribe(
    //   data => this.handleSuccess(data),
    //   error => this.handleError(error)
    // );


  }

  retrieveDocumentReferenceObject(data) {
    this.documents = data;
    this.documents.item.forEach (element => {
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




  onSubmit() {
    this.itemToSend['id'] = this.responseId;
    this.itemToSend.status = 'completed';

    this.questionnaireService.changeRequest(this.responseId, this.itemToSend).subscribe(
      data => this.handleSuccessSubmit(data),
      error => this.handleErrorSubmit(error)
    );
    this.navigateMain();
  }





  onEdit() {
    // send responseId
    this.questionnaireService.shareResponseId(this.responseId);
    this.router.navigate(['/edit-service-request']);
  }

/************************************************/








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

    this.clientName = this.itemToSend.subject.display;
    console.log('clientName:', this.clientName);

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

}
/************************************************/







  handleSuccess(data) {
    this.qrequest = data.item;

    console.log(this.qrequest);

   this.items = this.qrequest.map(el => ({ ...this.item, linkId: el.linkId, text: el.text}));

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



  handleError (error) {
    console.log(error);
  }









  handleSuccessSubmit (data) {
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


}
