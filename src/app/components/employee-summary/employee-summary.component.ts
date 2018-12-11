import { Component, OnInit } from '@angular/core';

import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';

import { Router } from '@angular/router';
import { QrequestService } from 'src/app/service/qrequest.service';

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

  jobTitle;

  constructor(

    private userService: UserService,
    private patientService: PatientService,
    private router: Router,
    private qrequestService: QrequestService,

  ) { }

  ngOnInit() {


    this.id = this.userService.returnSelectedID();
    this.userService.getEmployeeSummaryID(this.id);
    if (this.id) {
      this.patientService.getPatientDataByID(this.id).subscribe(
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
    
    this.selected = data;
    console.log(this.selected);

    

    if (this.selected.extension) {
      this.selected.extension.forEach(item => {
        if (item.url === 'https://bcip.smilecdr.com/fhir/dependentlink') {
          this.linkID = item.valueString;
        }

        if (item.url === 'https://bcip.smilecdr.com/fhir/jobtile') {
          this.jobTitle = item.valueString;
        }

        if (item.url === 'https://bcip.smilecdr.com/fhir/dependentlink') {
          this.linkID = item.valueString;
        }

        if (item.url === 'https://bcip.smilecdr.com/fhir/dependentlink') {
          this.linkID = item.valueString;
        }

        if (item.url === 'https://bcip.smilecdr.com/fhir/dependentlink') {
          this.linkID = item.valueString;
        }

        if (item.url === 'https://bcip.smilecdr.com/fhir/dependentlink') {
          this.linkID = item.valueString;
        }
      });

    }


    this.patientService.getPatientByLinkID(this.linkID).subscribe(
      dataPatient => this.populateDependentArray(dataPatient),
      error => this.handleError(error)
    );

    this.qrequestService.getServReqForClient(this.id).subscribe(
      dataSerReq => this.getServReqData(dataSerReq),
      error => this.getServReqDataError(error)
    );

  }

  selectedPatient(event: any) {
    console.log(event.target.value);
  }

  addDependent() {
    this.router.navigateByUrl('/dependentform');
  }

  newServiceRequest() {
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

    for (const value of this.selected.extension) {
      if (value.valueString === 'Dependent') {
          data.entry.forEach(element => {
            const individualEntry = element.resource;
            for (const extension of individualEntry.extension) {
              if (extension.valueString === 'Employee') {
                this.dependentArray.push(individualEntry);
              }
            }
          });
      }
    }
    if (data.entry) {
      data.entry.forEach(element => {
        const individualEntry = element.resource;
        for (const extension of individualEntry.extension) {
          if (extension.valueString === 'Dependent') {
            this.dependentArray.push(individualEntry);
          }
        }
      });
    }

  }

  // checkEmployeeType() {
  //   for (const extension of this.selected.extension) {
  //     if (extension.url === 'https://bcip.smilecdr.com/fhir/employeetype' && extension.valueString === 'Employee') {
  //       this.employeetype = true;
  //       console.log(this.employeetype);
  //     } else {
  //       this.employeetype = false;
  //       console.log(this.employeetype);

  //     }
  //   }
  // }




  getServReqData(data) {
    console.log(data.entry);
    if (data.entry) {
      this.servceRequestDatas = data.entry;
    }
  }

  getServReqDataError(error) {
    console.log(error);
  }


  navigateToSummary(servReqObj) {
    this.userService.saveSelectedServiceRequestID(servReqObj['resource']['id']);
    this.router.navigateByUrl('service-request-summary');
  }


  getServiceType(serviceRequestObj): string {
    let result = '-';
    console.log(serviceRequestObj);
    // console.log(serviceRequestObj.questionnaire.reference);
    if (serviceRequestObj.resource.item) {
      console.log(serviceRequestObj.resource.item);
        serviceRequestObj.resource.item.forEach(item => {
          if (item.text === 'PSOHP Service') {
            if (item['answer']) {
              result = item.answer[0].valueString.substring(item.answer[0].valueString.indexOf('(') + 1, item.answer[0].valueString.length);
              result = result.substring(0, result.length - 1);
              console.log(result);
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

}
