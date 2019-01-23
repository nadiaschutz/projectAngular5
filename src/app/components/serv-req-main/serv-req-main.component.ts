import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { QrequestService } from 'src/app/service/qrequest.service';
import { Router } from '@angular/router';
import { multicast } from 'rxjs/operators';
import { PatientService } from 'src/app/service/patient.service';
import { UtilService } from 'src/app/service/util.service';
import { FormsModule } from '@angular/forms';
import { link } from 'fs';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-serv-req-main',
  templateUrl: './serv-req-main.component.html',
  styleUrls: ['./serv-req-main.component.scss']
})
export class ServReqMainComponent implements OnInit {
  // QuestionnaireResponse?subject:Patient.name=Pughna&subject:Patient.given=Lasrt

  params = [];

  givenName = {
    prefix: 'subject:Patient.given=',
    data: null
  };

  familyName = {
    prefix: 'subject:Patient.name=',
    data: null
  };

  serviceRequestId = {
    prefix: '_id=',
    data: null
  };

  dateOfBirth = {
    prefix: 'subject:Patient.birthdate=',
    data: null
  };

  status = {
    prefix: 'status=',
    data: null
  };

  date = {
    prefix: 'authored=',
    data: null
  };

  statusArr = [
    'in-progress',
    'Waiting',
    'Action Required',
    'Cancelled',
    'Suspended',
    'Closed'
  ];
  regionArr = ['Atlantic', 'Quebec', 'NCR', 'Ontario', 'Prairies', 'Pacific'];
  departmentList = [];

  currentUserDepartment;
  currentUserRole;
  // comes from the responce object
  region: string = null;
  regionString;
  departmentString;
  clientDepartment: string = null;

  servRequests = [];
  servceRequestDatas = [];

  myString;
  str = null;
  private arrOfVar = [
    this.givenName,
    this.familyName,
    this.serviceRequestId,
    this.dateOfBirth,
    this.status,
    this.date
  ];

  constructor(
    private oauthService: OAuthService,
    private httpClient: HttpClient,
    private userService: UserService,
    private qrequestService: QrequestService,
    private patientService: PatientService,
    private utilService: UtilService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userService.fetchUserName();
    this.userService.fetchCurrentRole();
    this.userService.fetchCurrentUserDept();

    /**
     * Initializes the list of branches from our system
     */
    this.userService
      .fetchAllDepartmentNames()
      .subscribe(
        data => this.populateDeptNames(data),
        error => this.handleError(error)
      );

    this.userService.subscribeUserDept().subscribe(
      data => {
        this.currentUserDepartment = data;
        
      },
      error => this.handleError(error)
    );

    this.qrequestService
    .getData('')
    .subscribe(
      qData => this.handleSuccessAll(qData),
      error => this.handleErrorAll(error)
    );

    this.userService
      .subscribeRoleData()
      .subscribe(
        data => (this.currentUserRole = data),
        error => this.handleError(error)
      );
  }

  populateDeptNames(data: any) {
    data.entry.forEach(element => {
      this.departmentList.push(element['resource']['name']);
    });
  }

  dataSearch() {
    console.log('region', this.region);
    console.log('department', this.clientDepartment);

    this.arrOfVar.forEach((element, index) => {
      if (element.data !== null) {
        if (this.str === null) {
          this.str = '?' + element.prefix + element.data;
        } else {
          this.str += '&' + element.prefix + element.data;
        }
      }
    });

    console.log(this.str);

    // calling get request with updated string
    if (this.str) {
      this.qrequestService
        .getData(this.str)
        .subscribe(
          data => this.handleSuccess(data),
          error => this.handleError(error)
        );
    } else if (!this.str && (this.region || this.clientDepartment)) {
      this.qrequestService
        .getData('')
        .subscribe(
          data => this.handleSuccessAll(data),
          error => this.handleErrorAll(error)
        );
    }
  }

  // searchExtraData(searchData) {
  //   // this.servRequests = [];
  //   if (searchData && !this.str) {
  //     console.log('hi without this.str data' + searchData);
  //     // this.qrequestService.getData('').subscribe(
  //     //   data => this.handleSuccessAll(data),
  //     //   error => this.handleErrorAll(error)
  //     // );
  //     this.servRequests = [];
  //     this.qrequestService.getData('').subscribe(
  //       data => this.handleSuccessAll(data),
  //       error => this.handleErrorAll(error)
  //     );
  //   }
  // }

  sorterFunction(colName) {
    this.servRequests = this.utilService.sortArray(colName, this.servRequests);
  }

