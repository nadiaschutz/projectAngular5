import { Component, OnInit } from '@angular/core';

import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-summary',
  templateUrl: './employee-summary.component.html',
  styleUrls: ['./employee-summary.component.scss']
})
export class EmployeeSummaryComponent implements OnInit {

  id = '';
  // linkID = 'a44109ad-e58b-47cd-b348-7556e4d2c117';
  linkID = '';
  selected;
  employeetype;
  dependentArray = [];
  constructor(

    private userService: UserService,
    private patientService: PatientService,
    private router: Router

  ) { }

  ngOnInit() {


    this.id = this.userService.returnSelectedID();
    this.userService.getEmployeeSummaryID(this.id);
    if (this.id) {
      this.patientService.getPatientDataByID(this.id).subscribe(
        data => this.populatePatientArray(data),
        error => this.handleError(error)
      );

    } else if (!this.id) {
      this.router.navigateByUrl('/dashboard');
    }



    // this.setDependentLinkID();
  }

  populatePatientArray(data) {
    this.linkID = '';
    this.selected = data;
    data.extension.forEach(item => {
      if (item.url === 'https://bcip.smilecdr.com/fhir/dependentlink') {
        this.linkID = item.valueString;
      }
    });
    this.patientService.getPatientByLinkID(this.linkID).subscribe(
      dataPatient => this.populateDependentArray(dataPatient),
      error => this.handleError(error)
    );

  }

  selectedPatient(event: any) {
    console.log(event.target.value);
  }

  addDependent() {
    this.router.navigateByUrl('/dependentform');
  }

  newServiceRequest() {
    this.router.navigate(['/newservicerequest']);
  }
  handleError(error) {
    console.log(error);
  }

  backToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  populateDependentArray(data) {
    this.dependentArray = [];

    for (const value of this.selected.extension) {
      if (value.valueString === 'Dependent') {
          data.entry.forEach(element => {
            const individualEntry = element.resource;
            for (const extension of individualEntry.extension) {
              if (extension.valueString === 'Employee') {
                this.dependentArray.push(individualEntry);
              }
            }
          });
      }
    }
    if (data.entry) {
      data.entry.forEach(element => {
        const individualEntry = element.resource;
        for (const extension of individualEntry.extension) {
          if (extension.valueString === 'Dependent') {
            this.dependentArray.push(individualEntry);
          }
        }
      });
    }

  }

  checkEmployeeType() {
    for (const extension of this.selected.extension) {
      if (extension.url === 'https://bcip.smilecdr.com/fhir/employeetype' && extension.valueString === 'Employee') {
        this.employeetype = true;
        console.log(this.employeetype);
      } else {
        this.employeetype = false;
        console.log(this.employeetype);

      }
    }
  }


}
