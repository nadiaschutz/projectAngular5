import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';
import { environment } from '../../../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UtilService } from '../../service/util.service';

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
  order;
  departmentOfUser: string;
  doneFlag;
  roleInSession = 'emptyClass';
  switchSortChoice = true;
  enableAll;
  cursorClassEnables;
  showParams;
  constructor(
    private oauthService: OAuthService,
    private userService: UserService,
    private httpClient: HttpClient,
    private patientService: PatientService,
    private router: Router,
    private utilService: UtilService
  ) {}

  ngOnInit() {
    this.userService.fetchUserName();
    this.userService.fetchCurrentRole();

    this.sortUsersObjects();
    this.userService.subscribeRoleData().subscribe(data => {
      this.roleInSession = data;
      if (this.roleInSession === 'superuser') {
        this.enableAll = true;
      }

      if (this.roleInSession === 'businessuser' || 'clientdept') {
          this.cursorClassEnables = false;
        // console.log(this.cursorClassEnables);
      }
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
                    this.departmentOfUser = role['name'];
                    this.getAllPatients();
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
            const temp = {};
            temp ['id'] =  individualEntry['id'];
            temp ['given'] = individualEntry['name'][0]['given'][0];
            temp ['family'] = individualEntry['name'][0]['family'];
            temp ['dob'] = individualEntry['birthDate'];
            individualEntry['extension'].forEach(extension => {
              if (extension['url'] === 'https://bcip.smilecdr.com/fhir/workplace') {
                temp['department'] = extension.valueString;
              }
            }) ;
            individualEntry['extension'].forEach(extension => {
              if (extension['url'] === 'https://bcip.smilecdr.com/fhir/employeetype') {
                temp['employeeType'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (extension['url'] === 'https://bcip.smilecdr.com/fhir/branch') {
                temp['branch'] = extension.valueString;
              }
            });
            // if (this.department === temp['department']) {
              this.patientList.push(temp);
            // }

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
    this.resetSearchParams();
  }

  sorterFunction(colName) {
    this.patientList = this.utilService.sortArray(colName, this.patientList);
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
    if (this.roleInSession === 'clientdept') {
      if (this.departmentOfUser === data['department']) {
        this.userService.getSelectedID(data.id);
        this.router.navigateByUrl('/employeesummary');
      }
    } else {
      if (this.roleInSession !== 'businessuser') {
        if (this.roleInSession !== 'clientdept') {
          this.userService.getSelectedID(data.id);
          this.router.navigateByUrl('/employeesummary');
        }
      }
    }

  }

  showCursor(data) {
    if (this.roleInSession === 'clientdept') {
      if (this.departmentOfUser === data['department']) {
        return true;
      }
    } else {
      if (this.roleInSession !== 'businessuser') {
        if (this.roleInSession !== 'clientdept') {
          return true;
        }
      }
    }
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
    this.arrOfVar.forEach((element) => {
      if (element.data !== null) {
        if (searchParams.length === 0) {
          searchParams = '?' + element.prefix + element.data;
        } else {
          searchParams += '&' + element.prefix + element.data;
        }
      }
    });
    console.log(searchParams);
    // if (this.clientId.data) {
    //   searchParams = this.clientId.prefix + this.clientId.data + searchParams;
    // }

    // this.arrOfVar.forEach((element, index) => {
    //   if (element.data !== null) {
    //     if (this.showParams.length === 0) {
    //       this.showParams = element.data;
    //     } else {
    //       this.showParams += ', ' + element.data;
    //     }
    //   }
    // });

    if (this.employeeType) {
      this.addParams (this.employeeType);
    }
    if (this.departmentOfUser) {
      this.addParams (this.departmentOfUser);
    }
    console.log(this.showParams);

    this.patientService
      .getPatientData(searchParams)
      .subscribe(
        data => this.handleSuccess(data),
        error => this.handleError(error)
      );
    this.resetSearchParams();
  }

  addParams(params) {
    this.showParams = this.showParams + ', ' +  params;
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
