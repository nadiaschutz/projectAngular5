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

  regionalOffice = ['Atlantic', 'Quebec', 'NCR', 'Ontario', 'Prairies', 'Pacific'];

  districtOffices = [];
  locationFormGroup: FormGroup;
  showFormElement = false;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.showFormElement = false;
    this.fetchAllDistrictOffices();
    this.locationFormGroup = this.formBuilder.group({
      resourceType: 'Location',
      type: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      faxNumber: ['', [Validators.required]],
      addressStreet: ['', [Validators.required]],
      addressCity: ['', [Validators.required]],
      addressProvince: ['', [Validators.required]],
      addressPostalCode: ['', [Validators.required]],
      id: ['', [Validators.required]],
      managingOrganization: ['', [Validators.required]]
    });
    console.log(this.locationFormGroup);
  }

  addNewDistrictOffice() {
    this.showFormElement = true;
    console.log(this.locationFormGroup);
  }

  editNewDistrictOffice() {
    this.showFormElement = true;
  }

  fetchAllDistrictOffices() {
    // Http call to fetch all offices
  }

}
