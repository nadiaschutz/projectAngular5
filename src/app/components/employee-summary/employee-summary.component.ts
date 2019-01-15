import { Component, OnInit } from '@angular/core';

import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';
import { Router } from '@angular/router';
import { QrequestService } from 'src/app/service/qrequest.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-employee-summary',
  templateUrl: './employee-summary.component.html',
  styleUrls: ['./employee-summary.component.scss']
})
export class EmployeeSummaryComponent implements OnInit {
  id = '';
  // linkID = 'a44109ad-e58b-47cd-b348-7556e4d2c117';
  linkID = '';
  selected;
  employeetype;
  dependentArray = [];
  servceRequestDatas = [];
  cursorClassEnables;

  jobTitle;

  constructor(
    private userService: UserService,
    private patientService: PatientService,
    private router: Router,
    private qrequestService: QrequestService
  ) {}

  ngOnInit() {
    this.id = this.userService.returnSelectedID();
    this.userService.getEmployeeSummaryID(this.id);
    if (this.id) {
      this.patientService
        .getPatientDataByID(this.id)
        .subscribe(
          data => this.populatePatientArray(data),
          error => this.handleError(error)
        );
    } else if (!this.id) {
      this.router.navigateByUrl('/dashboard');
    }

    // this.setDependentLinkID();
  }

  populatePatientArray(data) {
    this.linkID = '';
    // this.selected = data;
    const temp = {};

    temp['given'] = data['name'][0]['given'][0];
    temp['family'] = data['name'][0]['family'];
    temp['dob'] = data['birthDate'];
    temp['identifier'] = {};
    if (data['identifier']) {
      data['identifier'].forEach(identifier => {
        temp['identifier']['use'] = identifier['use'];
        temp['identifier']['system'] = identifier['system'];
        temp['identifier']['value'] = identifier['value'];
      });
    }
    data['extension'].forEach(extension => {
      if (extension['url'] === 'https://bcip.smilecdr.com/fhir/workplace') {
        temp['department'] = {};
        temp['department']['url'] = extension.url;
        temp['department']['valueString'] = extension.valueString;
      }
    });
    data['extension'].forEach(extension => {
      if (extension['url'] === 'https://bcip.smilecdr.com/fhir/jobtile') {
        temp['jobtitle'] = {};
        temp['jobtitle']['url'] = extension.url;
        temp['jobtitle']['valueString'] = extension.valueString;
      }
    });
    data['extension'].forEach(extension => {
      if (extension['url'] === 'https://bcip.smilecdr.com/fhir/employeetype') {
        temp['employeeType'] = {};
        temp['employeeType']['url'] = extension.url;
        temp['employeeType']['valueString'] = extension.valueString;
      }
    });
    data['extension'].forEach(extension => {
      if (extension['url'] === 'https://bcip.smilecdr.com/fhir/branch') {
        temp['branch'] = {};
        temp['branch']['url'] = extension.url;
        temp['branch']['valueString'] = extension.valueString;
      }
    });
    data['extension'].forEach(extension => {
      if (extension['url'] === 'https://bcip.smilecdr.com/fhir/dependentlink') {
        temp['linkID'] = {};
        temp['linkID']['url'] = extension.url;
        temp['linkID']['valueString'] = extension.valueString;
      }
    });
    data['extension'].forEach(extension => {
      if (
        extension['url'] === 'https://bcip.smilecdr.com/fhir/crossreferenceone'
      ) {
        temp['crossref1'] = {};
        temp['crossref1']['url'] = extension.url;
        temp['crossref1']['valueString'] = extension.valueString;
      }
    });
    data['extension'].forEach(extension => {
      if (
        extension['url'] === 'https://bcip.smilecdr.com/fhir/crossreferencetwo'
      ) {
        temp['crossref2'] = {};
        temp['crossref2']['url'] = extension.url;
        temp['crossref2']['valueString'] = extension.valueString;
      }
    });

    temp['telecom'] = [];
    temp['address'] = [];

    data['address'].forEach(address => {
      temp['address'].push(address);
    });

    temp['communication'] = data['communication'];

    data['telecom'].forEach(telecom => {
      temp['telecom'].push(telecom);
    });
    temp['telecom'] = data['telecom'];
    this.selected = temp;

    this.patientService
      .getPatientByLinkID(this.selected['linkID']['valueString'])
      .subscribe(
        dataPatient => this.populateDependentArray(dataPatient),
        error => this.handleError(error)
      );

    this.qrequestService
      .getServReqForClient(this.id)
      .subscribe(
        dataSerReq => this.getServReqData(dataSerReq),
        error => this.getServReqDataError(error)
      );
  }

