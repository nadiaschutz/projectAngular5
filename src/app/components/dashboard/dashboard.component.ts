import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';
import { environment } from '../../../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';



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
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {


  // patientSubscription: subscription;
  displayedColumns: string[] = ['type', 'id', 'name', 'number', 'dateCreated', 'dateModified'];

  displayedColumnsTwo: string[] = ['name', 'id', 'dependent', 'department', 'dateCreated', 'dateModified'];

  qrequest: any;

  constructor(
    private oauthService: OAuthService,
    private userService: UserService,
    private httpClient: HttpClient,
    private patientService: PatientService,
    private router: Router
  ) { }

  ngOnInit() {
    // this.patient.getAllPatientData();
    // if (this.oauthService.hasValidAccessToken()) {
    //     this.router.navigate(['/dashboard']);
    // }

     this.patientService.getAllPatientData().subscribe(
      data => this.handleSuccess(data),
      error => this.handleError(error)
    );



  }

  nameSearch(e) {
    return this.patientService.getPatientDataByName(e.target.value).subscribe(
      data => this.handleSuccess(data),
      error => this.handleError(error)
    );
  }

  dateSearch(e) {
    return this.patientService.getPatientDataByDOB(e.target.value).subscribe(
      data => this.handleSuccess(data),
      error => this.handleError(error)
    );
  }


  handleSuccess(data) {
    this.qrequest = data.entry;

  }

  handleError(error) {
    console.log(error);
  }

  // ngOnDestroy() {
  //   this.patientService.unsubscribe();
  // }

  newPSOHPButton() {
    this.router.navigate(['/psohpform']);
  }

  newAccountButton() {
    this.router.navigate(['/newaccount']);
  }

  newEmployeeButton() {

    this.router.navigate(['/employeeform']);
  }

  checkRegionalOfficeButtion() {
    this.router.navigate(['/region-summary']);
  }

}
