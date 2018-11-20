import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
