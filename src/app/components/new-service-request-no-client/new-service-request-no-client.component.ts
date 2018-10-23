import { Component, OnInit, AfterContentInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { tap, first, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';

import { PatientService } from '../../service/patient.service';
import { TranslateService } from '@ngx-translate/core';

import { QuestionnaireService, Context, NewQuestionnaire } from '../../service/questionnaire.service';
import { Questresp } from '../models/questresp.model';

@Component({
  selector: 'app-new-service-request-no-client',
  templateUrl: './new-service-request-no-client.component.html',
  styleUrls: ['./new-service-request-no-client.component.css']
})
export class NewServiceRequestNoClientComponent implements OnInit {
  // model: Questresp{
  //   firstname: 'nadia';
  // };

  context: Context;
  temp;
  x;

  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient,
    public translate: TranslateService,
    private oauthService: OAuthService,
    private userService: UserService,
    private patientService: PatientService,
    private questionnaireService: QuestionnaireService,

  ) { }

  ngOnInit() {

    this.context = new Context('https://bcip.smilecdr.com/fhir-request');
    this.temp = new NewQuestionnaire(this.context, '1896');
    console.log(this.context);
    console.log(this.temp);
  }

}
