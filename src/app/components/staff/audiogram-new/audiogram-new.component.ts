import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { BsDatepickerConfig } from "ngx-bootstrap";

import { AudiogramService } from '../../../service/audiogram.service';
import { UtilService } from '../../../service/util.service';

import * as moment from 'moment';

@Component({
  selector: 'app-audiogram-new',
  templateUrl: './audiogram-new.component.html',
  styleUrls: ['./audiogram-new.component.scss']
})
export class AudiogramNewComponent implements OnInit {
  selectedHearingLoss: any;
  selectedBaseLine: any;
  datePickerConfig: Partial<BsDatepickerConfig>;
  formValue = {
    dateOfTest : null,
    locationOfTest : null,
    devSerial: null,
    devModel: null,
    devCelibrationDate: null,
    examineID: null,
    baseLine: null,
    HearingLose: null,
    leftEar : {
      k0_5: null,
      k1: null,
      k2: null,
      k3: null,
      k4: null,
      k6: null,
      k8: null,
    },
    rightEar : {
      k0_5: null,
      k1: null,
      k2: null,
      k3: null,
      k4: null,
      k6: null,
      k8: null,
    }
  };
  private eocId: any;
  private eoc: any;
  private patient: any;
  private serviceRequest: any;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private audiogramService: AudiogramService,
              private utilService: UtilService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.eocId = params['eocId'];
      // console.log("this.episodeOfCareId", this.eocId);

      this.audiogramService.getEOCById(this.eocId).subscribe(bundle => {
        // console.log(bundle);
        if (bundle && bundle['entry'] && Array.isArray(bundle['entry']) && bundle['entry'].length > 0) {
          bundle['entry'].map(item => {
            const resource = item.resource;
            if (resource.resourceType === 'EpisodeOfCare') {
              this.eoc = resource;
            } else if (resource.resourceType === 'Patient') {
              this.patient = this.utilService.getPatientJsonObjectFromPatientFhirObject(resource);
            } else if (resource.resourceType === 'QuestionnaireResponse') {
              this.serviceRequest = resource; // qr
            }
          });
        }

        console.log('eoc =>', this.eoc);
        console.log('patient =>', this.patient);
      });
    });
  }

  calculateAge(dateOfBirth) {
    // expects syntax == '1996-08-13' (YYYY - MM - DD)
    return moment().diff(dateOfBirth, 'years');
  }

  redirectToAudiogram(){
    this.router.navigateByUrl('/staff/audiogram/' + this.eocId);
  }

  selectHearingLoss(type){
    this.selectedHearingLoss = type;
    this.formValue.HearingLose = type;
  }

  selectBaseLine(type){
    this.selectedBaseLine = type;
    this.formValue.baseLine = type;
  }

  saveAudiogram(){
    console.log(this.formValue);
    this.router.navigateByUrl('/staff/audiogram/' + this.eocId);
  }

}
