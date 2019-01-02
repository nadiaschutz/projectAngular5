import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';
import { environment } from '../../../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
export class DashboardComponent implements OnInit {
  givenName = {
    prefix: 'given=',
    data: null
  };

  familyName = {
    prefix: 'family=',
    data: null
  };

  clientId = {
    prefix: '_id=',
    data: null
  };

  dateOfBirth = {
    prefix: 'birthdate=',
    data: null
  };

  private arrOfVar = [
    this.givenName,
    this.familyName,
    this.dateOfBirth,
    this.clientId
  ];
  listOfDepartments = [];
  clientDepartment = null;
  employeeTypeArray = ['Employee', 'Dependent'];
  employeeType = null;

  // patientSubscription: subscription;
  displayedColumns: string[] = [
    'type',
    'id',
    'name',
    'number',
    'dateCreated',
    'dateModified'
  ];

  displayedColumnsTwo: string[] = [
    'name',
    'id',
    'dependent',
    'department',
    'dateCreated',
    'dateModified'
  ];

  patientList = [];

  department: string;
  doneFlag;
  roleInSession = 'emptyClass';

  constructor(
    private oauthService: OAuthService,
    private userService: UserService,
    private httpClient: HttpClient,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sortUsersObjects();

    this.userService.fetchCurrentRole();
    this.userService.subscribeRoleData().subscribe(data => {
      this.roleInSession = data;
    });
  }

  getAllPatients() {
    this.patientService
      .getAllPatientData()
      .subscribe(
        data => this.handleSuccess(data),
        error => this.handleError(error)
      );
    this.getDepartmentsList();
  }

  sortUsersObjects() {
    this.userService
      .fetchCurrentUserData(this.oauthService.getIdentityClaims()['sub'])
      .subscribe(user => {
        user['users'].forEach(element => {
          if (
            element['familyName'] ===
              this.oauthService.getIdentityClaims()['family_name'] &&
            element['givenName'] ===
              this.oauthService.getIdentityClaims()['given_name'] &&
            element['username'] === this.oauthService.getIdentityClaims()['sub']
          ) {
            this.setViewForPractitionerRole(element);
          }
        });
      });
  }

  setViewForPractitionerRole(userId: any) {
    let pracID: any;
    if (userId['defaultLaunchContexts']) {
      pracID = userId['defaultLaunchContexts'][0]['resourceId'];
      console.log(pracID);
      this.userService
        .getPractitionerRoleByPractitionerID(pracID)
        .subscribe(data => {
          if (data['total'] > 0) {
            data['entry'].forEach(element => {
              const individualEntry = element.resource;
              // console.log(individualEntry)
              this.userService
                .getAnyFHIRObjectByReference(
                  '/' + individualEntry['organization']['reference']
                )
                .subscribe(role => {
                  if (!role['id'].includes('PSOHP')) {
                    this.department = role['name'];
                    this.userService
                      .getAllPatientsInSameDepartment(this.department)
                      .subscribe(patients => {
                        this.handleSuccess(patients);
                      });
                  }
                });

              // individualEntry['location'].forEach(location => {
              // this.userService.getAnyFHIRObjectByReference('/' + location['reference']).subscribe(
              //   loc => console.log('Departments associated with this account: ', loc['name'])
              // )
              // });
            });
          }
        });
    } else {
      this.getAllPatients();
      console.log('nothing here chief');
    }
  }

  handleSuccess(data) {
    // console.log(data);
    this.patientList = [];
    // console.log(this.patientList);
    if (data.total !== 0) {
      if (data.entry) {
        data.entry.forEach(item => {
          const individualEntry = item.resource;
          if (this.employeeType || this.clientDepartment) {
            this.checkForEmployeeTypeAndClientDepartment(individualEntry);
          } else {
            this.patientList.push(individualEntry);
          }
        });
      } else {
        if (this.employeeType || this.clientDepartment) {
          this.checkForEmployeeTypeAndClientDepartment(data);
        } else {
          this.patientList.push(data);
        }
      }
    }
    console.log(this.patientList);
    this.resetSearchParams();
  }

  checkForEmployeeTypeAndClientDepartment(individualEntry) {
    individualEntry.extension.forEach(individualExtension => {
      if (
        this.employeeType &&
        individualExtension.url ===
          'https://bcip.smilecdr.com/fhir/employeetype'
      ) {
        if (individualExtension.valueString === this.employeeType) {
          this.patientList.push(individualEntry);
        }
      } else if (
        this.clientDepartment &&
        individualExtension.url === 'https://bcip.smilecdr.com/fhir/workplace'
      ) {
        if (individualExtension.valueString === this.clientDepartment) {
          this.patientList.push(individualEntry);
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
      if (element.data !== null) {
        if (searchParams.length === 0) {
          searchParams = '?' + element.prefix + element.data;
        } else {
          searchParams += '&' + element.prefix + element.data;
        }
      }
    });
    // if (this.clientId.data) {
    //   searchParams = this.clientId.prefix + this.clientId.data + searchParams;
    // }
    console.log(searchParams);

    this.patientService
      .getPatientData(searchParams)
      .subscribe(
        data => this.handleSuccess(data),
        error => this.handleError(error)
      );
    this.resetSearchParams();
  }
  resetSearchParams() {
    this.clientDepartment = null;
    this.employeeType = null;
    this.givenName.data = null;
    this.familyName.data = null;
    this.clientId.data = null;
    this.dateOfBirth.data = null;
  }
  getDepartmentsList() {
    this.httpClient.get('../../../assets/departments.json').subscribe(data => {
      this.listOfDepartments = data['department'];
    });
  }
}
