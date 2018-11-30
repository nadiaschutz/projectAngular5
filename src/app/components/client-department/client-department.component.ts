import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as FHIR from '../../interface/FHIR';


@Component({
  selector: 'app-client-department',
  templateUrl: './client-department.component.html',
  styleUrls: ['./client-department.component.scss']
})
export class ClientDepartmentComponent implements OnInit {


  clientDepartmentFormGroup: FormGroup;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,

  ) { }

  ngOnInit() {

    const departments = [];
    this.clientDepartmentFormGroup = this.formBuilder.group({
      departmentName: new FormControl('', Validators.required),
      departmentBranch: new FormControl('', Validators.required),
      contactName: new FormControl('', Validators.required),
      chargebackClient: new FormControl('', Validators.required),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
      ]),
      phoneNumber: new FormControl('', Validators.required),
      faxNumber: new FormControl('', Validators.required),
      addressStreet: new FormControl('', Validators.required),
      addressCity: new FormControl('', Validators.required),
      addressProvince: new FormControl('', Validators.required),
      addressPostalCode: new FormControl('', Validators.required),
    });


  }

  setClientDepartment() {
    const clientDepartment = new FHIR.Location;
    const branchLocation = new FHIR.Location;


    clientDepartment.resourceType = 'Location';
    clientDepartment.name = this.clientDepartmentFormGroup.get('contactName').value;

    clientDepartment.status = new FHIR.Code('active').code;

    const organizationReference = new FHIR.Reference();
    // organizationReference.reference =
    //   'Organization/' +
    //   this.regionalOfficesWithId[
    //     this.clientDepartmentFormGroup.get('managingOrganization').value
    //   ];
    clientDepartment.managingOrganization = organizationReference;

    const type = new FHIR.CodeableConcept();
    type.text = 'Client Department';
    clientDepartment.type = type;

    const address = new FHIR.Address();
    address.line = [this.clientDepartmentFormGroup.get('addressStreet').value];
    address.city = this.clientDepartmentFormGroup.get('addressCity').value;
    address.postalCode = this.clientDepartmentFormGroup.get('addressPostalCode').value;
    address.state = this.clientDepartmentFormGroup.get('addressProvince').value;
    clientDepartment.address = address;

    const email = new FHIR.ContactPoint();
    email.system = new FHIR.Code('email');
    email.value = this.clientDepartmentFormGroup.get('email').value;

    const phoneNumber = new FHIR.ContactPoint();
    phoneNumber.system = new FHIR.Code('phone');
    phoneNumber.value = this.clientDepartmentFormGroup.get('phoneNumber').value;

    const faxNumber = new FHIR.ContactPoint();
    faxNumber.system = new FHIR.Code('fax');
    faxNumber.value = this.clientDepartmentFormGroup.get('faxNumber').value;

    clientDepartment.telecom = [email, phoneNumber, faxNumber];

    branchLocation.name = this.clientDepartmentFormGroup.get('departmentBranch').value;

    console.log(clientDepartment);

  }

}
