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



// for custom form components to work
import { AfterViewInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Field } from '../dynamic-forms/field.interface';
import { FieldConfig } from '../dynamic-forms/field-config.interface';
import { DynamicFormComponent } from '../dynamic-forms/dynamic-form.component';
import { CustomValidator } from '../dynamic-forms/custom-validator';
import { FileDetector } from 'protractor';


class TextInput {
    static create(event: FieldConfig) {
        return {
                    type: event.type,
                    label: event.label,
                    inputType: event.inputType,
                    name: event.name
        };
    }
}



@Component({
  selector: 'app-new-service-request-no-client',
  templateUrl: './new-service-request-no-client.component.html',
  styleUrls: ['./new-service-request-no-client.component.scss']
})
export class NewServiceRequestNoClientComponent implements OnInit, AfterViewInit  {
  // @ViewChild('serReqForm') form: NgForm;

// var for styling each form field
style = 'col-5';
configuration;
userName;



@ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  config: FieldConfig[] = [];

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
    private patientService: PatientService,
    private oauthService: OAuthService,

  ) {}

  ngOnInit() {
    this.userName = this.oauthService.getIdentityClaims()['name'];

  console.log(this.userName);

  // smile user ID
  console.log(this.oauthService.getIdentityClaims()['sub']);
  this.userService.subscribeUserFHIRID().subscribe(data =>
      console.log(data)
    );

  // getting formId to display form fields
  this.questionnaireService
    .getForm(this.formId)
    .subscribe(
      data => this.getFormData(data),
      error => this.getFormDataError(error)
    );

}



wrap() {
  const x = $('.field-holder-2 form-input');
  for (let i = 0; i < x.length; i ++) {
    console.log(x[i]);
    $(x[i]).wrap("<div class='" + this.style +"'></div>");
  }
}



  addDiv() {
    const sections = $('.dynamic-form .' + this.style);
    for (let i = 0; i < sections.length; i += 2) {
    sections.slice(i, i + 2).wrapAll("<div class='row'></div>");
  }
}







/******************* onCancel() *****************/


  // TO_DO: do post request to delete in-progress service requests
  onCancel() {
      this.router.navigate(['/servreqmain']);
  }




/******************* onNext() *******************/

submit(value: {[name: string]: any}) {
  console.log(value);
  console.log(this.items);
  // this.items = value.map(el => console.log(el));
    
  // });

  this.items.forEach(element => {
    console.log(element.text);

     for (const key in value) {
      if (value.hasOwnProperty(key)) {
        if (key === element.text) {
          element.answer = value[key];
        }
      }
    }

  });

  
    this.savingData();

   //  sending itemToSend to server
    this.questionnaireService
      .saveRequest(this.itemToSend)
      .subscribe(
        data => this.onSaveSuccess(data),
        error => this.onSaveError(error)
      );

    console.log(this.items);

    console.log(this.itemToSend);


  }



  getDocument(data) {
    console.log(data);
    this.itemReference = data;
  }


/***************** savingData() *****************/


  savingData() {
    this.getDate();

    // getting itemReference
    this.questionnaireService.newDocumentSubject.subscribe(
      data => this.getDocument(data),
      error => this.responseIdError(error)
    );
    // pushing document into items arr
    if (this.itemReference) {
      this.items.push(this.itemReference);
    }

    // creating itemToSend
    this.createItemToSend();

    // adding extra items to itemToSend.item[]
    this.mapItemToItems();
  }






/************** getClientData(data) *************/


  getClientData(data) {
    console.log(data);
    this.clientBoD = data.birthDate;
    this.clientGivenName = data.name[0].given[0];
    this.clientFamilyName = data.name[0].family;
  }

  getClientError(error) {
    console.log(error);
  }






/****************** getFormData() ***************/

  getFormData(data) {
    this.qrequest = data.item;
    console.log(data);

    this.configuration = this.qrequest.map(el => {
        // text
        if (el.type === 'text') {
            if (el.text === 'Contact Phone No') {
                const formField = this.textInput(el);
                formField ['placeholder'] = 'type your phone';
                formField ['validation'] = [Validators.required,
                    Validators.pattern('^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$')];
                return formField;

            } else if (el.text === 'Contact Email') {
                const formField = this.textInput(el);
                formField ['placeholder'] = 'type your email';
                formField ['validation'] = [Validators.required, Validators.email];
                return formField;

            } else if (el.text === 'Name of the Requester') {
                const formField = this.textInput(el);
                formField ['placeholder'] = 'type your text';
                formField ['value'] = this.userName;
                formField ['validation'] = [Validators.required , Validators.minLength(4)];
                return formField;

              } else {
                return {
                    type: 'input',
                    label: el.text,
                    inputType: 'text',
                    placeholder: 'type your text',
                    name: el.text,
                    validation: [Validators.required, Validators.minLength(4)]
                };
              }
        }
        if (el.type === 'choice') {
            const options = [];
            el.option.forEach(el1 => {
                options.push(el1.valueCoding.code);
            });
            return {
                type: 'select',
                label: el.text,
                name: el.text,
                options: options,
                placeholder: 'Select an option',
                validation: [Validators.required]
              };
        }
    });
    this.configuration.push(
        {
            type: 'doc',
            class: 'documents'
           },
        {
         type: 'line'
        },
        {
            type: 'button',
            name: 'submit',
            label: 'Next'
        }
        );
        console.log(this.configuration);
        this.config = this.configuration;
        console.log(this.config);
        console.log(this.form);

    // maping part of the data from the server to item
    this.items = this.qrequest.map(el => ({
      ...this.item,
      linkId: el.linkId,
      text: el.text
    }));
    console.log(this.items);


    // console.log(this.responseId);
    // if (this.responseId === null) {
    //   this.getResponseId();
    // }
  }

  getFormDataError(error) {
    console.log(error);
  }


//   const formField = this.textInput(el);
//                 console.log(formField);
                // formField ['placeholder'] = 'type your phone';
                // formField ['validation'] = [
                //     Validators.required , Validators.minLength(4)
                //   ];
                // return formField;


  textInput(data) {
    return TextInput.create({
    type: 'input',
    label: data.text,
    inputType: 'text',
    name: data.text
});
}
/************************************************/
ngAfterViewInit() {
    setTimeout(() => {
    let previousValid = this.form.valid;
    this.form.changes.subscribe(() => {
      if (this.form.valid !== previousValid) {
        previousValid = this.form.valid;
        this.form.setDisabled('submit', !previousValid);
      }
    });

    this.form.setDisabled('submit', true);
    console.log(this.userName);
  });


  // if you want to style 2 form fields per a row do these :
  this.wrap();
  this.addDiv();

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


}