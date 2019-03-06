import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {AudiogramService} from "../../../service/audiogram.service";
import {UtilService} from "../../../service/util.service";
import * as moment from 'moment';
@Component({
  selector: 'app-audiogram-detail',
  templateUrl: './audiogram-detail.component.html',
  styleUrls: ['./audiogram-detail.component.scss']
})
export class AudiogramDetailComponent implements OnInit {
     eocId: any;
     eoc: any;
     patient: any;
     serviceRequest: any;
    selectedBaseLine: any;
    selectedHearingLoss: any;
    observationId: any;
    observation: any;
  constructor(private route: ActivatedRoute,
              private router: Router,
              private formBuilder: FormBuilder,
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

          });
      });

      this.route.params.subscribe(params => {
          this.observationId = params['observationId'];

          this.audiogramService.getObservationById(this.observationId).subscribe(bundle => {
               this.observation = bundle['entry'];
               this.observation = this.observation.filter(item =>{
                 if(item.resource.id ===  this.observationId){
                   return item;
                 }
               });
               if(this.observation && this.observation.length > 0){
                 this.observation = this.observation[0];
                 this.selectedBaseLine =  this.getBaseLineFound(this.observation.resource.category);
                 this.selectedHearingLoss =  this.getHearingLossFound(this.observation.resource.category);
               }

               console.log("this.observation....",this.observation)
          })

      });
  }


    calculateAge(dateOfBirth) {
        // expects syntax == '1996-08-13' (YYYY - MM - DD)
        return moment().diff(dateOfBirth, 'years');
    }

    getBaseLineFound(category){
        const found = category.some(data => {return data.text === 'Baseline'})
        if(found){
            return 'yes'
        }else {
            return 'no'
        }
    }

    getHearingLossFound(category){
        const foundLeft = category.some(data => {return data.text === 'Left'})
        if(foundLeft){
            return 'left';
        }
        const foundRight = category.some(data => {return data.text === 'Right'})
        if(foundRight){
            return 'right';
        }
    }

    getDateMMMDDYYYY(date){
        return  moment(date).format('MMM DD YYYY');
    }

    getLocationOfTest(extension){
        let filterdExtension: any;
      if(extension && extension.length > 0){

          filterdExtension =  extension.filter(item =>{
             if(item.url === 'test-location'){
              return item.valueReference.reference
            }
          })[0]
      }
      if(filterdExtension && filterdExtension.valueReference){
          let locationOfTest = filterdExtension.valueReference.reference;

          return locationOfTest
      }
    }

    getExaminId(extension){
        let filterdExtension: any;
        if(extension && extension.length > 0){

            filterdExtension =  extension.filter(item =>{
                if(item.url === 'examiner'){
                    return item
                }
            })[0]
        }
        let examiner ;
        if(filterdExtension){
          examiner = filterdExtension.valueString;
        }

        return examiner
    }

    getComponentValue(code){
      let filterdComponent: any
      if(this.observation.resource && this.observation.resource.component && (this.observation.resource.component.length > 0)){
        filterdComponent = this.observation.resource.component.filter(item =>{
          if(item && item.code && item.code.coding && (item.code.coding.length > 0) && (item.code.coding[0].code === code) ){
            return item
          }
        });
        let componentValue;
        if(filterdComponent && filterdComponent.length > 0){
          componentValue = filterdComponent[0].valueString;
        }
        return componentValue

      }


    }

    redirectToAudiogram(){
        this.router.navigateByUrl('/staff/audiogram/' + this.eocId);
    }


}
