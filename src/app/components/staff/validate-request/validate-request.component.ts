import { Component, OnInit, OnDestroy } from '@angular/core';
import { StaffService } from '../../../service/staff.service';
import { UtilService } from '../../../service/util.service';
import { UserService } from '../../../service/user.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as FHIR from '../../../interface/FHIR';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { formatDate } from '@angular/common';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-validate-request',
  templateUrl: './validate-request.component.html',
  styleUrls: ['./validate-request.component.scss']
})
export class ValidateRequestComponent implements OnInit {

  constructor(
    private staffService: StaffService,
    private utilService: UtilService,
    private formBuilder: FormBuilder,
    private oAuthService: OAuthService,
    private userService: UserService,
    private router: Router
  ) { }

  serviceRequestSummary;
  validateFormGroup: FormGroup;

  onSuccess = false;


  ngOnInit() {


    this.processServiceRequestForSummary();
  }


  returnEoC() {
    return sessionStorage.getItem('selectedEpisodeId');
  }
  processServiceRequestForSummary() {
    const temp = {};
    this.staffService
      .getAnyFHIRObjectByCustomQuery(
        'QuestionnaireResponse?identifier=SERVREQ&context=' +
          this.returnEoC()
      )
      .subscribe(
        questionnaireFound => {
          if (questionnaireFound) {
            if (questionnaireFound['entry']) {
              for (const currentEntry of questionnaireFound['entry']) {
                const individualEntry = currentEntry['resource'];
                temp['serviceId'] = individualEntry['id'];
                for (const item of individualEntry['item']) {
                  if (item['text'].toLowerCase().includes('regional office')) {
                    if (item['answer']) {
                      temp['region'] = item['answer'][0]['valueString'];
                    }
                  }
                }
                this.staffService
                  .getAnyFHIRObjectByCustomQuery(
                    individualEntry['subject']['reference']
                  )
                  .subscribe(patient => {
                    if (patient) {
                      temp['name'] = this.utilService.getNameFromResource(
                        patient
                      );
                      temp['dob'] = patient['birthDate'];
                      if (patient['identifier']) {
                        temp['pri'] = patient['identifier'][0]['value'];
                      }
                      for (const extension of patient['extension']) {
                        if (
                          extension['url'] ===
                          'https://bcip.smilecdr.com/fhir/workplace'
                        ) {
                          temp['employeeDept'] = extension['valueString'];
                        }
                        if (
                          extension['url'] ===
                          'https://bcip.smilecdr.com/fhir/branch'
                        ) {
                          temp['employeeBranch'] = extension['valueString'];
                        }
                      }
                      this.serviceRequestSummary = temp;
                    }
                  });
              }
            }
          }
        },
        error => {
          console.log(error);
        }
      );
  }

  viewDetailedContext() {
    this.router.navigateByUrl('/staff/work-screen');
  }
}
