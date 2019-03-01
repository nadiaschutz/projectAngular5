import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

import { AudiogramService } from '../../../service/audiogram.service';
import { UtilService } from '../../../service/util.service';

import * as moment from 'moment';

@Component({
  selector: 'app-audiogram',
  templateUrl: './audiogram.component.html',
  styleUrls: ['./audiogram.component.scss']
})
export class AudiogramComponent implements OnInit {
  private eocId: any;
  private eoc: any;
  private patient: any;
  private serviceRequest: any;  // qr where identifer === 'servreq'

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

  redirectToNewAudiogram(){
    this.router.navigateByUrl('/staff/audiogram/new/' + this.eocId);
  }

  redirectToWorkSceen(){
    // todo: set eoc id in local storage just in case
    this.router.navigateByUrl('/staff/work-screen');
  }
}
