import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { QrequestService } from 'src/app/service/qrequest.service';
import { Router } from '@angular/router';
import { multicast } from 'rxjs/operators';
import { PatientService } from 'src/app/service/patient.service';
import { UtilService } from 'src/app/service/util.service';
import { FormsModule, FormBuilder } from '@angular/forms';
import { link } from 'fs';
import { UserService } from 'src/app/service/user.service';
import { formatDate } from '@angular/common';
import { ServRequest } from '../models/item.model';

// import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
// import { DatePipe } from '@angular/common';


import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { deLocale } from 'ngx-bootstrap/locale';
import { NullTemplateVisitor } from '@angular/compiler';
import { e } from '@angular/core/src/render3';

@Component({
  selector: 'app-serv-req-main',
  templateUrl: './serv-req-main.component.html',
  styleUrls: ['./serv-req-main.component.scss']
})
export class ServReqMainComponent implements OnInit {
  // QuestionnaireResponse?subject:Patient.name=Pughna&subject:Patient.given=Lasrt
  datePickerConfig: Partial<BsDatepickerConfig>;

  params = [];
  showParams = null;
  searchParamsToShow = [];
  doNotShowZeroMessage = true;

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

  // date = {
  //   prefix: 'authored=',
  //   data: null
  // };

  statusArr = [
    'In-Progress',
    'Waiting',
    'Action Required',
    'Cancelled',
    'Suspended',
    'Closed'
  ];
  regionArr = ['Atlantic', 'Quebec', 'NCR', 'Ontario', 'Prairies', 'Pacific'];
  departmentList = [];


  minDate: Date;
  maxDate: Date;

  currentUserDepartment;
  currentUserRole;
  // comes from the responce object
  region: string = null;
  departmentString;
  clientDepartment: string = null;

  servRequest: ServRequest = {
    id: null,
    date: null,
    PSOHP_service: null,
    assessmentType: null,
    department: null,
    region: null,
    createdBy: null,
    clientName: null,
    status: null
  };

  servRequests: ServRequest[];
  servRequestsArray = [];




  myString;
  str = null;
  private arrOfVar = [
    this.givenName,
    this.familyName,
    this.serviceRequestId,
    this.dateOfBirth,
    this.status
  ];

  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();

  constructor(
    private oauthService: OAuthService,
    private httpClient: HttpClient,
    private userService: UserService,
    private qrequestService: QrequestService,
    private patientService: PatientService,
    private utilService: UtilService,
    private router: Router,
    private fb: FormBuilder,
    private bsDatepickerConfig: BsDatepickerConfig,
  ) {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.minDate.setDate(this.minDate.getDate() - 43800);
    this.maxDate.setDate(this.maxDate.getDate());

  }

