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
import { Item } from 'src/app/interface/FHIR';

@Component({
  selector: 'app-employee-summary',
  templateUrl: './employee-summary.component.html',
  styleUrls: ['./employee-summary.component.css']
})
export class EmployeeSummaryComponent implements OnInit {

  id = '';
  // linkID = 'a44109ad-e58b-47cd-b348-7556e4d2c117';
  linkID = '';
  selected;
  employeetype;
  dependentArray = [];
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


    this.id = this.userService.returnSelectedID();
    console.log(this.id);

    if (this.id) {
      this.patientService.getPatientDataByID(this.id).subscribe(
        data => this.populatePatientArray(data),
        error => this.handleError(error)
      );

    } else if (!this.id) {
      this.router.navigateByUrl('/dashboard');
    }



    // this.setDependentLinkID();
  }

  populatePatientArray(data) {
    this.linkID = '';
    this.selected = data;
    data.extension.forEach(item => {
      if (item.url === 'https://bcip.smilecdr.com/fhir/dependentlink') {
        this.linkID = item.valueString;
        console.log('the id is:' , this.linkID);
      }
    });
    this.patientService.getPatientByLinkID(this.linkID).subscribe(
      dataPatient => this.populateDependentArray(dataPatient),
      error => this.handleError(error)
    );

  }

  selectedPatient(event: any) {
    console.log(event.target.value);
  }

  newServiceRequest() {
    this.router.navigate(['/newservicerequest']);
  }
  handleError(error) {
    console.log(error);
  }

  backToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  populateDependentArray(data) {
    this.dependentArray = [];
    if (data.entry) {
      data.entry.forEach(element => {
        const individualEntry = element.resource;
        this.dependentArray.push(individualEntry);
        console.log(this.dependentArray);
      });
    }
  }

  checkEmployeeType() {
    for (const extension of this.selected.extension) {
      if (extension.url === 'https://bcip.smilecdr.com/fhir/employeetype' && extension.valueString === 'Employee') {
        this.employeetype = true;
        console.log(this.employeetype);
      } else {
        this.employeetype = false;
        console.log(this.employeetype);

      }
    }
  }


}
