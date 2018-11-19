import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-district-office',
  templateUrl: './district-office.component.html',
  styleUrls: ['./district-office.component.css']
})
export class DistrictOfficeComponent implements OnInit {

  districtOffice = '';
  regionalOffice = '';
  email = '';
  phoneNumber = '';
  faxNumber = '';
  address = '';
  city = '';
  province = '';
  postalCode = '';

  constructor() { }

  ngOnInit() {
  }

  addNewDistrictOffice() {}

}