  ngOnInit() {
    // customizng datePicker
    this.datePickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'YYYY-MM-DD',
        showWeekNumbers: false
      });

    // Initializes the list of branches from our system
    this.userService
      .fetchAllDepartmentNames()
      .subscribe(
        data => this.populateDeptNames(data),
        error => this.handleError(error)
      );

    this.currentUserDepartment = sessionStorage.getItem('userDept');
    this.currentUserRole = sessionStorage.getItem('userRole');

    this.getAllData();
  }



  populateDeptNames(data: any) {
    data.entry.forEach(element => {
      this.departmentList.push(element['resource']['name']);
    });
  }

  // run on button 'refresh'
  refreshSearch() {
    location.reload();
  }

  setSelectedServiceRequestID(id) {
    sessionStorage.setItem('selectedServiceRequestID', id);
    this.router.navigateByUrl('/service-request-summary');
  }


  dataSearch() {
    this.searchParamsToShow = [];
    this.doNotShowZeroMessage = true;
    // this.showParams = null;


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
      this.qrequestService
        .getData(this.str)
        .subscribe(
          data => this.searchWithStr(data),
          error => this.handleError(error)
        );
    } else if (!this.str && (this.region || this.clientDepartment)) {
      this.getAllData();
    }

    this.searchParamsToShow.push(this.region);
    this.searchParamsToShow.push(this.clientDepartment);

    this.showSearchParamsOnZeroResults();
  }

  getAllData() {
    this.qrequestService
      .getData('')
      .subscribe(
        qData => this.handleSuccessAll(qData),
        error => this.handleError(error)
      );
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


  sorterFunction(colName) {
    this.servRequests = this.utilService.sortArray(colName, this.servRequests);
  }

  handleSuccessAll(data) {
    console.log(data);

    this.doNotShowZeroMessage = true;

    if (data.total === 0) {
      this.doNotShowZeroMessage = false;
    }


    if (data.entry) {

      if (this.region || this.clientDepartment) {
        this.filterRegionAndClientDepartment(data);
      } else {
        data.entry.forEach(element => {
          this.servRequestsArray.push(element.resource);
        });
        this.createServRequestsObject(this.servRequestsArray);
      }
    }

    this.resetSearchParams();
  }


  createServRequestsObject(data) {
    this.servRequests = data.map(el => ({
      ...this.servRequest,
      id: el.id,
      date: el.authored,
      PSOHP_service: this.getServiceType(el),
      assessmentType: this.getAssessmentType(el),
      department: this.getDepartment(el),
      region: this.getRegion(el),
      createdBy: this.getCreatedBy(el),
      clientName: this.checkIfSubject(el),
      status: el.status
    }
    ));
  }

  resetSearchParams() {
    this.region = null;
    this.clientDepartment = null;
    this.servRequestsArray = [];
    this.givenName.data = null;
    this.familyName.data = null;
    this.serviceRequestId.data = null;
    this.dateOfBirth.data = null;
    this.status.data = null;
    this.str = null;
  }



  searchWithStr(data) {
    this.doNotShowZeroMessage = true;
    this.servRequests = [];
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
    this.servRequests = [];
    this.servRequestsArray = [];
    let regionAndClientDepartmentMatches = true;

    let flag = false;
    let matches = false;
    const sortedDataArr = [];
    if (this.region || this.clientDepartment) {
      regionAndClientDepartmentMatches = false;
    }

    data.entry.forEach(eachEntry => {
      if (eachEntry['resource']['item']) {
        eachEntry.resource.item.forEach(item => {
          if (this.region && this.clientDepartment) {

            if (item.text === 'Regional Office for Processing') {
              flag = this.checkStringMatches(item, this.region);
            }

          } else if (this.region && !this.clientDepartment) {
            if (item.text === 'Regional Office for Processing') {
              regionAndClientDepartmentMatches = this.checkStringMatches(item, this.region);
            }

          } else if (this.clientDepartment && !this.region) {
            if (item.text === 'Submitting Department') {
              regionAndClientDepartmentMatches = this.checkStringMatches(item, this.clientDepartment);
            }

          }
        });
      }
      if (flag) {
        sortedDataArr.push(eachEntry);
      }

      if (regionAndClientDepartmentMatches) {
        this.servRequestsArray.push(eachEntry.resource);
        this.createServRequestsObject(this.servRequestsArray);
      }

    });

    if (sortedDataArr) {
      sortedDataArr.forEach(individItem => {
        individItem.resource.item.forEach(element => {
          if (element.text === 'Submitting Department') {
            matches = this.checkStringMatches(element, this.clientDepartment);
          }
        });
        if (matches) {
          this.servRequestsArray.push(individItem.resource);
          this.createServRequestsObject(this.servRequestsArray);
        }
      });

    }

    if (this.servRequestsArray.length === 0) {
      this.doNotShowZeroMessage = false;
    }
  }

  checkStringMatches(item, matchingItem) {

    let matchesBoolean = true;
    // remove anything after 1st dash
    let matchingString = item.answer[0].valueString.toLowerCase();
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

  handleError(error) {
    console.log(error);
  }

  getServiceType(serviceRequestObj): string {
    let result: any;
    result = '-';
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
        result = this.getAnswer('PSOHPSERV', serviceRequestObj);
        console.log(result);
      }
    }
    return result;
  }

  getDepartment(serviceRequestObj) {
    let result: any;
    result = '-';
    if (serviceRequestObj.item) {

      result = this.getAnswer('USERDEPT', serviceRequestObj);
      console.log(result);


    }

    return result;
  }


  getAssessmentType(serviceRequestObj) {
    let result: any;
    result = '-';
    if (
      serviceRequestObj.questionnaire &&
      serviceRequestObj.questionnaire.reference === 'Questionnaire/TEST4'
    ) {
      if (serviceRequestObj.item) {
        // return this.getLinkValueFromObject(serviceRequestObj, 'PSOHP Service', 2);
        result = this.getAnswer('ASSESTYPE', serviceRequestObj);
        console.log(result);

      } else {
        return result;
      }

    } else if (
      serviceRequestObj.questionnaire &&
      serviceRequestObj.questionnaire.reference === 'Questionnaire/1953'
    ) {
      return result;
    } else {
      return result;
    }
    return result;
  }


  getRegion(serviceRequestObj): string {
    let result: any;
    result = '-';
    if (
      serviceRequestObj.questionnaire &&
      serviceRequestObj.questionnaire.reference === 'Questionnaire/TEST4'
    ) {
      // return this.getLinkValueFromObject(
      //   serviceRequestObj,
      //   'Regional Office for Processing',
      //   1
      // );
      if (serviceRequestObj.item) {
        // serviceRequestObj.item.forEach(element => {
        //   if (element.linkId === 'USERDEPT') {
        //     result = element.answer[1].valueString;
        //   }
        // });

        result = this.getAnswer('REGOFFICE', serviceRequestObj);
        console.log(result);
      } else {
        return result;
      }

    }
    if (
      serviceRequestObj.questionnaire &&
      serviceRequestObj.questionnaire.reference === 'Questionnaire/1953'
    ) {
      return result;
    }
    return result;
  }
  getCreatedBy(serviceRequestObj) {
    let result: any;
    result = '-';
    if (
      serviceRequestObj.questionnaire &&
      serviceRequestObj.questionnaire.reference === 'Questionnaire/TEST4'
    ) {
      // result = this.getLinkValueFromObject(serviceRequestObj, 'Created By', 1);
      // serviceRequestObj.item.array.forEach(element => {
      //   if (element.linkId === 'AUTHOR') {
      //     result = element.answer[1].valueString;
      //   }
      // });
      console.log(this.getAnswer('AUTHOR', serviceRequestObj));
      return this.getAnswer('AUTHOR', serviceRequestObj);

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
                result = answer['valueString'];

              }
            });
          } else {
            return result;
          }
        }
      });
    }
    return result;
  }

  getAnswer(code, obj) {
    let result = '-';
    obj.item.forEach(element => {

      if (element.linkId === code) {
        result = element.answer[1].valueString;
        console.log('getItem', result);
      }
    });
    return result;
  }

  checkIfSubject(object: any) {
    if (object['subject']) {
      return object['subject']['display'];
    } else {
      return '-';
    }
  }

  // getLinkValueFromObject(serviceRequestObj, text: string, dashNum): string {
  //   let result = '-';
  //   if (serviceRequestObj.item) {
  //     serviceRequestObj.item.forEach(item => {
  //       if (item.text === text) {
  //         if (item['answer']) {
  //           if (item.answer[0].valueString.indexOf('-') > 0) {
  //             if (dashNum === 1) {
  //               result = item.answer[0].valueString.substring(
  //                 0,
  //                 item.answer[0].valueString.indexOf('-')
  //               );
  //             }
  //             if (dashNum === 2) {
  //               result = item.answer[0].valueString.substring(
  //                 item.answer[0].valueString.indexOf('-') + 1
  //               );
  //               result = result.substring(0, result.indexOf('-'));
  //             }
  //           } else {
  //             result = item.answer[0].valueString;
  //           }
  //         }
  //       }
  //     });
  //   }
  //   return result;
  // }

  // getLinkValueFromObject2(serviceRequestObj, text: string): string {
  //   const result = '-';
  //   if (serviceRequestObj.item) {
  //   }
  //   return result;
  // }

  getClientName(servReqobj) {
    let result = '-';
    if (
      servReqobj.questionnaire &&
      servReqobj.questionnaire.reference === 'Questionnaire/TEST4'
    ) {
      if (servReqobj.subject && servReqobj.subject.display) {
        result = servReqobj.subject.display;
      }
    }
    if (
      servReqobj.questionnaire &&
      servReqobj.questionnaire.reference === 'Questionnaire/1953'
    ) {
      result = '-';
    }
    return result;
  }
}
