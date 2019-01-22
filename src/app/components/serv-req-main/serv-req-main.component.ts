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

  statusArr = ['in-progress', 'Waiting', 'Action Required', 'Cancelled', 'Suspended', 'Closed'];
  regionArr = ['Atlantic', 'Quebec', 'NCR', 'Ontario', 'Prairies', 'Pacific'];
  departmentArr = [
    'Agriculture and Agri-Foods Canada (AAFC)',
    'Canada Border Services Agency (CBSA)',
    'Canadian Coast Guard (CCG)',
    'Canadian Grain Commission (CGC)',
    'Canadian Heritage (PCH)',
    'Canadian Northern Economic Development Agency (CanNor)',
    'Canadian Space Agency (CSA)',
    'Communications Research Centre Canada (CRC)',
    'Correctional Service Canada (CSC)',
    'Defence Research and Development Canada (DRDC)',
    'Department of Finance Canada (FIN)',
    'Department of Justice Canada (JC)',
    'Employment and Social Development Canada (ESDC)',
    'Environment and Climate Change Canada (ECCC)',
    'Fisheries and Oceans Canada (DFO)',
    'Global Affairs Canada (GAC)',
    'Health Canada (HC)',
    'Immigration, Refugees and Citizenship Canada (IRCC)',
    'Indigenous and Northern Affairs Canada (INAC)',
    'Innovation, Science and Economic Development Canada (ISEDC)',
    'National Defence (DND)',
    'Natural Resources Canada (NRCan)',
    'Privy Council Office (PCO)',
    'Public Health Agency of Canada (PHAC)',
    'Public Prosecution Service of Canada (PPSC)',
    'Public Safety Canada (PSC)',
    'Public Services and Procurement Canada (PSPC)',
    'Royal Canadian Mounted Police (RCMP)',
    'Service Canada (SC)(ServCan)',
    'Shared Services Canada (SSC)',
    'Statistics Canada (StatCan)',
    'Transport Canada (TC)',
    'Transportation Safety Board of Canada (TSB)',
    'Treasurer Board of Canada Secretariat (TBS)',
    'Veterans Affairs Canada (VAC)',
    'Administrative Tribunals Support Service of Canada (ATSSC)',
    'Atlantic Canada Opportunities Agency (ACOA)',
    'Canada Economic Development for Quebec regions (CED)',
    'Canada Industrial Relations Board (CIRB)',
    'Canada School of Public Service (CSPS)',
    'Canadian Dairy Commission (CDC)',
    'Canadian Radio-television & Telecommunication Commission (CTRC)(CRTC)',
    'Canadian Transportation Agency (CTA)',
    'International Joint Commission (IJC)',
    'Office of the Chief Electoral Officer of Canada (CEO)',
    'Office of the Commissioner for Federal Judicial Affairs (FJA)',
    'Office of the Privacy Commissioner of Canada (OPC)',
    'Office of the Registrar of the Supreme Court of Canada (ORSCC)',
    'Office of the Secretary to the Governor General (OSGG)',
    'Public Service Commission of Canada (PSC)',
    'Status of Woman Canada (SWC)',
    'Canadian Environmental Assessment Agency (CEAA)',
    'Canadian Human Rights Commission (CHRC)',
    'Canadian Intellectual Property Office (CIPO)',
    'Canadian International Trade Tribunal (CITT)',
    'Courts Administration Service (CAS)',
    'Farm Products Council of Canada (FPCC)',
    'Federal Economic Development Agency for Southern Ontario (FedDev Ontario)',
    'Immigration and Refugee Board of Canada (IRB)',
    'Infrastructure Canada (INFC)',
    'Library and Archive Canada (LAC)',
    'Military Grievance External Review Committee (MGERC)',
    'Office of the Commissioner of Official Languages (OCOL)',
    'Office of the Information Commissioner of Canada (OIC)',
    'Office of the Public Sector Integrity Commissioner (PSIC)',
    'Parole Board of Canada (PBC)',
    'Patented Medicine Prices Review Board (PMPRB)',
    'Translation Bureau (SVC)',
    'Western Economic Diversification Canada (WD)',
    'Public Service Occupational Health Program (PSOHP)'
  ];


  // comes from the responce object
  region: string = null;
  regionString;
  departmentString;
  clientDepartment: string = null;

  servRequests = [];
  servceRequestDatas = [];

  myString;
  str = null;
  private arrOfVar = [this.givenName, this.familyName, this.serviceRequestId, this.dateOfBirth, this.status, this.date];

  constructor(
    private oauthService: OAuthService,
    private httpClient: HttpClient,
    private qrequestService: QrequestService,
    private patientService: PatientService,
    private utilService: UtilService,
    private router: Router
  ) { }

  ngOnInit() {
    this.qrequestService.getData('').subscribe(
      data => this.handleSuccessAll(data),
      error => this.handleErrorAll(error)
    );
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
      this.qrequestService.getData(this.str).subscribe(
        data => this.handleSuccess(data),
        error => this.handleError(error)
      );
    } else if (!this.str && (this.region || this.clientDepartment)) {
      this.qrequestService.getData('').subscribe(
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
        data.entry.forEach(element => {
          this.servRequests.push(element.resource);
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
      console.log(eachEntry);
      eachEntry.resource.item.forEach(item => {
        if (this.region && this.clientDepartment) {
          console.log('fix me');
        } else if (this.region && !this.clientDepartment) {
          if (this.region && item.text === 'Regional Office for Processing') {
            regionAndClientDepartmentMatches = this.checkStringMatches(item, this.region, regionAndClientDepartmentMatches);
          } else {
            return '-';
          }
        } else if (this.clientDepartment && !this.region) {
          if (this.clientDepartment && item.text === 'Submitting Department') {
            regionAndClientDepartmentMatches = this.checkStringMatches(item, this.clientDepartment, regionAndClientDepartmentMatches);

          } else {
            return '-';
          }
        }

      });
      if (regionAndClientDepartmentMatches) {
        console.log('checkign SR object', this.servRequests);
        console.log('5', regionAndClientDepartmentMatches);
        this.servRequests.push(eachEntry.resource);
      }
    }
    );
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
      if (serviceRequestObj.questionnaire && serviceRequestObj.questionnaire.reference === 'Questionnaire/1953') {
        serviceRequestObj.item.forEach(item => {
          if (item.text === 'PSOHP Service') {
            if (item['answer']) {
              result = item.answer[0].valueString.substring(item.answer[0].valueString.indexOf('(') + 1, item.answer[0].valueString.length);
              result = result.substring(0, result.length - 1);
            }
          }

        });
      } else {
        serviceRequestObj.item.forEach(item => {
          if (item.text === 'PSOHP Service') {
            if (item['answer']) {
              result = item.answer[0].valueString.substring(item.answer[0].valueString.indexOf('(') + 1, item.answer[0].valueString.length);
              result = result.substring(0, result.length - 1);
            }
          }

        });
      }
    }
    return result;
  }



  getAssessmentType(serviceRequestObj): string {

    if (serviceRequestObj.questionnaire && serviceRequestObj.questionnaire.reference === 'Questionnaire/TEST1') {
      return this.getLinkValueFromObject(serviceRequestObj, 'PSOHP Service', 2);
    }
    if (serviceRequestObj.questionnaire && serviceRequestObj.questionnaire.reference === 'Questionnaire/1953') {
      return '-';
    }
  }
  getRegion(serviceRequestObj): string {
    if (serviceRequestObj.questionnaire && serviceRequestObj.questionnaire.reference === 'Questionnaire/TEST1') {
      return this.getLinkValueFromObject(serviceRequestObj, 'Regional Office for Processing', 1);
    }
    if (serviceRequestObj.questionnaire && serviceRequestObj.questionnaire.reference === 'Questionnaire/1953') {
      return '-';
    }
  }
  getCreatedBy(serviceRequestObj) {

    if (serviceRequestObj.questionnaire && serviceRequestObj.questionnaire.reference === 'Questionnaire/TEST1') {
      return this.getLinkValueFromObject(serviceRequestObj, 'Created By', 1);
    }
    if (serviceRequestObj.questionnaire && serviceRequestObj.questionnaire.reference === 'Questionnaire/1953') {
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
                result = item.answer[0].valueString.substring(0, item.answer[0].valueString.indexOf('-'));
              }
              if (dashNum === 2) {
                result = item.answer[0].valueString.substring(item.answer[0].valueString.indexOf('-') + 1);
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
    if (servReqobj.questionnaire && servReqobj.questionnaire.reference === 'Questionnaire/TEST1') {
      if (servReqobj.subject && servReqobj.subject.display) {
        result = servReqobj.subject.display;
      }
    }
    if (servReqobj.questionnaire && servReqobj.questionnaire.reference === 'Questionnaire/1953') {
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
