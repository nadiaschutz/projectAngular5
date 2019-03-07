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
  private serviceRequest: any;
    observations: any = [];
    questionnaireResponse: any = [];

    // qr where identifer === 'servreq'

  constructor(private route: ActivatedRoute,
              private router: Router,
              private audiogramService: AudiogramService,
              private utilService: UtilService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.eocId = params['eocId'];
      // console.log("this.episodeOfCareId", this.eocId);
        //get all EOC

        this.audiogramService.getAllEOC(this.eocId).subscribe(bundle => {
            // console.log(bundle);
            if (bundle && bundle['entry'] && Array.isArray(bundle['entry']) && bundle['entry'].length > 0) {
                bundle['entry'].map(item => {
                  const resource = item.resource;
                  if (resource.resourceType === 'Observation') {
                    this.observations.push(resource);
                  }
                  if (resource.resourceType === 'QuestionnaireResponse') {
                    this.questionnaireResponse.push(resource);
                  }

                });
                console.log("this.observations",this.observations);
                console.log("this.questionnaireResponse",this.questionnaireResponse);
            }
        });




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

  getDateMMMDDYYYY(date){
    return moment(date).format('MMM DD YYYY');
  }

  getBaseLineFound(category){
    const found = category.some(data => {return data.text === 'Baseline'})
    if (found) {
     return 'Yes'
    } else {
      return 'No'
    }
  }

    navigateToAudiogramDetail(observationId: any){
      this.router.navigate(['/staff/audiogram/detail/' + this.eocId , { observationId : observationId }]);
    }

    getSERVREQ(observation){
      let filterdQuestionnaireResponse;
      if (this.questionnaireResponse && this.questionnaireResponse.length > 0) {
         filterdQuestionnaireResponse = this.questionnaireResponse.filter(data => {
           if ((data.identifier.value === 'SERVREQ') &&  (data.context.reference === observation.context.reference)) {
              return data;
           }
         });
       }
       let serverq: any;
       if(filterdQuestionnaireResponse && filterdQuestionnaireResponse.length > 0){
        serverq = filterdQuestionnaireResponse[0].id;
       }
       return serverq;
    }
}
