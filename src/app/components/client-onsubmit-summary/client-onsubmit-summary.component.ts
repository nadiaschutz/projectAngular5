import { Component, OnInit } from '@angular/core';

import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-client-onsubmit-summary',
  templateUrl: './client-onsubmit-summary.component.html',
  styleUrls: ['./client-onsubmit-summary.component.scss']
})
export class ClientOnsubmitSummaryComponent implements OnInit {


  // linkID = 'a44109ad-e58b-47cd-b348-7556e4d2c117';
  linkID = '';
  selected;
  employee;

  constructor(

    private userService: UserService,
    private patientService: PatientService,
    private router: Router

  ) { }

  ngOnInit() {
    const id = this.userService.returnEmployeeSummaryID();
    this.patientService.getPatientDataByID(id).subscribe(
      data => this.loadEmployee(data),
      error => this.handleError(error)
    );
  }


  loadEmployee(data){
    this.employee = data;
  }

  handleError(error) {
    console.log(error);
  }

  addDependent() {
    this.router.navigateByUrl('/dependentform');
  }

  returnToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

}