  handleSuccessAll(data) {
    console.log(data);
    if (data.entry) {
      // for (const individualRecord of data.entry) {
      //   if (individualRecord.resource.item) {
      //     if (this.region || this.clientDepartment) {
      //       this.sortRegionAndClientDepartment(data);
      //     } else {
      //       this.servRequests.push(individualRecord.resource);
      //     }
      //   }
      // }

      if (this.region || this.clientDepartment) {
        console.log(this.region, this.clientDepartment);
        this.servceRequestDatas = null;
        this.regionString = null;
        this.servceRequestDatas = data.entry;
        console.log(this.servceRequestDatas);
        this.filterRegionAndClientDepartment(data);
      } else {
        console.log('i am not sorting anything');
        data['entry'].forEach(element => {
          const individualEntry = element['resource'];

          if (
            individualEntry['item'] &&
            this.currentUserRole === 'clientdept'
          ) {
            individualEntry['item'].forEach(department => {
              if (
                department['text'] === 'Submitting Department' &&
                department['answer'][0] === this.currentUserDepartment
              ) {
                this.servRequests.push(individualEntry);
              }
            });
          } else {
            this.servRequests.push(individualEntry);
          }
        });
        console.log(this.servRequests);
      }
    }
  }

  handleErrorAll(error) {
    console.log(error);
  }

  // try first to assign all the data to same onject and show without if....othervise =>
  // if the string is ==='' => show servceRequestDatas.date and etc
  // if the string is !=='' => show the data called from search server

  handleSuccess(data) {
    this.regionString = null;
    this.servRequests = [];
    console.log(data);
    // assign data.Regional Office for Processing to var regionData
    if (data.total > 0) {
      if (data.entry) {
        this.servceRequestDatas = null;
        this.regionString = null;
        this.servceRequestDatas = data.entry;
        this.filterRegionAndClientDepartment(data);
      }
    }
    this.str = null;
    this.givenName.data = null;
    this.familyName.data = null;
    this.serviceRequestId.data = null;
    this.dateOfBirth.data = null;
    this.status.data = null;
    this.date.data = null;
    this.region = null;
    this.regionString = null;
    this.clientDepartment = null;
  }

  filterRegionAndClientDepartment(data) {
    console.log('checkign SR object', this.servRequests);
    console.log(data);
    this.servRequests = [];
    // let regionMatches = false;
    // let clientDepartmentMatches = false;
    let regionAndClientDepartmentMatches = true;
    data.entry.forEach(eachEntry => {
      if (eachEntry['resource']['item']) {
        eachEntry.resource.item.forEach(item => {
          if (this.region && this.clientDepartment) {
            console.log('fix me', this.clientDepartment);
          } else if (this.region && !this.clientDepartment) {
            if (this.region && item.text === 'Regional Office for Processing') {
              regionAndClientDepartmentMatches = this.checkStringMatches(
                item,
                this.region,
                regionAndClientDepartmentMatches
              );
            } else {
              return '-';
            }
          } else if (this.clientDepartment && !this.region) {
            if (
              this.clientDepartment &&
              item.text === 'Submitting Department'
            ) {
              regionAndClientDepartmentMatches = this.checkStringMatches(
                item,
                this.clientDepartment,
                regionAndClientDepartmentMatches
              );
            } else {
              return '-';
            }
          }
        });
      }
      if (regionAndClientDepartmentMatches) {
        console.log('checkign SR object', this.servRequests);
        console.log('5', regionAndClientDepartmentMatches);
        this.servRequests.push(eachEntry.resource);
      }
    });
  }

  checkStringMatches(item, matchingItem, matchesBoolean: boolean) {
    console.log('checkStringMatches', item);
    console.log('checkStringMatches', matchingItem);
    console.log('checkStringMatches', matchesBoolean);
    // remove anything after 1st dash
    let matchingString = item.answer[0].valueString.toLowerCase();
    if (matchingString.indexOf('-') !== -1) {
      matchingString = matchingString.substring(0, matchingString.indexOf('-'));
    }
    if (matchingString !== matchingItem.toLocaleLowerCase()) {
      console.log('1', matchesBoolean);
      matchesBoolean = false;
      console.log('2', matchesBoolean);
      return matchesBoolean;
      // }
    } else if (matchingString === matchingItem.toLocaleLowerCase()) {
      console.log('3', matchesBoolean);
      matchesBoolean = true;
      console.log('4', matchesBoolean);
      return matchesBoolean;
    }
  }

