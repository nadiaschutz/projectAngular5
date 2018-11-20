import { Component, OnInit } from '@angular/core';

import { QuestionnaireService } from '../../service/questionnaire.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Item } from '../models/item.model';
import { ItemToSend } from '../models/itemToSend.model';

@Component({
  selector: 'app-summary-page',
  templateUrl: './summary-page.component.html',
  styleUrls: ['./summary-page.component.css']
})
export class SummaryPageComponent implements OnInit {

  formId = null;
  responseId = null;


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
    // get form id // 12
    this.questionnaireService.newServFormIdSubject.subscribe(
      data => this.handleSuccessFormId(data),
      error => this.handleErrorFormId(error)
    );

    // get response id // 14
    this.questionnaireService.newResponseIdSubject.subscribe(
      data => this.handleSuccessResponseId(data),
      error => this.handleErrorResponseId(error)
    );


    // get service request with id
      // 16
    this.questionnaireService.getForm(this.formId).subscribe(
      data => this.handleSuccess(data),
      error => this.handleError(error)
    );

    // 21
    console.log(this.responseId);

    // 22
    this.questionnaireService.getResponse(this.responseId).subscribe(
      data => this.handleSuccessResponse(data),
      error => this.handleErrorResponse(error)
    );

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

    if (this.formId = '1952') {
      this.router.navigate(['/newservicerequest']);
    }

    if (this.formId = '1953') {
      this.router.navigate(['/newadvicerequest']);
    }

  }



  // FIX ON CANCEL
  onCancel() {
    this.router.navigate(['/servreqmain']);
  }

  navigateMain() {
    this.router.navigate(['/servreqmain']);
  }



  // 13
  handleSuccessFormId(data) {
    console.log(data);
    this.formId = data;
  }

  handleErrorFormId(error) {
    console.log(error);
  }


  // 15
  handleSuccessResponseId(data) {
    console.log(data);
    this.responseId = data;
  }

  handleErrorResponseId(error) {
    console.log(error);
  }




  handleSuccessResponse(data) {
    // 23
    console.log(data);
    this.itemToSend = data;
    console.log(this.itemToSend);
    console.log(this.items);

    this.items = this.itemToSend.item.map(el => {
      return {
        linkId: el.linkId,
        text: el.text,
        answer: el.answer[0].valueString
      };
    });

    console.log(this.items);
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

  // 17
  handleSuccess(data) {
    this.qrequest = data.item;
    // 18
    console.log(this.qrequest);

   this.items = this.qrequest.map(el => ({ ...this.item, linkId: el.linkId, text: el.text}));
   // 19
    console.log(this.items);
    this.checkDependentItem(this.items);
    // 20
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
        console.log(this.dependents);
      }
    });
  }

}
