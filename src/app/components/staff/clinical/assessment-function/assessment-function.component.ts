import { Component, OnInit, OnDestroy } from '@angular/core';
import { StaffService } from '../../../../service/staff.service';
import { UtilService } from '../../../../service/util.service';
import { UserService } from '../../../../service/user.service';
import {
  FormBuilder,
  FormGroup,
  FormControl
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as FHIR from '../../../../interface/FHIR';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { formatDate } from '@angular/common';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-assessment-function',
  templateUrl: './assessment-function.component.html',
  styleUrls: ['./assessment-function.component.scss']
})
export class AssessmentFunctionComponent implements OnInit {

  assessmentFormGroup: FormGroup;

  constructor(
    private staffService: StaffService,
    private utilService: UtilService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  episodeOfCare;
  serviceRequestSummary;
  episodeOfCareId;
  performerList = [
    { value: 'PSOHP', viewValue: 'PSOHP' },
    { value: 'EXTERNAL', viewValue: 'External Health Provider' }
  ];

  ngOnInit() {

    this.episodeOfCareId = sessionStorage.getItem('selectedEpisodeId');


    this.assessmentFormGroup = this.formBuilder.group({
      performerType: new FormControl(''),
      examDate: new FormControl(''),
      expiryDate: new FormControl(''),
      assessmentQOne: new FormControl(''),
      assessmentQTwo: new FormControl(''),
      assessmentQTwoA: new FormControl(''),
      assessmentQThree: new FormControl(''),
      assessmentQFour: new FormControl(''),
      nextAssessment: new FormControl(''),
      vaccineStatusReviewed: new FormControl(''),
      comment: new FormControl('')
    });
    this.staffService
    .getAnyFHIRObjectByCustomQuery(
      'EpisodeOfCare/' + sessionStorage.getItem('selectedEpisodeId')
    )
    .subscribe(
      data => {
        if (data) {
          this.episodeOfCare = data;
        }
      },
      error => {
        console.log(error);
      },
      () => {
        this.processServiceRequestForSummary();
      }
    );
  }

  createEncounter() {
    const encounter = new FHIR.Encounter;
    const identifier = new FHIR.Identifier;
    const patient = new FHIR.Reference;
    const eoc = new FHIR.Reference;

    eoc.reference = 'EpisodeOfCare/' + this.episodeOfCare['id'];
    patient.reference = this.episodeOfCare['patient']['reference'];

    encounter.identifier = [];
    encounter.episodeOfCare = [];

    identifier.value = 'VACCINE-ENCOUNTER';
    encounter.subject = patient;
    encounter.episodeOfCare.push(eoc);
    encounter.identifier.push(identifier);
    encounter.status = 'in-progress';
    encounter.resourceType = 'Encounter';
    console.log(encounter);

    this.saveObservation(encounter);

    // this.staffService.createEncounter(JSON.stringify(encounter)).subscribe(
    //   data => {
    //     this.saveObservation(data);
    //   },
    //   error => {
    //     console.log(error);
    //   }
    // );

  }

  processServiceRequestForSummary() {
    const temp = {};
    this.staffService.getAnyFHIRObjectByCustomQuery('QuestionnaireResponse?identifier=SERVREQ&context='
    + this.episodeOfCare['id']).subscribe(
      questionnaireFound => {
        if (questionnaireFound) {
          if (questionnaireFound['entry']) {
            for (const currentEntry of questionnaireFound['entry']) {
              const individualEntry = currentEntry['resource'];
              temp['id'] = individualEntry['id'];
              this.staffService.getAnyFHIRObjectByCustomQuery(individualEntry['subject']['reference']).subscribe(
                patient => {
                  if (patient) {
                    temp['name'] = this.utilService.getNameFromResource(patient);
                    this.serviceRequestSummary = temp;

                  }
                }
              );
            }
          }

        }
      },
      error => {
        console.log(error);
      },
      () => {
        console.log('we set them boys');
      }
    );
  }

  saveObservation(data) {
    const observation = new FHIR.Observation;
    const identifier = new FHIR.Identifier;
    // const basedOn = new FHIR.Reference;
    const category = new FHIR.CodeableConcept;
    const categoryCoding = new FHIR.Coding;
    const subject = new FHIR.Reference;
    const context = new FHIR.Reference;
    const performer = new FHIR.Reference;

    observation.component = [];

    if (this.returnInputValue('assessmentQOne')) {
      const component = new FHIR.Component;
      const componentCode = new FHIR.CodeableConcept;
      const componentCoding = new FHIR.Coding;

      componentCoding.value = this.returnInputValue('assessmentQOne');
      componentCoding.code = 'ASSESS_ONE_MEETS_MED_REQUIREMENTS';
      componentCoding.system = 'assessmentQOne';

      componentCode.coding = [];
      componentCode.coding.push(componentCoding);
      component.code = componentCode;
      observation.component.push(component);
    }

    if (this.returnInputValue('assessmentQTwo')) {
      const component = new FHIR.Component;
      const componentCode = new FHIR.CodeableConcept;
      const componentCoding = new FHIR.Coding;

      componentCoding.value = this.returnInputValue('assessmentQTwo');
      componentCoding.code = 'ASSESS_TWO_MEETS_MED_REQUIREMENTS_LIMIT';
      componentCoding.system = 'assessmentQTwo';

      componentCode.coding = [];
      componentCode.coding.push(componentCoding);
      component.code = componentCode;
      observation.component.push(component);
    }

    if (this.returnInputValue('assessmentQTwoA')) {
      const component = new FHIR.Component;
      const componentCode = new FHIR.CodeableConcept;
      const componentCoding = new FHIR.Coding;

      componentCoding.value = this.returnInputValue('assessmentQTwoA');
      componentCoding.code = 'ASSESS_TWO_MEETS_MED_REQUIREMENTS_LIMIT_TYPE';
      componentCoding.system = 'assessmentQTwoA';

      componentCode.coding = [];
      componentCode.coding.push(componentCoding);
      component.code = componentCode;
      observation.component.push(component);
    }

    if (this.returnInputValue('assessmentQThree')) {
      const component = new FHIR.Component;
      const componentCode = new FHIR.CodeableConcept;
      const componentCoding = new FHIR.Coding;

      componentCoding.value = this.returnInputValue('assessmentQThree');
      componentCoding.code = 'ASSESS_THREE_MISSING_MED_INFO';
      componentCoding.system = 'assessmentQThree';

      componentCode.coding = [];
      componentCode.coding.push(componentCoding);
      component.code = componentCode;
      observation.component.push(component);
    }

    if (this.returnInputValue('assessmentQFour')) {
      const component = new FHIR.Component;
      const componentCode = new FHIR.CodeableConcept;
      const componentCoding = new FHIR.Coding;

      componentCoding.value = this.returnInputValue('assessmentQFour');
      componentCoding.code = 'CANNOT_ASSESS';
      componentCoding.system = 'assessmentQFour';

      componentCode.coding = [];
      componentCode.coding.push(componentCoding);
      component.code = componentCode;
      observation.component.push(component);
    }

    performer.reference = 'Practitioner/' + sessionStorage.getItem('userFHIRID');
    subject.reference = this.episodeOfCare['patient']['reference'];

    observation.resourceType = 'Observation';
    observation.identifier = [identifier];
    observation.performer = [performer];
    observation.subject = subject;
    observation.comment = this.assessmentFormGroup.get('comment').value;
  }

  returnInputValue(input) {
    return this.assessmentFormGroup.get(input).value;
  }
}
