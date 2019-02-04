import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

import { UserService } from '../../service/user.service';

import * as FHIR from '../../interface/FHIR';
import { DynamicFormComponent } from '../dynamic-forms/dynamic-form.component';
import { FieldConfig } from '../dynamic-forms/field-config.interface';

@Component({
  selector: 'app-district-office',
  templateUrl: './district-office.component.html',
  styleUrls: ['./district-office.component.scss']
})
export class DistrictOfficeComponent implements OnInit {





  regionalOffices = [];
  regionalOfficesWithId = {};

  districtOffices = [];
  locationFormGroup: FormGroup;
  showFormElement = false;

  roleInSession = 'emptyClass';

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private userService: UserService,
    private router: Router,
  ) {}



  ngOnInit() {

    this.userService.subscribeRoleData().subscribe(data => {
      this.roleInSession = data;
    });
    this.showFormElement = false;
    this.fetchAllDistrictOffices();
    this.fetchAllRegionalOffices();
  }


  showAddDisctrictOfficeForm() {
    this.router.navigate(['/district-office-add']);
  }

  editNewDistrictOffice(districtOffice: FHIR.Location) {
    this.showFormElement = true;
    this.locationFormGroup.value.name = districtOffice.name;
    this.locationFormGroup.value.addressStreet = districtOffice.address.line[0];
    this.locationFormGroup.value.addressCity = districtOffice.address.city;
    this.locationFormGroup.value.addressProvince = districtOffice.address.state;
  }





  fetchAllRegionalOffices() {
    this.userService.fetchAllRegionalOffices().subscribe(data => {
      data['entry'].forEach(element => {
        // const id = element.resource.id;
        const name = element.resource.name;
        this.regionalOfficesWithId[name] = element.resource.id;
        // console.log(this.regionalOfficesWithId);
        this.regionalOffices.push(name);
      });
    });
  }

  fetchAllDistrictOffices() {
    this.districtOffices = [];
    this.userService.fetchAllDistrictOffices().subscribe(data => {
      if (data['entry']) {
        data['entry'].forEach(element => {
          this.districtOffices.push(element.resource);
        });
      }
    });
  }

  getRegion(organization: string) {
    console.log(organization);
    if (this.regionalOfficesWithId !== {}) {
      const organizationReference = organization['reference'];
      const organizationId = organizationReference.substring(
        organizationReference.indexOf('/') + 1,
        organizationReference.length
        );

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
