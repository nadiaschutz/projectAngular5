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
import * as FHIR from '../../interface/FHIR';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-district-office',
  templateUrl: './district-office.component.html',
  styleUrls: ['./district-office.component.css']
})
export class DistrictOfficeComponent implements OnInit {

  regionalOffices = [];
  regionalOfficesWithId = {};

  districtOffices = [];
  locationFormGroup: FormGroup;
  showFormElement = false;

  constructor(private formBuilder: FormBuilder, private httpClient: HttpClient) { }

  ngOnInit() {
    this.showFormElement = false;
    this.fetchAllDistrictOffices();
    this.fetchAllRegionalOffices();
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
    const districtOffice = new FHIR.Location;
    districtOffice.resourceType = 'Location';
    districtOffice.name = this.locationFormGroup.get('name').value;

    districtOffice.status = new FHIR.Code('active').code;

    const organizationReference = new FHIR.Reference;
    organizationReference.reference = 'Organization/' +
    this.regionalOfficesWithId[this.locationFormGroup.get('managingOrganization').value];
    districtOffice.managingOrganization = organizationReference;

    const type = new FHIR.CodeableConcept;
    type.text = 'District Office';
    districtOffice.type = type;

    const address = new FHIR.Address;
    address.line = [this.locationFormGroup.get('addressStreet').value];
    address.city = this.locationFormGroup.get('addressCity').value;
    address.postalCode = this.locationFormGroup.get('addressPostalCode').value;
    address.state = this.locationFormGroup.get('addressProvince').value;
    districtOffice.address = address;

    const email = new FHIR.ContactPoint;
    email.system = new FHIR.Code('email');
    email.value = this.locationFormGroup.get('email').value;

    const phoneNumber = new FHIR.ContactPoint;
    phoneNumber.system = new FHIR.Code('phone');
    phoneNumber.value = this.locationFormGroup.get('phoneNumber').value;

    const faxNumber = new FHIR.ContactPoint;
    faxNumber.system = new FHIR.Code('fax');
    faxNumber.value = this.locationFormGroup.get('faxNumber').value;

    districtOffice.telecom = [email, phoneNumber, faxNumber];

    this.saveDistrictOffice(JSON.stringify(districtOffice));
  }

  editNewDistrictOffice(districtOffice: FHIR.Location) {
    this.showFormElement = true;
    this.locationFormGroup.value.name = districtOffice.name;
    this.locationFormGroup.value.addressStreet = districtOffice.address.line[0];
    this.locationFormGroup.value.addressCity = districtOffice.address.city;
    this.locationFormGroup.value.addressProvince = districtOffice.address.state;
  }

  showAddDisctrictOfficeForm() {
    this.showFormElement = true;
  }

  saveDistrictOffice(locationObj) {
    this.httpClient.post(environment.queryURI + '/Location/', locationObj,
    {headers: this.postFHIRHeaders()}).subscribe(data => {
      console.log(data);
      this.showFormElement = false;
      this.fetchAllDistrictOffices();
    });
  }

  fetchAllRegionalOffices() {
    this.httpClient.get(environment.queryURI + '/Organization?type=team').subscribe(data => {
      data['entry'].forEach(element => {
        const id = element.resource.id;
        const name = element.resource.name;
        this.regionalOfficesWithId[name] = id;
        this.regionalOffices.push(name);
      });
    });
  }

  fetchAllDistrictOffices() {
    this.districtOffices = [];
    this.httpClient.get(environment.queryURI + '/Location').subscribe(data => {
      if (data['entry']) {
        console.log(data['entry']);
        data['entry'].forEach(element => {
          this.districtOffices.push(element.resource);
        });
      }
    });
  }

  postFHIRHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      // 'Access-Control-Allow-Origin': '*'
    });
    return headers;
  }

  getRegion(organization: string) {
    if (this.regionalOfficesWithId !== {}) {
      const organizationReference = organization['reference'];
      const organizationId = organizationReference.
      substring(organizationReference.indexOf('/') + 1, organizationReference.length);
      for (const regionName of Object.keys(this.regionalOfficesWithId)) {
        if (this.regionalOfficesWithId[regionName] === organizationId) {
          return regionName;
        }
      }
      return '-';
    }
  }

  getEmailAddress(districtOffice) {
    // console.log(districtOffice);
    // districtOffice.telecom.forEach(element => {
    //   // console.log(element);
    // });
  }

}
