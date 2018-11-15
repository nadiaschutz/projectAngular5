import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';

import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';

import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as Employee from '../../interface/patient';
import * as datepicker from 'js-datepicker';
import * as uuid from 'uuid';

@Component({
  selector: 'app-employee-summary',
  templateUrl: './employee-summary.component.html',
  styleUrls: ['./employee-summary.component.css']
})
export class EmployeeSummaryComponent implements OnInit {


  patientlist;
  tempobj;
  parsedObject;
  parsedObjecttwo;

  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient,
    public translate: TranslateService,
    private oauthService: OAuthService,
    private userService: UserService,
    private patientService: PatientService,
    private router: Router
  ) { }

  test: FormGroup;

  ngOnInit() {

    const sessionToUpload = this.userService.getObjectBase();


    const dependents = JSON.parse(localStorage.getItem('dependents'));
    const retrievedObject = localStorage.getItem('employee');

    this.parsedObject = JSON.parse(retrievedObject);

    console.log(this.parsedObject);

    const bundle = localStorage.getItem('bundle');
    this.parsedObjecttwo = JSON.parse(bundle);
    console.log(this.parsedObjecttwo);

    this.test = new FormGroup({
      type: new FormControl('')
    });



    this.patientService.getAllPatientData().subscribe(
      data => this.setPatientList(data),
      error => this.handleError(error)
    );

    if (this.patientlist) {
      for (const i of this.patientlist) {
        console.log('the id: ', i.resource.id);
      }
    }

  }

  selectedPatient( event: any) {
    console.log(event.target.value);
  }

  setPatientList(data) {
    this.patientlist = data.entry;
  }

  handleError(error) {
    console.log(error);
  }

}
