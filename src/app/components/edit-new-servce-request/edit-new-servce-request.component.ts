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
import { PatientService } from 'src/app/service/patient.service';

import * as FHIR from '../../interface/FHIR';

@Component({
  selector: 'app-edit-new-servce-request',
  templateUrl: './edit-new-servce-request.component.html',
  styleUrls: ['./edit-new-servce-request.component.scss']
})
export class EditNewServceRequestComponent implements OnInit {


  formId = null;
  responseId = null;
  clientId = null;
  clientName = null;
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
    extension: null,
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
  ) { }

  ngOnInit() {

    // get question. response id
    // get formId
    // get client Id????

    // call server to get question. form items to display
    // display fields
    // call server to get qest.response items to dispaly on the form
    // display answers as disabled
    // check buttons...

    this.questionnaireService
      .getForm(this.formId)
      .subscribe(
        data => this.handleSuccess(data),
        error => this.handleError(error)
      );
    this.clientId = this.userService.returnSelectedID();
    console.log(this.clientId);

    if (this.clientId) {
      this.patientService
        .getPatientDataByID(this.clientId)
        .subscribe(
          data => this.getClientData(data),
          error => this.handleErrorClientError(error)
        );
    } else if (!this.clientId) {
      this.router.navigateByUrl('/dashboard');
    }
  }

}
