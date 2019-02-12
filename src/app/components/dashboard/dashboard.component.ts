import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';
import { environment } from '../../../environments/environment';
import { OAuthService, LoginOptions } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UtilService } from '../../service/util.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { formatDate } from '@angular/common';
import { e } from '@angular/core/src/render3';

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
  datePickerConfig: Partial<BsDatepickerConfig>;
  private arrOfVar = {
    givenName: {
      prefix: 'given=',
      data: null
    },
    familyName: {
      prefix: 'family=',
      data: null
    },
    clientId: {
      prefix: '_id=',
      data: null
    },
    dateOfBirth: {
      prefix: 'birthdate=',
      data: null
    }
    // this.givenName,
    // this.familyName,
    // this.dateOfBirth,
    // this.clientId
  };

  minDate: Date;
  maxDate: Date;
  listOfDepartments = [];
  clientDepartment = null;
  employeeTypeArray = ['Employee', 'Dependent'];
  employeeType = null;
  branch;
  branches;
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
  departmentOfUser: string;
  roleInSession = 'emptyClass';
  enableAll;
  cursorClassEnables;
  showParams = null;

  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();

  constructor(
    private oauthService: OAuthService,
    private userService: UserService,
    private httpClient: HttpClient,
    private patientService: PatientService,
    private router: Router,
    private utilService: UtilService,
    private bsDatepickerConfig: BsDatepickerConfig
  ) {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.minDate.setDate(this.minDate.getDate() - 43800);
    this.maxDate.setDate(this.maxDate.getDate());
  }

  ngOnInit() {
    this.datePickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'YYYY-MM-DD',
        showWeekNumbers: false
      });

    this.roleInSession = sessionStorage.getItem('userRole');
    this.departmentOfUser = sessionStorage.getItem('userDept');
    // this.sortUsersObjects();
    this.checkIfEnableCursor();

    this.userService
      .fetchAllDepartmentNames()
      .subscribe(
        data => this.populateDeptNames(data),
        error => this.handleError(error)
      );

    this.getAllPatients();
  }

  refreshSearch() {
    location.reload();
  }

  enableAllFunction() {
    this.enableAll = !this.enableAll;
  }

  getAllPatients() {
    this.patientService
      .getAllPatientData()
      .subscribe(
        data => this.handleSuccess(data),
        error => this.handleError(error)
      );
  }

  checkIfEnableCursor() {
    if (this.roleInSession === 'superuser') {
      this.enableAll = true;
    }
    if (this.roleInSession === 'businessuser' || 'clientdept') {
      this.cursorClassEnables = false;
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
            // this.checkForEmployeeTypeAndClientDepartment(individualEntry);
          } else {
            const temp = {};
            temp['id'] = individualEntry['id'];
            temp['given'] = individualEntry['name'][0]['given'][0];
            temp['family'] = individualEntry['name'][0]['family'];
            temp['dob'] = individualEntry['birthDate'];
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] === 'https://bcip.smilecdr.com/fhir/workplace'
              ) {
                temp['department'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] ===
                'https://bcip.smilecdr.com/fhir/employeetype'
              ) {
                temp['employeeType'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] === 'https://bcip.smilecdr.com/fhir/branch'
              ) {
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
        sessionStorage.setItem('patientSummaryId', data.id);
        this.router.navigateByUrl('/employeesummary');
      }
    } else {
      if (this.roleInSession !== 'businessuser') {
        if (this.roleInSession !== 'clientdept') {
          sessionStorage.setItem('patientSummaryId', data.id);
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
    this.showParams = null;
    let searchParams = '';
    if (this.arrOfVar.dateOfBirth.data) {
      this.arrOfVar.dateOfBirth.data = formatDate(
        this.arrOfVar.dateOfBirth.data,
        'yyyy-MM-dd',
        'en'
      );

    }
    console.log(this.arrOfVar);
    // this.arrOfVar.forEach(element => {
    //   console.log(element);
    //   if (element.data !== null) {
    //     if (searchParams.length === 0) {
    //       searchParams = '?' + element.prefix + element.data;
    //     } else {
    //       searchParams += '&' + element.prefix + element.data;
    //     }
    //   }
    // });

    // tslint:disable-next-line:forin
    for (const key in this.arrOfVar) {
      console.log(key);
      console.log(this.arrOfVar[key].data);

      if (this.arrOfVar[key].data !== null) {
        if (searchParams.length === 0) {
          searchParams = '?' + this.arrOfVar[key].prefix + this.arrOfVar[key].data;
        } else {
          searchParams += '&' + this.arrOfVar[key].prefix + this.arrOfVar[key].data;
        }

      }
    }
    console.log(this.arrOfVar);
    console.log(searchParams);

    // if (this.arrOfVar.clientId.data) {
    //   searchParams = this.arrOfVar.clientId.prefix + this.arrOfVar.clientId.data + searchParams;
    // }

    // this.arrOfVar.forEach((element, index) => {
    //   console.log(this.showParams);
    //   if (element.data) {
    //     if (!this.showParams) {
    //       this.showParams = element.data;
    //     } else {
    //       this.showParams += ', ' + element.data;
    //     }
    //   }
    // });

    // if (this.employeeType) {
    //   this.addParams(this.employeeType);
    // }
    if (this.clientDepartment) {
      this.addParams(this.clientDepartment);
    }

    this.patientService
      .getPatientData(searchParams)
      .subscribe(
        data => this.handleSuccess(data),
        error => this.handleError(error)
      );
    console.log(this.arrOfVar);
    this.resetSearchParams();

  }
  addParams(params) {
    console.log(this.showParams);
    this.showParams = this.showParams + ', ' + params;
  }

  resetSearchParams() {
    this.clientDepartment = null;
    this.employeeType = null;
    this.arrOfVar.givenName.data = null;
    this.arrOfVar.familyName.data = null;
    this.arrOfVar.clientId.data = null;
    this.arrOfVar.dateOfBirth.data = null;
  }

  /**
 * Used in conjunction with the user service. Gets all Department Names
 * stored on the server to link to a Practitioner.
 * @param data
 */
  populateDeptNames(data: any) {
    data.entry.forEach(element => {
      this.listOfDepartments.push(element['resource']['name']);
    });
  }
}