  handleError(error) {
    console.log(error);
  }
  getServiceType(serviceRequestObj): string {
    let result = '-';
    // console.log(serviceRequestObj.questionnaire.reference);
    if (serviceRequestObj.item) {
      if (
        serviceRequestObj.questionnaire &&
        serviceRequestObj.questionnaire.reference === 'Questionnaire/1953'
      ) {
        serviceRequestObj.item.forEach(item => {
          if (item.text === 'PSOHP Service') {
            if (item['answer']) {
              result = item.answer[0].valueString.substring(
                item.answer[0].valueString.indexOf('(') + 1,
                item.answer[0].valueString.length
              );
              result = result.substring(0, result.length - 1);
            }
          }
        });
      } else {
        serviceRequestObj.item.forEach(item => {
          if (item.text === 'PSOHP Service') {
            if (item['answer']) {
              result = item.answer[0].valueString.substring(
                item.answer[0].valueString.indexOf('(') + 1,
                item.answer[0].valueString.length
              );
              result = result.substring(0, result.length - 1);
            }
          }
        });
      }
    }
    return result;
  }

  getAssessmentType(serviceRequestObj): string {
    if (
      serviceRequestObj.questionnaire &&
      serviceRequestObj.questionnaire.reference === 'Questionnaire/TEST1'
    ) {
      return this.getLinkValueFromObject(serviceRequestObj, 'PSOHP Service', 2);
    }
    if (
      serviceRequestObj.questionnaire &&
      serviceRequestObj.questionnaire.reference === 'Questionnaire/1953'
    ) {
      return '-';
    }
  }
  getRegion(serviceRequestObj): string {
    if (
      serviceRequestObj.questionnaire &&
      serviceRequestObj.questionnaire.reference === 'Questionnaire/TEST1'
    ) {
      return this.getLinkValueFromObject(
        serviceRequestObj,
        'Regional Office for Processing',
        1
      );
    }
    if (
      serviceRequestObj.questionnaire &&
      serviceRequestObj.questionnaire.reference === 'Questionnaire/1953'
    ) {
      return '-';
    }
  }
  getCreatedBy(serviceRequestObj) {
    if (
      serviceRequestObj.questionnaire &&
      serviceRequestObj.questionnaire.reference === 'Questionnaire/TEST1'
    ) {
      return this.getLinkValueFromObject(serviceRequestObj, 'Created By', 1);
    }
    if (
      serviceRequestObj.questionnaire &&
      serviceRequestObj.questionnaire.reference === 'Questionnaire/1953'
    ) {
      serviceRequestObj['item'].forEach(item => {
        if (item['text'] === 'Name of the Requester') {
          if (item['answer']) {
            item['answer'].forEach(answer => {
              if (answer) {
                return answer['valueString'];
              }
            });
          } else {
            return '-';
          }
        }
      });
    }
  }

  checkIfSubject(object: any) {
    if (object['subject']) {
      return object['subject']['display'];
    } else {
      return '-';
    }
  }

  getLinkValueFromObject(serviceRequestObj, text: string, dashNum): string {
    let result = '-';
    if (serviceRequestObj.item) {
      serviceRequestObj.item.forEach(item => {
        // console.log(item);
        if (item.text === text) {
          if (item['answer']) {
            if (item.answer[0].valueString.indexOf('-') > 0) {
              if (dashNum === 1) {
                result = item.answer[0].valueString.substring(
                  0,
                  item.answer[0].valueString.indexOf('-')
                );
              }
              if (dashNum === 2) {
                result = item.answer[0].valueString.substring(
                  item.answer[0].valueString.indexOf('-') + 1
                );
                result = result.substring(0, result.indexOf('-'));
              }
            } else {
              result = item.answer[0].valueString;
            }
          }
        }
      });
    }
    return result;
  }

  getLinkValueFromObject2(serviceRequestObj, text: string): string {
    const result = '-';
    if (serviceRequestObj.item) {
    }
    return result;
  }

  getClientName(servReqobj) {
    let result = '-';
    if (
      servReqobj.questionnaire &&
      servReqobj.questionnaire.reference === 'Questionnaire/TEST1'
    ) {
      if (servReqobj.subject && servReqobj.subject.display) {
        result = servReqobj.subject.display;
      }
    }
    if (
      servReqobj.questionnaire &&
      servReqobj.questionnaire.reference === 'Questionnaire/1953'
    ) {
      // console.log(servReqobj.item);
      // servReqobj.item.forEach(element => {
      //   if (element.text === 'Name of the Requester') {
      //     result = (element.answer[0].valueString);
      //   }
      // });
      result = '-';
    }
    return result;
  }
}
