import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { UserService } from '../../service/user.service';

import * as FHIR from '../../interface/FHIR';
import { DynamicFormComponent } from '../dynamic-forms/dynamic-form.component';
import { FieldConfig } from '../dynamic-forms/field-config.interface';

@Component({
  selector: 'app-district-office-add',
  templateUrl: './district-office-add.component.html',
  styleUrls: ['./district-office-add.component.scss']
})
export class DistrictOfficeAddComponent implements AfterViewInit, OnInit {

// var for styling each form field
style = 'col-5';



regionalOffices = [];
regionalOfficesWithId = {};

districtOffices = [];
locationFormGroup: FormGroup;



constructor(
  private formBuilder: FormBuilder,
  private httpClient: HttpClient,
  private userService: UserService,
  private router: Router
) {}

@ViewChild(DynamicFormComponent) form: DynamicFormComponent;
    config: FieldConfig[] = [
      {
        type: 'input',
        label: 'PSOHP Office',
        inputType: 'text',
        placeholder: 'Enter District Office',
        name: 'officeName',
        validation: [Validators.required]
      },
      {
        type: 'select',
        label: 'Region',
        name: 'region',
        options: this.regionalOffices,
        placeholder: 'Select Region',
        validation: [Validators.required]
      },
      {
        type: 'input',
        label: 'Phone Number',
        inputType: 'text',
        placeholder: 'Enter Phone Number',
        name: 'phoneNumber',
        validation: [
          Validators.required,
          // CustomValidator.numberValidator,
          Validators.pattern('^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$')
        ]
      },
      {
        type: 'input',
        label: 'Fax Number',
        inputType: 'text',
        placeholder: 'Enter Fax Number',
        name: 'faxNumber',
        validation: [
          Validators.required,
          // CustomValidator.numberValidator,
          Validators.pattern('^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$')
        ]
      },
      {
        type: 'input',
        label: 'Email Address',
        inputType: 'email',
        placeholder: 'Enter Email',
        name: 'email',
        validation: [Validators.required, Validators.email]
      },
      {
        type: 'input',
        label: 'Address',
        inputType: 'text',
        placeholder: 'Enter Address',
        name: 'addressStreet',
        validation: [Validators.required]
      },
      {
        type: 'input',
        label: 'City',
        inputType: 'text',
        placeholder: 'Enter City',
        name: 'city',
        validation: [Validators.required]
      },
      {
        type: 'select',
        label: 'Province',
        inputType: 'text',
        name: 'province',
        placeholder: 'Enter Province',
        options: this.regionalOffices,
        validation: [Validators.required]
      },
      {
        type: 'input',
        label: 'Postal Code',
        inputType: 'text',
        placeholder: 'Enter Postal Code',
        name: 'postalCode',
        validation: [Validators.required]
      },
      {
        type: 'line'
      },
      {
        type: 'button',
        name: 'submit',
        label: 'Save'
      }
    ];

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

    });

    // if you want to style 2 form fields per a row do these :
    this.wrap();
    this.addDiv();
    // the end

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

  ngOnInit() {
    this.fetchAllDistrictOffices();
    this.fetchAllRegionalOffices();
  }
  goBackToList() {
    this.router.navigate(['/district-office']);
  }

  submit(value) {
    console.log(value);
    console.log(value.officeName);

    const districtOffice = new FHIR.Location;
    districtOffice.resourceType = 'Location';
    districtOffice.name = value.officeName;

    districtOffice.status = new FHIR.Code('active').code;

    const organizationReference = new FHIR.Reference;
    organizationReference.reference =
      'Organization/' +
      this.regionalOfficesWithId[
        value.region
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
    address.line = value.addressStreet;
    address.city = value.city;
    address.postalCode = value.postalCode;
    address.state = value.province;
    districtOffice.address = address;

    const email = new FHIR.ContactPoint();
    email.system = 'email';
    email.value = value.email;

    const phoneNumber = new FHIR.ContactPoint();
    phoneNumber.system = 'phone';
    phoneNumber.value = value.phoneNumber;

    const faxNumber = new FHIR.ContactPoint();
    faxNumber.system = 'fax';
    faxNumber.value = value.faxNumber;

    districtOffice.telecom = [email, phoneNumber, faxNumber];

    console.log(districtOffice);

    this.saveDistrictOffice(JSON.stringify(districtOffice));
  }


  backToList() {
    this.router.navigate(['/district-office']);
  }


  saveDistrictOffice(locationObj) {
    this.userService.saveDistrictOffice(locationObj).subscribe(data => {
      this.fetchAllDistrictOffices();
    });
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


}
