import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ChangeDetectorRef, AfterContentInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';
import { environment } from '../../../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { Validators } from "@angular/forms";
import { FieldConfig } from "../dynamic-forms/field-config.interface";
import { DynamicFormComponent } from "../dynamic-forms/dynamic-form.component";



export interface AccountElement {
  type: string;
  id: string;
  name: string;
  number: string;
  dateCreated: string;
  dateModified: string;
  // TODO change date variables to date type

}

export interface EmployeeElement {
  name: string;
  id: string;
  dependent: boolean;
  department: string;
  dateCreated: string;
  dateModified: string;
  // TODO change date variables to date type

}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

  export class DashboardComponent {


  

  previousValid;


  

  givenName = {
    prefix: 'given=',
    data: null
  };

  familyName = {
    prefix: 'family=',
    data: null
  };

  clientId = {
    prefix: '/',
    data: null
  };

  dateOfBirth = {
    prefix: 'birthdate=',
    data: null
  };

  private arrOfVar = [this.givenName, this.familyName, this.dateOfBirth];
  listOfDepartments = [];
  clientDepartment = null;
  employeeTypeArray = ['Employee', 'Dependent'];
  employeeType = null;

  // patientSubscription: subscription;
  displayedColumns: string[] = ['type', 'id', 'name', 'number', 'dateCreated', 'dateModified'];

  displayedColumnsTwo: string[] = ['name', 'id', 'dependent', 'department', 'dateCreated', 'dateModified'];

  qrequest = [];

  constructor(
    private oauthService: OAuthService,
    private userService: UserService,
    private httpClient: HttpClient,
    private patientService: PatientService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }


  

  ngOnInit() {
      this.patientService.getPatientData('').subscribe(
          data => this.handleSuccess(data),
          error => this.handleError(error)
        );
        this.getDepartmentsList();
      }
 
  handleSuccess(data) {
    // console.log(data);
    this.qrequest = [];
    if (data.total !== 0) {
      if (data.entry) {
        data.entry.forEach(item => {
          const individualEntry = item.resource;
          if (this.employeeType || this.clientDepartment) {
            this.checkForEmployeeTypeAndClientDepartment(individualEntry);
          } else {
            this.qrequest.push(individualEntry);
          }
        });
      } else {
        if (this.employeeType || this.clientDepartment) {
          this.checkForEmployeeTypeAndClientDepartment(data);
        } else {
          this.qrequest.push(data);
        }
      }
    }
    // this.resetSearchParams();
  }

  checkForEmployeeTypeAndClientDepartment(individualEntry) {
    individualEntry.extension.forEach(individualExtension => {
      if (this.employeeType && individualExtension.url === 'https://bcip.smilecdr.com/fhir/employeetype') {
        if (individualExtension.valueString === this.employeeType) {
          this.qrequest.push(individualEntry);
        }
      } else if (this.clientDepartment && individualExtension.url === 'https://bcip.smilecdr.com/fhir/workplace') {
        if (individualExtension.valueString === this.clientDepartment) {
          this.qrequest.push(individualEntry);
        }
      }
    });
  }

  handleError(error) {
    console.log(error);
  }

  routeToSummary(data) {
   this.userService.getSelectedID(data);
   this.router.navigateByUrl('/employeesummary');
  }
  newPSOHPButton() {
    this.router.navigate(['/psohpform']);
  }

  newAccountButton() {
    this.router.navigate(['/newaccount']);
  }

  newEmployeeButton() {

    this.router.navigateByUrl('/employeeform');
  }

  checkRegionalOfficeButtion() {
    this.router.navigate(['/region-summary']);
  }
  employeeSearch() {
    let searchParams = '';
    this.arrOfVar.forEach((element, index) => {
      if ( element.data !== null) {
        if (searchParams.length === 0) {
          searchParams = '?' + element.prefix + element.data;
        } else {
          searchParams += '&' + element.prefix + element.data;
        }
      }
    });
    if (this.clientId.data) {
      searchParams = this.clientId.prefix + this.clientId.data + searchParams;
    }
    console.log(searchParams);

    this.patientService.getPatientData(searchParams).subscribe(
      data => this.handleSuccess(data),
      error => this.handleError(error)
    );
  }
  resetSearchParams() {
    this.clientDepartment = '';
    this.employeeType = '';
    this.givenName.data = '';
    this.familyName.data = '';
    this.clientId.data = '';
    this.dateOfBirth.data = '';
  }
  getDepartmentsList() {
    this.httpClient.get('../../../assets/departments.json').subscribe(data => {
      this.listOfDepartments = data['department'];
    });
  }

  

}
