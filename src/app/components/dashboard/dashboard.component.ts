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
import { Client } from '../models/item.model';
import { e } from '@angular/core/src/render3';
import { AdminHomeScreenService } from 'src/app/service/admin-home-screen.service';

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

  str = null;
  searchParamsToShow = [];
  doNotShowZeroMessage = true;

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




  minDate: Date;
  maxDate: Date;
  listOfDepartments = [];
  listOfDepartmentsWithIdLookup = {};
  clientDepartment = null;
  employeeTypeArray = ['Employee', 'Dependent'];
  employeeType = null;
  branch = null;
  listOfBranches = [];
  listOfBranchesWithIdLookup = {};
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



  client: Client = {
    id: null,
    given: null,
    family: null,
    dob: null,
    employeeType: null,
    department: null,
    branch: null
  };

  clients: Client[];
  clientsArray = [];

  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();

  constructor(
    private userService: UserService,
    private patientService: PatientService,
    private router: Router,
    private utilService: UtilService,
    private adminHomeScreenService: AdminHomeScreenService,
  ) {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.minDate.setDate(this.minDate.getDate() - 43800);
    this.maxDate.setDate(this.maxDate.getDate());
  }



  ngOnInit() {
    // configuring datepicker style
    this.datePickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'YYYY-MM-DD',
        showWeekNumbers: false
      });

    // getting user Role and user Depratment
    this.roleInSession = sessionStorage.getItem('userRole');
    this.departmentOfUser = sessionStorage.getItem('userDept');

    /**
 * Initializes the list of branches from our system
 */
    this.setDepartmetnAndPatientData();

    this.userService.fetchAllDepartmentBranches().subscribe(
      data => this.populateBranches(data),
      error => this.handleError(error)
    );


    // this.sortUsersObjects();
    this.checkIfEnableCursor();
    // get initiall patients from server
  }

  // populateDeptBranches(data: any) {
  //   data.entry.forEach(element => {
  //     this.listOfBranches.push(element.resource);
  //   });
  // }


  dataSearch() {
    this.searchParamsToShow = [];
    if (this.dateOfBirth.data) {
      this.dateOfBirth.data = formatDate(this.dateOfBirth.data, 'yyyy-MM-dd', 'en');
    }

    this.arrOfVar.forEach((element, index) => {
      if (element.data !== null) {
        if (this.str === null) {
          this.str = '?' + element.prefix + element.data.toLowerCase();
        } else {
          this.str += '&' + element.prefix + element.data.toLowerCase();
        }
        this.searchParamsToShow.push(element.data);
      }
    });

    // calling get request with updated string
    if (this.str) {

      this.patientService
        .getPatientData(this.str)
        .subscribe(
          data => this.searchWithStr(data),
          error => this.handleError(error)
        );
    } else if (!this.str && (this.branch || this.clientDepartment)) {
      this.getAllData();
    }

    this.searchParamsToShow.push(this.branch);
    this.searchParamsToShow.push(this.clientDepartment);

    this.showSearchParamsOnZeroResults();
    // this.resetSearchParams();
  }

  populateBranches(data) {
    for (const location of data['entry']) {
      const branch = location.resource;
      this.listOfBranchesWithIdLookup[branch.id] = branch.name;
    }
  }

  async setDepartmetnAndPatientData() {
    const data = await this.userService.fetchAllDepartmentNamesAsync();
    const arrToSort = [];
    data['entry'].forEach(element => {
      this.listOfDepartmentsWithIdLookup[element['resource']['id']] = element['resource']['name'];
      arrToSort.push(
        {
          name: element['resource']['name'],
          id: 'Organization/' + element['resource']['id']
        });
    });

    this.listOfDepartments = arrToSort.sort((obj1, obj2) => {
      const textA = obj1.name.toUpperCase();
      const textB = obj2.name.toUpperCase();
      if (textA > textB) {
        return 1;
      }
      if (textA < textB) {
        return -1;
      }
      return 0;
    });
    this.getAllData();
  }

  change(val): void {

    if (val !== '') {
      // get job locations dropdown items
      this.adminHomeScreenService.getJobLocations({ organization: val })
        .subscribe(locations => {
          console.log('job list =>', locations);
          this.listOfBranches = this.extractKeyValuePairsFromBundle(locations);
          // this.employeeFormGroup.get('departmentBranch').enable();
          console.log(this.listOfBranches);
        },
          (err) => {
            console.log('Job locations list error => ', err);
          });
    } else {
      // this.employeeFormGroup.get('departmentBranch').disable();
      this.listOfBranches = [];
    }

  }

  extractKeyValuePairsFromBundle(bundle) {
    if (bundle && bundle['entry']) {
      const bundleEntries = bundle['entry'];

      const list = bundleEntries.map(item => {
        if (item && item.resource) {
          const temp = {
            value: item.resource.resourceType + '/' + item.resource.id,
            text: item.resource.name
          };

          return temp;
        }
        return { value: null, text: null };
      });

      return list;
    }

    return [];
  }


  // run on button 'refresh'
  refreshSearch() {
    location.reload();
  }



  // get initiall patients from server
  getAllData() {
    this.patientService
      .getAllPatientData()
      .subscribe(
        data => this.handleSuccessAll(data),
        error => this.handleError(error)
      );
  }



  // ?
  enableAllFunction() {
    this.enableAll = !this.enableAll;
  }

  // ?
  checkIfEnableCursor() {
    if (this.roleInSession === 'superuser') {
      this.enableAll = true;
    }
    // if (this.roleInSession === 'businessuser' || 'clientdept') {
    //   this.cursorClassEnables = false;
    // }
  }


  // handleSuccessAll(data) {
  //   this.patientList = [];
  //   if (data.total !== 0) {
  //     if (data.entry) {
  //       data.entry.forEach(item => {
  //         const individualEntry = item.resource;
  //         if (this.employeeType || this.clientDepartment) {

  //         } else {
  //           const temp = {};
  //           temp['id'] = individualEntry['id'];
  //           temp['given'] = individualEntry['name'][0]['given'][0];
  //           temp['family'] = individualEntry['name'][0]['family'];
  //           temp['dob'] = individualEntry['birthDate'];
  //           individualEntry['extension'].forEach(extension => {
  //             if (extension['url'] === 'https://bcip.smilecdr.com/fhir/workplace') {
  //               temp['department'] = extension.valueString;
  //             }
  //           });
  //           individualEntry['extension'].forEach(extension => {
  //             if (extension['url'] ==='https://bcip.smilecdr.com/fhir/employeetype') {
  //               temp['employeeType'] = extension.valueString;
  //             }
  //           });
  //           individualEntry['extension'].forEach(extension => {
  //             if (extension['url'] === 'https://bcip.smilecdr.com/fhir/branch') {
  //               temp['branch'] = extension.valueString;
  //             }
  //           });
  //           this.patientList.push(temp);
  //         }
  //       });
  //     } else {
  //       if (this.employeeType || this.clientDepartment) {
  //         this.checkForEmployeeTypeAndClientDepartment(data);
  //       } else {
  //         this.patientList.push(data);
  //       }
  //     }
  //   }
  //   this.resetSearchParams();
  // }

  handleSuccessAll(data) {
    this.doNotShowZeroMessage = true;

    if (data.total === 0) {
      this.doNotShowZeroMessage = false;
    }

    if (data.entry) {

      if ((this.branch || this.clientDepartment) || (this.branch && this.clientDepartment)) {
        this.filterRegionAndClientDepartment(data);

      } else {
        data.entry.forEach(element => {
          this.clientsArray.push(element.resource);
        });
        this.createClientsObject(this.clientsArray);
      }
    }

    this.resetSearchParams();
  }



  createClientsObject(data) {
    if (data) {
      this.clients = data.map(el => ({
        ...this.client,
        id: el.id,
        lastName: el['name'][0]['family'],
        firstName: el['name'][0]['given'][0],
        dateOfBirth: el['birthDate'],
        clientType: this.getClientType(el),
        department: this.getDepartment(el),
        branch: this.getBranch(el)
      }
      ));

    }
  }


  getDepartment(clientObj) {
    let result = '-';
    if (clientObj['extension']) {
      clientObj['extension'].forEach(extension => {
        if (extension['url'] === 'https://bcip.smilecdr.com/fhir/workplace') {
          if (extension.valueReference) {
            const id = this.utilService.getIdFromReference(extension.valueReference.reference);
            result = this.listOfDepartmentsWithIdLookup[id];
          }
        }
      });
    }
    return result;
  }

  getClientType(clientObj) {
    let result = '-';
    if (clientObj['extension']) {
      clientObj['extension'].forEach(extension => {

        if (extension['url'] === 'https://bcip.smilecdr.com/fhir/employeetype') {
          result = extension.valueString;
        }
      });
    }
    return result;
  }

  getBranch(clientObj) {
    let result = '-';
    if (clientObj['extension']) {
      clientObj['extension'].forEach(extension => {

        if (extension['url'] === 'https://bcip.smilecdr.com/fhir/branch') {
          if (extension.valueReference) {
            const id = this.utilService.getIdFromReference(extension.valueReference.reference);
            result = this.listOfBranchesWithIdLookup[id];
          }
        }
      });
    }
    return result;
  }

  sorterFunction(colName) {
    this.clients = this.utilService.sortArray(colName, this.clients);
  }

  // checkForEmployeeTypeAndClientDepartment(individualEntry) {
  //   individualEntry.extension.forEach(individualExtension => {
  //     if (
  //       this.employeeType &&
  //       individualExtension.url ===
  //       'https://bcip.smilecdr.com/fhir/employeetype'
  //     ) {
  //       if (individualExtension.valueString === this.employeeType) {
  //         this.patientList.push(individualEntry);
  //       }
  //     } else if (
  //       this.clientDepartment &&
  //       individualExtension.url === 'https://bcip.smilecdr.com/fhir/workplace'
  //     ) {
  //       if (individualExtension.valueString === this.clientDepartment) {
  //         this.patientList.push(individualEntry);
  //       }
  //     }
  //   });
  // }

  handleError(error) {
    console.log(error);
  }

  routeToSummary(data) {

    if (this.roleInSession !== 'businessuser') {

      sessionStorage.setItem('patientSummaryId', data.id);
      this.router.navigateByUrl('/employeesummary');

    }
  }


  showCursor(data) {
    if (this.roleInSession !== 'businessuser') {
      return true;

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






  showSearchParamsOnZeroResults() {
    this.showParams = null;
    this.searchParamsToShow.forEach((element, index) => {
      if (element) {
        if (!this.showParams) {
          this.showParams = element;
        } else {
          this.showParams += ', ' + element;
        }
      }
    });
  }

  searchWithStr(data) {
    this.doNotShowZeroMessage = true;

    this.clients = []; // this.servRequests = [];
    // assign data.Regional Office for Processing to var regionData
    if (data.total > 0) {
      if (data.entry) {
        this.filterRegionAndClientDepartment(data);
      }
    } else {
      this.doNotShowZeroMessage = false;
    }
    this.resetSearchParams();
  }


  filterRegionAndClientDepartment(data) {
    this.doNotShowZeroMessage = true;
    this.clients = [];
    this.clientsArray = [];

    let flag = false;
    let matches = false;
    const sortedDataArr = [];


    let regionAndClientDepartmentMatches = true;
    if (this.branch || this.clientDepartment) {
      regionAndClientDepartmentMatches = false;
    }


    data.entry.forEach(eachEntry => {
      if (eachEntry['resource']['extension']) {
        eachEntry.resource.extension.forEach(item => {
          if (this.branch && this.clientDepartment) {

            if (item['url'] === 'https://bcip.smilecdr.com/fhir/branch') {
              flag = this.checkStringMatches(item, this.branch);
            }

          } else if (this.branch && !this.clientDepartment) {
            if (item['url'] === 'https://bcip.smilecdr.com/fhir/branch') {
              regionAndClientDepartmentMatches = this.checkStringMatches(item, this.branch);
            }

          } else if (this.clientDepartment && !this.branch) {
            if (item['url'] === 'https://bcip.smilecdr.com/fhir/workplace') {
              regionAndClientDepartmentMatches = this.checkStringMatches(item, this.clientDepartment);
            }
          }
        });
      }
      if (flag) {
        sortedDataArr.push(eachEntry);
        flag = false;
      }
      if (regionAndClientDepartmentMatches) {
        this.clientsArray.push(eachEntry.resource);
        regionAndClientDepartmentMatches = false;
      }
      this.createClientsObject(this.clientsArray);
    });
    if (sortedDataArr) {
      sortedDataArr.forEach(individItem => {
        individItem.resource.extension.forEach(element => {

          if (element['url'] === 'https://bcip.smilecdr.com/fhir/workplace') {
            matches = this.checkStringMatches(element, this.clientDepartment);
          }
        });
        if (matches) {
          this.clientsArray.push(individItem.resource);
          this.createClientsObject(this.clientsArray);
          matches = false;
        }
      });

    }



    if (this.clientsArray.length === 0) {
      this.doNotShowZeroMessage = false;
    }
  }

  checkStringMatches(item, matchingItem) {
    // remove anything after 1st dash
    let matchesBoolean = true;
    let matchingString = item.valueString.toLowerCase();
    if (matchingString.indexOf('-') !== -1) {
      matchingString = matchingString.substring(0, matchingString.indexOf('-'));
    }
    if (matchingString !== matchingItem.toLocaleLowerCase()) {
      matchesBoolean = false;
      return matchesBoolean;
      // }
    } else if (matchingString === matchingItem.toLocaleLowerCase()) {
      matchesBoolean = true;
      return matchesBoolean;
    }
  }




  addParams(params) {
    this.showParams = this.showParams + ', ' + params;
  }

  resetSearchParams() {
    this.clientDepartment = null;
    this.employeeType = null;
    this.givenName.data = null;
    this.familyName.data = null;
    this.clientId.data = null;
    this.dateOfBirth.data = null;
    this.str = null;
    this.branch = null;
  }


}
