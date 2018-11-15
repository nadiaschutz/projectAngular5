import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';

import { QuestionnaireService } from '../../service/questionnaire.service';
import { Item } from '../models/item.model';

@Component({
  selector: 'app-new-service-request',
  templateUrl: './new-service-request.component.html',
  styleUrls: ['./new-service-request.component.css']
})
export class NewServiceRequestComponent implements OnInit {
@ViewChild('advReqForm') form: NgForm;
  // serviceRequestResponce: ServiceRequestResponce = {
  // };

  formId = '1952';
  qrequest: any;

  items: any [];

  item = {
    linkId: '',
    question: '',
    answer: ''
  };



  trackByEl(index: number, el: any): string { return el.linkId; }

  constructor(
    public translate: TranslateService,
    private questionnaireService: QuestionnaireService

  ) { }

  ngOnInit() {

    // this.context = new Context('https://bcip.smilecdr.com/fhir-request');
    // this.temp = new NewQuestionnaire(this.context, '1896');
    // console.log(this.context);
    // console.log(this.temp);

    this.questionnaireService.getForm(this.formId).subscribe(
      data => this.handleSuccess(data),
      error => this.handleError(error)
    );
  }

   onSubmit(serReqForm) {
    // this.checkingEnableWhen();
   }

  handleSuccess(data) {
    this.qrequest = data.item;
    console.log(this.qrequest);

    
    // this.patients.map(x => this.getAge(x.resource.birthDate));

    // // console.log(this.ages);
    // this.ages.map((age, index) => {
    //     this.patients[index].resource.age = age;
    //     // console.log(this.patients[index].resource.age);
    //  });


    // const userTestStatus: { linkId: string, question: string, answer: string }[] = [];
    //  this.qrequest.map((x, index) => (
    // userTestStatus[index].linkId = x,
    // console.log(userTestStatus[index].linkId)
    // ));

    // this.qrequest.forEach((el, index) => {
    //   this.itemX.linkId = el.linkId;
    //   this.itemX.question = el.text;
    //   this.items.push(this.itemX);
    //   console.log(this.itemX);
    // });


    // console.log(this.items);
    // console.log(this.itemX);

    this.items = this.qrequest.map(el => ({ ...this.item, linkId: el.linkId, question: el.text }));

    // this.qrequest.map((el, index) => {
    //   this.itemX.linkId = el.linkId;
    //   this.items.push(this.itemX);
    //   console.log(el, index);
    // });
    console.log(this.items);
    // loop trough this.form.item
  }

  // ell.enableWhen[indexx].question === '8' && ell.enableWhen[indexx].answerString === 'BC'

  handleError (error) {
    console.log(error);
  }

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

            // if (e.enableWhen[0].question === '8' && e.enableWhen[0].answerString === 'BC' ) {
            //   console.log(true);
            //   // show options
            //   console.log(e.option);
            // }
          });
          }
      }
    });
  }



}
