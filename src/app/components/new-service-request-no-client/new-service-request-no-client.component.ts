import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';

import { QuestionnaireService } from '../../service/questionnaire.service';
import { Item } from '../models/item.model';
import { Element } from '../models/element.model';


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



//   element: Element = {
//     linkId: '',
//     text: '',
//     answer: [{
//       valueString: '',
//     }]
// };



  itemToSend: {
    resourceType: string;
    extension: [
      {
        url: string;
        valueCode: string;
      },
      {
        url: string;
        valueDateTime: string;
      }
    ],
    status: string;
    subject: {
      reference: string;
      display: string;
    },
    authored: string;
    items: any [];
  };

  formId = '1953';
  qrequest: any;

  items: Item [];

  item: Item = {
    linkId: '',
    text: '',
    answer: ''
  };


  trackByEl(index: number, el: any): string { return el.linkId; }

  constructor(
    public translate: TranslateService,
    private questionnaireService: QuestionnaireService

  ) { }

  ngOnInit() {

    this.questionnaireService.getForm(this.formId).subscribe(
      data => this.handleSuccess(data),
      error => this.handleError(error)
    );
    // console.log(this.itemS.answer[0].valueString);
  }

   onSubmit(serReqForm) {
    // this.checkingEnableWhen()
   }

   onSend() {
    this.itemToSend = {
      resourceType: 'QuestionnaireResponse',
      extension: [
        {
          url: 'https://bcip.smilecdr.com/fhir-request/name',
          valueCode: 'Demetre Vasia'
        },
        {
          url: 'https://bcip.smilecdr.com/fhir-request/birthDate',
          valueDateTime: '2018-09-12T04:00:00.000Z'
        }
      ],
      status: 'completed',
      subject: {
        reference: 'Patient/1881',
        display: 'Demetre Vasia'
      },
      authored: '2018-11-08T15:41:00.581+00:00',
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

  handleSuccess(data) {
    this.qrequest = data.item;
    console.log(this.qrequest);

   this.items = this.qrequest.map(el => ({ ...this.item, linkId: el.linkId, text: el.text}));
    console.log(this.items);

  }


  handleError (error) {
    console.log(error);
  }


  // get date for authored: '2018-11-08T15:41:00.581+00:00'

  // get patient name and id on fhir
  // subject: {
      //   reference: 'Patient/1881',
      //   display: 'Demetre Vasia'
      // },

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
