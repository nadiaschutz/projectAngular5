import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';
import { TranslateService } from '@ngx-translate/core';

import * as Dependent from '../../interface/patient';
import * as datepicker from 'js-datepicker';
import * as uuid from 'uuid';
import * as Organization from '../../interface/organization';

@Component({
  selector: 'app-district-office',
  templateUrl: './district-office.component.html',
  styleUrls: ['./district-office.component.css']
})
export class DistrictOfficeComponent implements OnInit {

  constructor(

    private fb: FormBuilder,
    private httpClient: HttpClient,
    public translate: TranslateService,
    private oauthService: OAuthService,
    private userService: UserService,
    private patientService: PatientService,
    private router: Router

  ) { }

  ngOnInit() {
  }

}
