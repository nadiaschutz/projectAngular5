import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-client-department',
  templateUrl: './client-department.component.html',
  styleUrls: ['./client-department.component.scss']
})
export class ClientDepartmentComponent implements OnInit {
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

  ngOnInit() {
    this.fetchAllRegionalOffices();
    this.fetchAllClientDepartments();
    this.clientDepartmentFormGroup = this.formBuilder.group({
      psohpRegion: new FormControl('', [Validators.required]),
      departmentName: new FormControl('', [Validators.required]),
      departmentBranch: new FormControl('', [Validators.required]),
      contactName: new FormControl('', [Validators.required]),
      chargebackClient: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [Validators.required]),
      faxNumber: new FormControl('', [Validators.required]),
      addressStreet: new FormControl('', [Validators.required]),
      addressCity: new FormControl('', [Validators.required]),
      addressProvince: new FormControl('', [Validators.required]),
      addressPostalCode: new FormControl('', [Validators.required])
    });
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
