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
import { element } from '@angular/core/src/render3/instructions';



// interface Department {
//   name: string;
//   id: number;
// }

@Component({
  selector: 'app-client-department',
  templateUrl: './client-department.component.html',
  styleUrls: ['./client-department.component.scss']
})
export class ClientDepartmentComponent implements OnInit, AfterViewInit {


  districtOffices = [];



  // departments: Department[];
  // department: Department;
  deptName = [];
  deptId = [];

  deptBranch = [];
  practitionerPieces = {};
  managingOrg;




  // var for styling each form field
  style = 'col-5';


  clientDepartmentFormGroup: FormGroup;
  // departments = [];
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
  ) { }


  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  config: FieldConfig[] = [
    {
      type: 'input',
      label: 'Department Branch',
      // options: this.deptBranch,
      placeholder: 'Type Department Branch',
      name: 'branch',
      required: true,
      validation: [Validators.required],
      value: this.deptBranch[0]
    },
    {
      type: 'select',
      label: 'PSOHP Region',
      name: 'region',
      options: this.regionalOffices,
      value: 'Prairies',
      placeholder: 'Select Region',
      required: true,
      validation: [Validators.required]
    },
    {
      type: 'select',
      label: 'Department Name',
      name: 'department',
      options: this.deptName,
      placeholder: 'Select Department Name',
      required: true,
      validation: [Validators.required]
    },
    // {
    //   type: 'header',
    //   label: 'Don\'t see a Client Department in this list? to add one'
    // },
    {
      type: 'input',
      label: 'Phone Number',
      inputType: 'text',
      placeholder: '000-000-0000',
      name: 'phone',
      required: true,
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
      placeholder: '000-000-0000',
      name: 'fax',
      required: true,
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
      required: true,
      validation: [Validators.required, Validators.email]
    },
    {
      type: 'input',
      label: 'Address',
      inputType: 'text',
      placeholder: 'Enter Address',
      name: 'address',
      required: true,
      validation: [Validators.required]
    },
    {
      type: 'input',
      label: 'City',
      inputType: 'text',
      placeholder: 'Enter City',
      name: 'city',
      required: true,
      validation: [Validators.required]
    },
    {
      type: 'select',
      label: 'Province',
      options: this.regionalOffices,
      placeholder: 'Enter Province',
      name: 'province',
      required: true,
      validation: [Validators.required]
    },
    {
      type: 'input',
      label: 'Postal Code',
      inputType: 'text',
      placeholder: 'Enter Postal Code',
      name: 'postalCode',
      required: true,
      validation: [Validators.required, Validators.maxLength(6), Validators.minLength(6)]
    },
    {
      type: 'checkbox',
      label: 'Chargeback Client',
      name: 'chargebackClient',
      required: true,
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

  // submit(value: {[name: string]: any}) {
  //   console.log(value);
  // }

  wrap() {
    const x = $('.field-holder-2 form-input');
    for (let i = 0; i < x.length; i++) {
      // console.log(x[i]);
      $(x[i]).wrap("<div class='" + this.style + "'></div>");
    }
    console.log('i just wrapped div');
  }

  addDiv() {
    const sections = $('.dynamic-form .' + this.style);
    for (let i = 0; i < sections.length; i += 2) {
      sections.slice(i, i + 2).wrapAll("<div class='row'></div>");
    }
    console.log('i just added div');
  }


  ngOnInit() {
    /**
     * Initializes the list of branches from our system
     */
    this.userService.fetchAllDepartmentBranches().subscribe(
      data => this.populateDeptBranches(data),
      error => this.handleError(error)
    );


    /**
 * Initializes the names of all departments on our system
 */
    this.userService.fetchAllDepartmentNames().subscribe(
      data => this.populateDeptNames(data),
      error => this.handleError(error)
    );

    /**
   * Initializes list for regional offices on our system
   */
    this.userService
      .fetchAllRegionalOffices()
      .subscribe(
        data => this.populateRegionalOffices(data),
        error => this.handleError(error)
      );


    this.fetchAllRegionalOffices();
    this.fetchAllClientDepartments();
  }

  // setClientDepartment() {
  submit(value) {
    const branchLocation = new FHIR.Location();
    branchLocation.resourceType = 'Location';
    branchLocation.name = value.branch;
    branchLocation.status = 'active';

    const extension = [];

    const chargeBackExtension = new FHIR.Extension();
    chargeBackExtension.url = 'https://bcip.smilecdr.com/fhir/chargebackClient';
    chargeBackExtension.valueBoolean = value.chargebackClient;
    extension.push(chargeBackExtension);

    const regionExtension = new FHIR.Extension();
    regionExtension.url = 'https:bcip.smilecdr.com/fhir/psohpRegion';
    regionExtension.valueString = 'Organization/' + value.region;
    extension.push(regionExtension);

    branchLocation.extension = extension;

    const organizationReference = new FHIR.Reference;
    organizationReference.reference = 'Organization/' + value.department;
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
    address.line = [value.address];
    address.city = value.city;
    address.postalCode = value.postalCode;
    address.state = value.province;
    branchLocation.address = address;

    const email = new FHIR.ContactPoint();
    email.system = 'email';
    email.value = value.email;

    const phoneNumber = new FHIR.ContactPoint();
    phoneNumber.system = 'phone';
    phoneNumber.value = value.phone;

    const faxNumber = new FHIR.ContactPoint();
    faxNumber.system = 'fax';
    faxNumber.value = value.fax;

    branchLocation.telecom = [email, phoneNumber, faxNumber];
    // clientDepartment

    const managingOrganization = new FHIR.Reference();

    const a: number = this.deptName.indexOf(value.department);

    this.managingOrg = this.deptId[a];
    managingOrganization.reference = 'Organization/' + this.managingOrg;
    branchLocation.managingOrganization = managingOrganization;
    // console.log (this.managingOrg);
    // console.log(managingOrganization.reference);
    // console.log(branchLocation);
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
      // data['entry'].forEach(element => {
      // const individualEntry = element.resource;
      // this.regionalOffices.push(individualEntry);

      // this.regionalOffices = individualEntry.map(el => (
      //   console.log(el)
      // ));


      // console.log(this.regionalOffices);
      // });

      // console.log(data);
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
    // if you want to style 2 form fields per a row do these :
    this.wrap();
    this.addDiv();
    // the end
  }

  fetchAllClientDepartments() {
    this.userService.fetchAllClientDepartments().subscribe(data => {
      data['entry'].forEach(element => {
        this.clientDepartments.push(element['resource']);
      });
      // console.log(this.clientDepartments);
    });
  }

  populateRegionalOffices(data: any) {
    data.entry.forEach(element => {
      this.regionalOffices.push(element.resource.name);
    });
  }

  /**
 * Used in conjunction with the user service. Gets all Department Branches
 * stored on the server to link to a Practitioner.
 * @param data
 */
  populateDeptBranches(data: any) {
    // console.log(data.entry);
    data.entry.forEach(element => {
      // console.log(element.resource.name);
      this.deptBranch.push(element.resource.name);
    });

    // this.deptBranch = data.entry.map(el =>
    //   el.resource.name
    //  );
  }


  populateDeptNames(data: any) {
    console.log(data);
    data.entry.forEach(element1 => {
      // console.log(element1);
      this.deptName.push(element1.resource.name);
      this.deptId.push(element1.resource.id);
    });
    // this.deptName = data.entry.map(el =>
    //  el['resource']['name']
    // );
    // this.deptId = data.entry.map(el =>
    //   el.resource.id
    //  );

    // console.log(this.deptName);
    // console.log(this.deptId);

  }


  /**
 * Displays the error message from the server in the case a subscription fails.
 * @param error
 */
  handleError(error: any) {
    console.log(error);
  }
}
