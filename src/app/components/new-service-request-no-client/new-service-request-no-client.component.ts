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


// interface Item {
//   answer: string;
//   text: string;
//   linkId: string;
// }

// interface StringElement {
//   linkId: string;
//   text: string;
//   answer: [{
//     valueString: string;
//   }];
// }

// interface Element {
//   linkId: string;
//   text: string;
//   elem: StringElement[];
// }

// interface SendItem {
//   resourceType: string;
//   extension: [
//     {
//       url: string;
//       valueCode: string;
//     },
//     {
//       url: string;
//       valueDateTime: string;
//     }
//   ];
//   status: string;
//   subject: {
//     reference: string;
//     display: string;
//   };
//   authored: string;
//   elements: StringElement[];
// }

@Component({
  selector: 'app-new-service-request-no-client',
  templateUrl: './new-service-request-no-client.component.html',
  styleUrls: ['./new-service-request-no-client.component.css']
})
export class NewServiceRequestNoClientComponent implements OnInit {
  // @ViewChild('serReqForm') form: NgForm;

  formId = '1953';






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
    items: []
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
    this.savingData();
    this.questionnaireService.saveRequest(this.itemToSend).subscribe(
      data => this.handleSuccessOnSave(data),
      error => this.handleErrorOnSave(error)
    );
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
     this.questionnaireService.shareServiceResponseData(this.itemToSend);
     this.questionnaireService.shareServiceFormId(this.formId);
     this.router.navigate(['/summary']);

   }

   savingData() {
     this.getDate();

     // To-Do: check if has dependents => add dependents, add patient/#, subject, exstention

      this.itemToSend = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        authored: this.myDay,
        items: []
      };

      this.itemToSend.items = this.items.map(el => {
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

  }


  handleError (error) {
    console.log(error);
  }


  handleSuccessOnSave(data) {
    console.log(data);
  }


  handleErrorOnSave (error) {
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