  selectedPatient(event: any) {
    console.log(event.target.value);
  }

  addDependent() {
    // window.scroll(0, 0);
    this.router.navigateByUrl('/dependentform');
  }

  newServiceRequest() {
    // window.scroll(0, 0);
    this.router.navigate(['/newservicerequest']);
  }
  handleError(error) {
    console.log(error);
  }

  backToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  populateDependentArray(data) {
    this.dependentArray = [];
    if (this.selected['employeeType']['valueString'] === 'Employee') {

      data.entry.forEach(element => {
        const individualEntry = element.resource;
        for (const extensions of individualEntry.extension) {
          if (extensions.valueString === 'Dependent') {
            console.log('yup, theres a dependent');
            const temp = {};
            temp['id'] = individualEntry['id'];
            temp['given'] = individualEntry['name'][0]['given'][0];
            temp['family'] = individualEntry['name'][0]['family'];
            temp['dob'] = individualEntry['birthDate'];
            temp['identifier'] = {};
            if (individualEntry['identifer']) {
              individualEntry['identifier'].forEach(identifier => {
                temp['identifier']['use'] = identifier['use'];
                temp['identifier']['system'] = identifier['system'];
                temp['identifier']['value'] = identifier['value'];
              });
            }
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] === 'https://bcip.smilecdr.com/fhir/workplace'
              ) {
                temp['department'] = {};
                temp['department']['url'] = extension.url;
                temp['department']['valueString'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] === 'https://bcip.smilecdr.com/fhir/jobtile'
              ) {
                temp['jobtitle'] = {};
                temp['jobtitle']['url'] = extension.url;
                temp['jobtitle']['valueString'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] ===
                'https://bcip.smilecdr.com/fhir/employeetype'
              ) {
                temp['employeeType'] = {};
                temp['employeeType']['url'] = extension.url;
                temp['employeeType']['valueString'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] === 'https://bcip.smilecdr.com/fhir/branch'
              ) {
                temp['branch'] = {};
                temp['branch']['url'] = extension.url;
                temp['branch']['valueString'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] ===
                'https://bcip.smilecdr.com/fhir/dependentlink'
              ) {
                temp['linkID'] = {};
                temp['linkID']['url'] = extension.url;
                temp['linkID']['valueString'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] ===
                'https://bcip.smilecdr.com/fhir/crossreferenceone'
              ) {
                temp['crossref1'] = {};
                temp['crossref1']['url'] = extension.url;
                temp['crossref1']['valueString'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] ===
                'https://bcip.smilecdr.com/fhir/crossreferencetwo'
              ) {
                temp['crossref2'] = {};
                temp['crossref2']['url'] = extension.url;
                temp['crossref2']['valueString'] = extension.valueString;
              }
            });

            temp['telecom'] = [];
            temp['address'] = [];

            individualEntry['address'].forEach(address => {
              individualEntry['address'].push(address);
            });

            temp['communication'] = individualEntry['communication'];

            individualEntry['telecom'].forEach(telecom => {
              temp['telecom'].push(telecom);
            });
            temp['telecom'] = individualEntry['telecom'];
            console.log(temp);
            this.dependentArray.push(temp);
          }
        }
      });
    } else {
      this.dependentArray = [];

      data.entry.forEach(element => {
        const individualEntry = element.resource;
        for (const extensions of individualEntry.extension) {
          if (extensions.valueString === 'Employee') {
            const temp = {};
            temp['id'] = individualEntry['id'];
            temp['given'] = individualEntry['name'][0]['given'][0];
            temp['family'] = individualEntry['name'][0]['family'];
            temp['dob'] = individualEntry['birthDate'];
            temp['identifier'] = {};
            if (individualEntry['identifer']) {
              individualEntry['identifier'].forEach(identifier => {
                temp['identifier']['use'] = identifier['use'];
                temp['identifier']['system'] = identifier['system'];
                temp['identifier']['value'] = identifier['value'];
              });
            }
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] === 'https://bcip.smilecdr.com/fhir/workplace'
              ) {
                temp['department'] = {};
                temp['department']['url'] = extension.url;
                temp['department']['valueString'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] === 'https://bcip.smilecdr.com/fhir/jobtile'
              ) {
                temp['jobtitle'] = {};
                temp['jobtitle']['url'] = extension.url;
                temp['jobtitle']['valueString'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] ===
                'https://bcip.smilecdr.com/fhir/employeetype'
              ) {
                temp['employeeType'] = {};
                temp['employeeType']['url'] = extension.url;
                temp['employeeType']['valueString'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] === 'https://bcip.smilecdr.com/fhir/branch'
              ) {
                temp['branch'] = {};
                temp['branch']['url'] = extension.url;
                temp['branch']['valueString'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] ===
                'https://bcip.smilecdr.com/fhir/dependentlink'
              ) {
                temp['linkID'] = {};
                temp['linkID']['url'] = extension.url;
                temp['linkID']['valueString'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] ===
                'https://bcip.smilecdr.com/fhir/crossreferenceone'
              ) {
                temp['crossref1'] = {};
                temp['crossref1']['url'] = extension.url;
                temp['crossref1']['valueString'] = extension.valueString;
              }
            });
            individualEntry['extension'].forEach(extension => {
              if (
                extension['url'] ===
                'https://bcip.smilecdr.com/fhir/crossreferencetwo'
              ) {
                temp['crossref2'] = {};
                temp['crossref2']['url'] = extension.url;
                temp['crossref2']['valueString'] = extension.valueString;
              }
            });

            temp['telecom'] = [];
            temp['address'] = [];

            individualEntry['address'].forEach(address => {
              individualEntry['address'].push(address);
            });

            temp['communication'] = individualEntry['communication'];

            individualEntry['telecom'].forEach(telecom => {
              temp['telecom'].push(telecom);
            });
            temp['telecom'] = individualEntry['telecom'];
            console.log('Dependent is relate to:', temp);
            this.dependentArray.push(temp);
          }
        }
      });
    }
    // if (data.entry) {
    //   data.entry.forEach(element => {
    //     const individualEntry = element.resource;
    //     for (const extension of individualEntry.extension) {
    //       if (extension.valueString === 'Dependent') {
    //         this.dependentArray.push(individualEntry);
    //       }
    //     }
    //   });
    // }
  }

  routeToSummary(data) {
    this.selected = '';
    this.dependentArray = [];
    this.id = data;
    this.userService.getSelectedID(data);
    this.patientService
        .getPatientDataByID(this.id)
        .subscribe(
          dataNew => this.populatePatientArray(dataNew),
          error => this.handleError(error)
        );
  }
  getServReqData(data) {
    console.log(data.entry);
    if (data.entry) {
      this.servceRequestDatas = data.entry;
    }
  }

  getServReqDataError(error) {
    console.log(error);
  }

  getServiceType(serviceRequestObj): string {
    let result = '-';
    // console.log(serviceRequestObj);
    // console.log(serviceRequestObj.questionnaire.reference);
    if (serviceRequestObj.resource.item) {
      // console.log(serviceRequestObj.resource.item);
      serviceRequestObj.resource.item.forEach(item => {
        if (item.text === 'PSOHP Service') {
          if (item['answer']) {
            result = item.answer[0].valueString.substring(
              item.answer[0].valueString.indexOf('(') + 1,
              item.answer[0].valueString.length
            );
            result = result.substring(0, result.length - 1);
            // console.log(result);
          }
        }
      });
    }
    return result;
  }

  getAssessmentType(serviceRequestObj): string {
    return this.getLinkValueFromObject(serviceRequestObj, 'PSOHP Service', 2);
  }

  getLinkValueFromObject(serviceRequestObj, text: string, dashNum): string {
    let result = '-';
    if (serviceRequestObj.resource.item) {
      serviceRequestObj.resource.item.forEach(item => {
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
}
