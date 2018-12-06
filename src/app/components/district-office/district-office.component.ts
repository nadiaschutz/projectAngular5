import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { UserService } from '../../service/user.service';

import * as FHIR from '../../interface/FHIR';

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

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private userService: UserService
  ) {}

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
  }

  addNewDistrictOffice() {
    this.showFormElement = true;
    const districtOffice = new FHIR.Location;
    districtOffice.resourceType = 'Location';
    districtOffice.name = this.locationFormGroup.get('name').value;

    districtOffice.status = new FHIR.Code('active').code;

    const organizationReference = new FHIR.Reference;
    organizationReference.reference =
      'Organization/' +
      this.regionalOfficesWithId[
        this.locationFormGroup.get('managingOrganization').value
      ];
    districtOffice.managingOrganization = organizationReference;

    const codingForType = new FHIR.Coding;
    codingForType.system = 'http://hl7.org/fhir/organization-type';
    codingForType.code = 'team';
    codingForType.display = 'Regional Office';

    const type = new FHIR.CodeableConcept;
    type.text = 'District Office';
    districtOffice.type = type;
    type.coding = [codingForType];

    const address = new FHIR.Address();
    address.line = [this.locationFormGroup.get('addressStreet').value];
    address.city = this.locationFormGroup.get('addressCity').value;
    address.postalCode = this.locationFormGroup.get('addressPostalCode').value;
    address.state = this.locationFormGroup.get('addressProvince').value;
    districtOffice.address = address;

    const email = new FHIR.ContactPoint();
    email.system = 'email';
    email.value = this.locationFormGroup.get('email').value;

    const phoneNumber = new FHIR.ContactPoint();
    phoneNumber.system = 'phone';
    phoneNumber.value = this.locationFormGroup.get('phoneNumber').value;

    const faxNumber = new FHIR.ContactPoint();
    faxNumber.system = 'fax';
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

  hideAddDisctrictOfficeForm() {
    this.showFormElement = false;
  }

  saveDistrictOffice(locationObj) {
    this.userService.saveDistrictOffice(locationObj).subscribe(data => {
      this.showFormElement = false;
      this.fetchAllDistrictOffices();
    });
  }

  fetchAllRegionalOffices() {
    this.userService.fetchAllRegionalOffices().subscribe(data => {
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
    this.userService.fetchAllDistrictOffices().subscribe(data => {
      if (data['entry']) {
        data['entry'].forEach(element => {
          this.districtOffices.push(element.resource);
        });
      }
    });
  }

  getRegion(organization: string) {
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
