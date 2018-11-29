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
    // get form id
    this.questionnaireService.newServFormIdSubject.subscribe(
      data => this.getFormId(data),
      error => this.handleErrorFormId(error)
    );

    // get response id
    this.questionnaireService.newResponseIdSubject.subscribe(
      data => this.getQuestionnaireResponseId(data),
      error => this.handleErrorResponseId(error)
    );


    // get Document Reference based on the ID from the QuestionnaireResponse

    this.questionnaireService.getDocumentReferenceByQuery(this.documentReferenceId).subscribe (
      data => this.retrieveDocumentReferenceObject(data),
      error => this.handleError(error)
    );

    // get service request form
    this.questionnaireService.getForm(this.formId).subscribe(
      data => this.handleSuccess(data),
      error => this.handleError(error)
    );


    // get the response data to show on screen
    this.questionnaireService.getResponse(this.responseId).subscribe(
      data => this.getResponseData(data),
      error => this.handleErrorResponse(error)
    );

  }

  retrieveDocumentReferenceObject(data) {
    this.documents = data;
    this.documents.item.forEach (element => {
      if (element.text === 'Document') {
        this.documentReferenceId = element.answer[0].valueReference.reference;
      }
    });

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

    // navigate the previous service request page
    console.log(this.formId);

    if (this.formId = '1952') {
      this.router.navigate(['/newservicerequest']);
    }

    // if (this.formId = '1953') {
    //   this.router.navigate(['/newadvicerequest']);
    // }

  }



  // FIX ON CANCEL
  onCancel() {
    this.navigateMain();
  }

  navigateMain() {
    this.router.navigate(['/servreqmain']);
  }



  getFormId(data) {
    console.log(data);
    this.formId = data;
  }

  handleErrorFormId(error) {
    console.log(error);
  }



  getQuestionnaireResponseId(data) {
    console.log(data);
    this.responseId = data;
  }

  handleErrorResponseId(error) {
    console.log(error);
  }




  getResponseData(data) {
    this.itemToSend = data;
    console.log('this.itemToSend:', this.itemToSend);
    console.log('this.items BEFORE assigning them to data from server:', this.items);


    for (let i = 0; i < 500; i++) {
      console.log(i);
    }

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

    console.log('this.items AFTER assigning them to data from server:', this.items);
  }

  handleErrorResponse(error) {
    console.log(error);
  }

  // getFormSum() {
  //   console.log('getting the form ID');
  //   this.questionnaireService.getForm(this.formId).subscribe(
  //     data => this.handleSuccess(data),
  //     error => this.handleError(error)
  //   );
  // }


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

}
