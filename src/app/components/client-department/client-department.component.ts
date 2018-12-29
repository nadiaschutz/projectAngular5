import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as FHIR from '../../interface/FHIR';
import { Router } from '@angular/router';
import { DynamicFormComponent } from '../dynamic-forms/dynamic-form.component';
import { FieldConfig } from '../dynamic-forms/field-config.interface';

@Component({
  selector: 'app-client-department',
  templateUrl: './client-department.component.html',
  styleUrls: ['./client-department.component.scss']
})
export class ClientDepartmentComponent implements OnInit, AfterViewInit {


      // var for styling each form field
      style = 'col-5';


      clientDepartmentFormGroup: FormGroup;
      departments = [];
      regionalOffices = [];
      regionalOfficesWithId = {};
      clientDepartments = [];
      addClientDepartment = false;
      clientDepartmentName = '';
      clientDepartmentCreationSuccess = false;

      constructor(
        private userService: UserService,
        private formBuilder: FormBuilder,
        private router: Router
      ) {}


      @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
      config: FieldConfig[] = [
        {
          type: 'input',
          label: 'Department Branch',
          inputType: 'text',
          placeholder: 'Enter Department Branch',
          name: 'branch',
          validation: [Validators.required]
        },
        {
          type: 'select',
          label: 'PSOHP Region',
          name: 'region',
          options: [],
          placeholder: 'Select Region',
          validation: [Validators.required]
        },
        {
          type: 'select',
          label: 'Department Name',
          name: 'department',
          options: [],
          placeholder: 'Select Department Name',
          validation: [Validators.required]
        },
        {
          type: 'header',
          label: 'Don\'t see a Client Department in this list? to add one'
        },
        {
          type: 'input',
          label: 'Phone Number',
          inputType: 'text',
          placeholder: 'Enter Phone Number',
          name: 'phone',
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
          name: 'fax',
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
          name: 'address',
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
          type: 'input',
          label: 'Province',
          inputType: 'text',
          placeholder: 'Enter Province',
          name: 'province',
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
          type: 'checkbox',
          label: 'Chargeback Client',
          name: 'ChargebackClient',
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

      submit(value: {[name: string]: any}) {
        console.log(value);
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
    this.fetchAllRegionalOffices();
    this.fetchAllClientDepartments();
  }

  setClientDepartment() {
    const branchLocation = new FHIR.Location();

    branchLocation.resourceType = 'Location';
    branchLocation.name = this.clientDepartmentFormGroup.get(
      'departmentBranch'
    ).value;

    branchLocation.status = 'active';

    const extension = [];

    const chargeBackExtension = new FHIR.Extension();
    chargeBackExtension.url = 'https:bcip.smilecdr.com/fhir/chargebackClient';
    chargeBackExtension.valueBoolean = this.clientDepartmentFormGroup.get('chargebackClient').value;
    extension.push(chargeBackExtension);

    const regionExtension = new FHIR.Extension();
    regionExtension.url = 'https:bcip.smilecdr.com/fhir/psohpRegion';
    regionExtension.valueString = 'Organization/' + this.clientDepartmentFormGroup.get('psohpRegion').value;
    extension.push(regionExtension);

    branchLocation.extension = extension;

    const organizationReference = new FHIR.Reference;
    organizationReference.reference = 'Organization/' + this.clientDepartmentFormGroup.get('departmentName').value;
    branchLocation.managingOrganization = organizationReference;

    const typeCoding = new FHIR.Coding();

    typeCoding.system = 'https:bcip.smilecdr.com/fhir/clientDepartment';
    typeCoding.code = 'DEPTBRANCH';
    typeCoding.display = 'Client Department Branch';

    const type = new FHIR.CodeableConcept();
    type.text = 'Client Department Branch';
    type.coding = [typeCoding];
    branchLocation.type = type;

    const address = new FHIR.Address();
    address.line = [this.clientDepartmentFormGroup.get('addressStreet').value];
    address.city = this.clientDepartmentFormGroup.get('addressCity').value;
    address.postalCode = this.clientDepartmentFormGroup.get(
      'addressPostalCode'
    ).value;
    address.state = this.clientDepartmentFormGroup.get('addressProvince').value;
    branchLocation.address = address;

    const email = new FHIR.ContactPoint();
    email.system = 'email';
    email.value = this.clientDepartmentFormGroup.get('email').value;

    const phoneNumber = new FHIR.ContactPoint();
    phoneNumber.system = 'phone';
    phoneNumber.value = this.clientDepartmentFormGroup.get('phoneNumber').value;

    const faxNumber = new FHIR.ContactPoint();
    faxNumber.system = 'fax';
    faxNumber.value = this.clientDepartmentFormGroup.get('faxNumber').value;

    branchLocation.telecom = [email, phoneNumber, faxNumber];
    // clientDepartment

    const managingOrganization = new FHIR.Reference();

    managingOrganization.reference = 'Organization/' + this.clientDepartmentFormGroup.get('psohpRegion').value;

    console.log(branchLocation);
    console.log(JSON.stringify(branchLocation));

    this.userService
      .saveClientDepartmentBranch(JSON.stringify(branchLocation))
      .subscribe(res => console.log(res));
  }

  // To save location data, then return the location to reference
  createDepartmentBranch(data) {
    this.userService.saveClientDepartment(data);
  }

  fetchAllRegionalOffices() {
    this.userService.fetchAllRegionalOffices().subscribe(data => {
      data['entry'].forEach(element => {
        const individualEntry = element.resource;
        this.regionalOffices.push(individualEntry);
      });
    });
  }

  addNewClientDepartment() {
    this.addClientDepartment = true;
    this.clientDepartmentName = '';
    this.clientDepartmentCreationSuccess = false;
  }

  createClientDepartment(data) {
    if (this.clientDepartmentName !== '') {
      console.log(this.clientDepartmentName);
      const clientDepartment = new FHIR.Organization();
      clientDepartment.resourceType = 'Organization';

      clientDepartment.active = true;
      clientDepartment.name = this.clientDepartmentName;
      const typeCoding = new FHIR.Coding();

      typeCoding.system = 'https:bcip.smilecdr.com/fhir/clientDepartment';
      typeCoding.code = 'CLIENTDEPT';
      typeCoding.display = 'Client Department';

      const type = new FHIR.CodeableConcept();
      type.text = 'Client Department';
      type.coding = [typeCoding];
      clientDepartment.type = [type];
      console.log(clientDepartment);
      this.saveClientDepartment(JSON.stringify(clientDepartment));

    }
  }

  saveClientDepartment(clientDepartmentData) {
    this.userService.saveClientDepartment(clientDepartmentData).subscribe(data => {
      console.log(data);
      this.clientDepartmentCreationSuccess = true;
    });
  }

  backToCreateBranch() {
    this.addClientDepartment = false;
  }

  fetchAllClientDepartments() {
    this.userService.fetchAllClientDepartments().subscribe(data => {
      data['entry'].forEach(element => {
        this.clientDepartments.push(element['resource']);
      });
      console.log(this.clientDepartments);
    });
  }
}
