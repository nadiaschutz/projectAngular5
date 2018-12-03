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

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.fetchAllRegionalOffices();
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
    const clientDepartment = new FHIR.Location();
    const branchLocation = new FHIR.Location();
    const chargeBackExtension = new FHIR.Extension();

    clientDepartment.resourceType = 'Location';
    clientDepartment.name = this.clientDepartmentFormGroup.get(
      'contactName'
    ).value;

    clientDepartment.status = 'active';

    const organizationReference = new FHIR.Reference();
    // organizationReference.reference =
    //   'Organization/' +
    //   this.regionalOfficesWithId[
    //     this.clientDepartmentFormGroup.get('managingOrganization').value
    //   ];
    clientDepartment.managingOrganization = organizationReference;

    const typeCoding = new FHIR.Coding();

    typeCoding.system = 'https:bcip.smilecdr.com/fhir/clientDepartment';
    typeCoding.code = 'CLIENTDEPT';
    typeCoding.display = 'Client Department';

    const type = new FHIR.CodeableConcept();
    type.text = 'Client Department';
    clientDepartment.type = type;
    clientDepartment.type.coding = [typeCoding];

    const address = new FHIR.Address();
    address.line = [this.clientDepartmentFormGroup.get('addressStreet').value];
    address.city = this.clientDepartmentFormGroup.get('addressCity').value;
    address.postalCode = this.clientDepartmentFormGroup.get(
      'addressPostalCode'
    ).value;
    address.state = this.clientDepartmentFormGroup.get('addressProvince').value;
    clientDepartment.address = address;

    const email = new FHIR.ContactPoint();
    email.system = 'email';
    email.value = this.clientDepartmentFormGroup.get('email').value;

    const phoneNumber = new FHIR.ContactPoint();
    phoneNumber.system = 'phone';
    phoneNumber.value = this.clientDepartmentFormGroup.get('phoneNumber').value;

    const faxNumber = new FHIR.ContactPoint();
    faxNumber.system = 'fax';
    faxNumber.value = this.clientDepartmentFormGroup.get('faxNumber').value;

    clientDepartment.telecom = [email, phoneNumber, faxNumber];
    // clientDepartment

    branchLocation.partOf = this.clientDepartmentFormGroup.get(
      'departmentBranch'
    ).value;

    const managingOrganization = new FHIR.Reference();

    managingOrganization.reference = 'Organization/' + this.clientDepartmentFormGroup.get('psohpRegion').value;


    clientDepartment.partOf = managingOrganization;
    console.log(clientDepartment);
    // console.log(JSON.stringify(clientDepartment));

    // this.userService
    //   .saveClientDepartment(JSON.stringify(clientDepartment))
    //   .subscribe(res => console.log(res));

    // this.userService.saveClientDepartment(JSON.stringify(branchLocation));
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
}
