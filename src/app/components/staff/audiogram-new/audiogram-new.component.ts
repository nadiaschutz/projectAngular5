import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { BsDatepickerConfig } from "ngx-bootstrap";

import { AudiogramService } from '../../../service/audiogram.service';
import { UtilService } from '../../../service/util.service';

import * as moment from 'moment';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import * as FHIR from '../../../interface/FHIR';

@Component({
  selector: 'app-audiogram-new',
  templateUrl: './audiogram-new.component.html',
  styleUrls: ['./audiogram-new.component.scss']
})
export class AudiogramNewComponent implements OnInit {
    audioGramFormGroup: FormGroup;
    DATE_FORMAT = 'YYYY-MM-DD';
  selectedHearingLoss = null;
  selectedBaseLine = null;
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
  locations: any;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private formBuilder: FormBuilder,
              private audiogramService: AudiogramService,
              private utilService: UtilService) {

      this.audioGramFormGroup = this.formBuilder.group({
          issued: new FormControl(''),
          locationOfTest: new FormControl(''),
          devSerial: new FormControl(''),
          devModel: new FormControl(''),
          devCelibrationDate: new FormControl(''),
          examineID: new FormControl(''),

          leftk_5: new FormControl('' , Validators.required),
          leftk1: new FormControl('' , Validators.required),
          leftk2: new FormControl('', Validators.required),
          left3k: new FormControl('', Validators.required),
          left4k: new FormControl('', Validators.required),
          left6k: new FormControl('', Validators.required),
          left8k: new FormControl('' , Validators.required),

          right_0_5: new FormControl('', Validators.required),
          right_1k: new FormControl('' , Validators.required),
          right_2k: new FormControl('' , Validators.required),
          right_3k: new FormControl('' , Validators.required),
          right_4k: new FormControl('', Validators.required),
          right_6k: new FormControl('', Validators.required),
          right_8k: new FormControl('', Validators.required),


      });
  }

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


              if(this.patient && this.patient.workplace){

                  this.audiogramService.getBundleFromOrganizationName(this.patient.workplace).subscribe(
                      data => {

                          if (data && data['entry'] && Array.isArray(data['entry']) && data['entry'].length > 0) {
                              data['entry'].map(item => {
                                  const resource = item.resource;
                                  if (resource.resourceType === 'Organization') {
                                   this.getLocations(resource.resourceType , resource.id);
                                  }
                              });
                          }


                      },
                      error => this.handleError(error)
                  );
              }



            } else if (resource.resourceType === 'QuestionnaireResponse') {
              this.serviceRequest = resource; // qr
            }
          });
        }

        console.log('eoc =>', this.eoc);
        console.log('patient =>', this.patient);
      });
    });

      this.datePickerConfig = Object.assign(
          {},
          { containerClass: 'theme-dark-blue', dateInputFormat: this.DATE_FORMAT, rangeInputFormat: this.DATE_FORMAT }
      );
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

    getLocations(resourceType , resourseId) {

        this.audiogramService.getLocations(resourceType , resourseId).subscribe(
            data => {
                if(data && data['entry'] && data['entry'].length > 0){
                    this.locations = data['entry'];
                }


               console.log("this.locationsthis.locationsthis.locations",this.locations)
            }
    ,
            error => this.handleError(error)
        );
   }

  saveAudiogram(){

      const deviceRequest  = {
          "resourceType": "Device",
          "udi": {
              "deviceIdentifier": this.audioGramFormGroup.get('devSerial').value
          },
          "model": this.audioGramFormGroup.get('devModel').value,
          "note": [
              {
                  "time": moment(this.audioGramFormGroup.get('devCelibrationDate').value).format(),
                  "text": "calibration-date"
              }
          ]
      };


      this.audiogramService.postDevice(JSON.stringify(deviceRequest)).subscribe(deviceData => {

          const audiogramRequest = {
              resourceType : null,
              extension : [],
              status: null,
              category: [],
              subject: {
                  reference: null
              },
              context: {
                  reference : null
              },
              issued: null,
              device: {
                  reference : null
              },
              component : []
          };
          if(deviceData){


          audiogramRequest.resourceType = 'Observation';
          audiogramRequest.extension = [
              {
                  url: "examiner",
                  valueString: this.audioGramFormGroup.get('examineID').value
              },
              {
                  "url": "test-location",
                  "valueReference": {
                      "reference": "Location/"+ this.audioGramFormGroup.get('locationOfTest').value
                  }
              }
          ];
          audiogramRequest.status = 'final';
          audiogramRequest.category = [
              {
                  "coding": [
                      {
                          "system": "http://hl7.org/fhir/observation-category",
                          "code": "exam",
                          "display": "Exam"
                      }
                  ],
                  "text": "Exam"
              },
              {
                  "coding": [
                      {
                          "system": "http://nohis.gc.ca/observation-type",
                          "code": "audiogram",
                          "display": "Audiogram"
                      }
                  ],
                  "text": "Audiogram"
              },

          ];
          if(this.selectedBaseLine === 'yes'){
              let componenet = {
                  "coding": [
                      {
                          "system": "http://nohis.gc.ca/observation-use",
                          "code": "baseline",
                          "display": "Baseline"
                      }
                  ],
                  "text": "Baseline"
              };

              audiogramRequest.category.push(componenet);
          }else {
              audiogramRequest.category = audiogramRequest.category.filter(data =>{
                  if(data.text  !== "Baseline") {
                      return data
                  }
              });
          }
          let selectHearingLoss;

          if(this.selectedHearingLoss === 'left'){
              selectHearingLoss = {
                  "coding": [
                      {
                          "system": "http://nohis.gc.ca/hearing-loss",
                          "code": "hearing-loss",
                          "display": "Hearing Loss"
                      }
                  ],
                  "text": "Left"
              }
          }else {
              selectHearingLoss = {
                  "coding": [
                      {
                          "system": "http://nohis.gc.ca/hearing-loss",
                          "code": "hearing-loss",
                          "display": "Hearing Loss"
                      }
                  ],
                  "text": "Right"
              }
          }
          if(this.selectedHearingLoss !== null){
              audiogramRequest.category.push(selectHearingLoss);
          }


          audiogramRequest.subject = {
              "reference": "Patient/"+ this.patient.id
          };
          audiogramRequest.context = {
              "reference": "EpisodeOfCare/"+ this.eocId
          };
          audiogramRequest.issued =  this.audioGramFormGroup.get('issued').value;
          audiogramRequest.device = {
              "reference": "Device/" + deviceData['id']
          };

          audiogramRequest.component = [
              {
                  "code": {
                      "coding": [
                          {
                              "system": "http://loinc.org",
                              "code": "89024-4",
                              "display": "Hearing threshold 500 Hz Ear-L"
                          }
                      ]
                  },
                  "valueString": this.audioGramFormGroup.get('leftk_5').value
              },
              {
                  "code": {
                      "coding": [
                          {
                              "system": "http://loinc.org",
                              "code": "89025-1",
                              "display": "Hearing threshold 500 Hz Ear-R"
                          }
                      ]
                  },
                  "valueString": this.audioGramFormGroup.get('right_0_5').value
              },
              {
                  "code": {
                      "coding": [
                          {
                              "system": "http://loinc.org",
                              "code": "89016-0",
                              "display": "Hearing threshold 1000 Hz Ear-L"
                          }
                      ]
                  },
                  "valueString": this.audioGramFormGroup.get('leftk1').value
              },
              {
                  "code": {
                      "coding": [
                          {
                              "system": "http://loinc.org",
                              "code": "89017-8",
                              "display": "Hearing threshold 1000 Hz Ear-R"
                          }
                      ]
                  },
                  "valueString": this.audioGramFormGroup.get('right_1k').value
              },
              {
                  "code": {
                      "coding": [
                          {
                              "system": "http://loinc.org",
                              "code": "89018-6",
                              "display": "Hearing threshold 2000 Hz Ear-L"
                          }
                      ]
                  },
                  "valueString": this.audioGramFormGroup.get('leftk2').value
              },
              {
                  "code": {
                      "coding": [
                          {
                              "system": "http://loinc.org",
                              "code": "89019-4",
                              "display": "Hearing threshold 2000 Hz Ear-R"
                          }
                      ]
                  },
                  "valueString": this.audioGramFormGroup.get('right_2k').value
              },
              {
                  "code": {
                      "coding": [
                          {
                              "system": "http://loinc.org",
                              "code": "89020-2",
                              "display": "Hearing threshold 3000 Hz Ear-L"
                          }
                      ]
                  },
                  "valueString": this.audioGramFormGroup.get('left3k').value
              },
              {
                  "code": {
                      "coding": [
                          {
                              "system": "http://loinc.org",
                              "code": "89021-0",
                              "display": "Hearing threshold 3000 Hz Ear-R"
                          }
                      ]
                  },
                  "valueString": this.audioGramFormGroup.get('right_3k').value
              },
              {
                  "code": {
                      "coding": [
                          {
                              "system": "http://loinc.org",
                              "code": "89022-8",
                              "display": "Hearing threshold 4000 Hz Ear-L"
                          }
                      ]
                  },
                  "valueString": this.audioGramFormGroup.get('left4k').value
              },
              {
                  "code": {
                      "coding": [
                          {
                              "system": "http://loinc.org",
                              "code": "89023-6",
                              "display": "Hearing threshold 4000 Hz Ear-R"
                          }
                      ]
                  },
                  "valueString": this.audioGramFormGroup.get('right_4k').value
              },
              {
                  "code": {
                      "coding": [
                          {
                              "system": "http://loinc.org",
                              "code": "89026-9",
                              "display": "Hearing threshold 6000 Hz Ear-L"
                          }
                      ]
                  },
                  "valueString": this.audioGramFormGroup.get('left6k').value
              },
              {
                  "code": {
                      "coding": [
                          {
                              "system": "http://loinc.org",
                              "code": "89027-7",
                              "display": "Hearing threshold 6000 Hz Ear-R"
                          }
                      ]
                  },
                  "valueString": this.audioGramFormGroup.get('right_6k').value
              },
              {
                  "code": {
                      "coding": [
                          {
                              "system": "http://loinc.org",
                              "code": "89028-5",
                              "display": "Hearing threshold 8000 Hz Ear-L"
                          }
                      ]
                  },
                  "valueString": this.audioGramFormGroup.get('left8k').value
              },
              {
                  "code": {
                      "coding": [
                          {
                              "system": "http://loinc.org",
                              "code": "89029-3",
                              "display": "Hearing threshold 8000 Hz Ear-R"
                          }
                      ]
                  },
                  "valueString": this.audioGramFormGroup.get('right_8k').value
              }
          ];




          console.log(JSON.stringify(audiogramRequest));

          this.audiogramService.saveAudiogramRequest(JSON.stringify(audiogramRequest)).subscribe(data => {


             console.log("Audiogram Response", data)


              this.router.navigateByUrl('/staff/audiogram/' + this.eocId);
          });


          }

      });



   // this.router.navigateByUrl('/staff/audiogram/' + this.eocId);
  }

    handleError(error) {
        console.log(error);
    }

    onChangeLocation(location) {
        const selectedLocation = JSON.parse(location);
        if (selectedLocation) {
            console.log(selectedLocation);
        }

    }


}
