import { Component, OnInit, OnDestroy } from '@angular/core';
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

  name = {
    prefix: 'name=',
    data: null
  };

  clientId = {
    prefix: '',
    data: null
  };

  dateOfBirth = {
    prefix: 'birthDate=',
    data: null
  };

  private arrOfVar = [this.name, this.clientId, this.dateOfBirth];
  str = null;
  listOfDepartments = [];
  clientDepartment;
  listOfRegions = ['Atlantic', 'Quebec', 'NCR', 'Ontario', 'Prairies', 'Pacific'];
  region;

  // patientSubscription: subscription;
  displayedColumns: string[] = ['type', 'id', 'name', 'number', 'dateCreated', 'dateModified'];

  displayedColumnsTwo: string[] = ['name', 'id', 'dependent', 'department', 'dateCreated', 'dateModified'];

  qrequest = [];

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

     this.patientService.getPatientData('').subscribe(
      data => this.handleSuccess(data),
      error => this.handleError(error)
    );
    this.getDepartmentsList();
  }

  // nameSearch(e) {
  //   return this.patientService.getPatientDataByName(e.target.value).subscribe(
  //     data => this.handleSuccess(data),
  //     error => this.handleError(error)
  //   );
  // }

  // dateSearch(e) {
  //   return this.patientService.getPatientDataByDOB(e.target.value).subscribe(
  //     data => this.handleSuccess(data),
  //     error => this.handleError(error)
  //   );
  // }


  handleSuccess(data) {
    console.log(data);
    this.qrequest = [];
    if (data.entry) {
      data.entry.forEach(item => {
        this.qrequest.push(item.resource);
      });
    } else {
      this.qrequest.push(data);
    }
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
  employeeSearch() {
    console.log(this.clientId);
    this.arrOfVar.forEach((element, index) => {
      if ( element.data !== null ) {
        if (this.str === null) {
          // this.str = '?' + element.prefix + element.data;
          this.str = element.prefix + element.data;
        } else {
          this.str += '&' + element.prefix + element.data;
        }
      }
    });
    console.log(this.str);

    this.patientService.getPatientData(this.str).subscribe(
      data => this.handleSuccess(data),
      error => this.handleError(error)
    );
  }
  getDepartmentsList() {
    this.httpClient.get('../../../assets/departments.json').subscribe(data => {
      this.listOfDepartments = data['department'];
    });
  }

}
