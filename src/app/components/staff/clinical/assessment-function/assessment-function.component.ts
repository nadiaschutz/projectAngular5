import { Component, OnInit, OnDestroy } from '@angular/core';
import { StaffService } from '../../../../service/staff.service';
import { UtilService } from '../../../../service/util.service';
import { UserService } from '../../../../service/user.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as FHIR from '../../../../interface/FHIR';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { formatDate, getLocaleExtraDayPeriodRules } from '@angular/common';
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
  ) {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.minDate.setDate(this.minDate.getDate() - 43800);
    this.maxDate.setDate(this.maxDate.getDate());
  }

  episodeOfCare;
  serviceRequestSummary;
  episodeOfCareId;
  performerList = [
    { value: 'PSOHP', viewValue: 'PSOHP' },
    { value: 'EXTERNAL', viewValue: 'External Health Provider' }
  ];

  datePickerConfig: Partial<BsDatepickerConfig>;

  observationForDisplay;
  encounterForDisplay;
  minDate: Date;
  maxDate: Date;

  buttonSelected = false;
  buttonClassOne;
  buttonClassTwo;
  buttonClassThree;
  buttonClassFour;
  vaccStatus;

  buttonClassUnSelectedOne;
  buttonClassUnSelectedTwo;
  buttonClassUnSelectedThree;
  buttonClassUnSelectedFour;
  vaccStatusUnSelected;
  ngOnInit() {
    this.datePickerConfig = Object.assign(
      {},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'YYYY-MM-DD',
        showWeekNumbers: false
      }
    );

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
      vaccineStatusRequired: new FormControl(''),
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
    const encounter = new FHIR.Encounter();
    const identifier = new FHIR.Identifier();
    const patient = new FHIR.Reference();
    const eoc = new FHIR.Reference();

    eoc.reference = 'EpisodeOfCare/' + this.episodeOfCare['id'];
    patient.reference = this.episodeOfCare['patient']['reference'];

    encounter.identifier = [];
    encounter.episodeOfCare = [];

    identifier.value = 'ASSESSMENT-ENCOUNTER';
    encounter.subject = patient;
    encounter.episodeOfCare.push(eoc);
    encounter.identifier.push(identifier);
    encounter.status = 'in-progress';
    encounter.resourceType = 'Encounter';
    this.encounterForDisplay = JSON.stringify(encounter, undefined, 2);
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
    this.staffService
      .getAnyFHIRObjectByCustomQuery(
        'QuestionnaireResponse?identifier=SERVREQ&context=' +
          this.episodeOfCare['id']
      )
      .subscribe(
        questionnaireFound => {
          if (questionnaireFound) {
            if (questionnaireFound['entry']) {
              for (const currentEntry of questionnaireFound['entry']) {
                const individualEntry = currentEntry['resource'];
                temp['id'] = individualEntry['id'];
                this.staffService
                  .getAnyFHIRObjectByCustomQuery(
                    individualEntry['subject']['reference']
                  )
                  .subscribe(patient => {
                    if (patient) {
                      temp['name'] = this.utilService.getNameFromResource(
                        patient
                      );
                      this.serviceRequestSummary = temp;
                    }
                  });
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
    const observation = new FHIR.Observation();
    const identifier = new FHIR.Identifier();
    // const basedOn = new FHIR.Reference;
    const category = new FHIR.CodeableConcept();
    const categoryCoding = new FHIR.Coding();
    const subject = new FHIR.Reference();
    const context = new FHIR.Reference();
    const performer = new FHIR.Reference();
    const period = new FHIR.Period();

    observation.component = [];

    if (this.returnInputValue('assessmentQOne')) {
      const component = new FHIR.Component();
      const componentCode = new FHIR.CodeableConcept();
      const componentCoding = new FHIR.Coding();

      componentCoding.display = this.returnInputValue('assessmentQOne');
      componentCoding.code = 'ASSESS_ONE_MEETS_MED_REQUIREMENTS';
      componentCoding.system = 'assessmentQOne';

      componentCode.coding = [];
      componentCode.coding.push(componentCoding);
      component.code = componentCode;
      observation.component.push(component);
    }

    if (this.returnInputValue('assessmentQTwo')) {
      const component = new FHIR.Component();
      const componentCode = new FHIR.CodeableConcept();
      const componentCoding = new FHIR.Coding();

      componentCoding.display = this.returnInputValue('assessmentQTwo');
      componentCoding.code = 'ASSESS_TWO_MEETS_MED_REQUIREMENTS_LIMIT';
      componentCoding.system = 'assessmentQTwo';

      componentCode.coding = [];
      componentCode.coding.push(componentCoding);
      component.code = componentCode;
      observation.component.push(component);
    }

    if (this.returnInputValue('assessmentQTwoA')) {
      const component = new FHIR.Component();
      const componentCode = new FHIR.CodeableConcept();
      const componentCoding = new FHIR.Coding();

      componentCoding.display = this.returnInputValue('assessmentQTwoA');
      componentCoding.code = 'ASSESS_TWO_MEETS_MED_REQUIREMENTS_LIMIT_TYPE';
      componentCoding.system = 'assessmentQTwoA';

      componentCode.coding = [];
      componentCode.coding.push(componentCoding);
      component.code = componentCode;
      observation.component.push(component);
    }

    if (this.returnInputValue('assessmentQThree')) {
      const component = new FHIR.Component();
      const componentCode = new FHIR.CodeableConcept();
      const componentCoding = new FHIR.Coding();

      componentCoding.display = this.returnInputValue('assessmentQThree');
      componentCoding.code = 'ASSESS_THREE_MISSING_MED_INFO';
      componentCoding.system = 'assessmentQThree';

      componentCode.coding = [];
      componentCode.coding.push(componentCoding);
      component.code = componentCode;
      observation.component.push(component);
    }

    if (this.returnInputValue('assessmentQFour')) {
      const component = new FHIR.Component();
      const componentCode = new FHIR.CodeableConcept();
      const componentCoding = new FHIR.Coding();

      componentCoding.display = this.returnInputValue('assessmentQFour');
      componentCoding.code = 'CANNOT_ASSESS';
      componentCoding.system = 'assessmentQFour';

      componentCode.coding = [];
      componentCode.coding.push(componentCoding);
      component.code = componentCode;
      observation.component.push(component);
    }

    if (this.returnInputValue('vaccineStatusRequired')) {
      const component = new FHIR.Component();
      const componentCode = new FHIR.CodeableConcept();
      const componentCoding = new FHIR.Coding();

      componentCoding.display = this.returnInputValue('vaccineStatusRequired');
      componentCoding.code = 'VACCINE_STATUS_REQUIRED';
      componentCoding.system = 'vaccineStatusRequired';

      componentCode.coding = [];
      componentCode.coding.push(componentCoding);
      component.code = componentCode;
      observation.component.push(component);
    }

    performer.reference =
      'Practitioner/' + sessionStorage.getItem('userFHIRID');
    subject.reference = this.episodeOfCare['patient']['reference'];

    console.log(this.returnInputValue('examDate'));

    period.start = this.returnInputValue('examDate');
    period.end = this.returnInputValue('expiryDate');

    period.start = this.utilService.getDate(period.start);
    period.end = this.utilService.getDate(period.end);

    identifier.value = 'CLINICAL-OBSERVATION-' + this.episodeOfCare['id'];

    observation.effectivePeriod = period;
    observation.status = 'preliminary';
    observation.resourceType = 'Observation';
    observation.identifier = [identifier];
    observation.performer = [performer];
    observation.subject = subject;
    observation.comment = this.assessmentFormGroup.get('comment').value;
    this.observationForDisplay = JSON.stringify(observation, undefined, 2);
    console.log(observation);
  }

  returnInputValue(input) {
    return this.assessmentFormGroup.get(input).value;
  }

  patchFormValueForButton(name, value) {
    this.checkIfMeetsRequirements();
    this.switchClassesForButtons(name, value);
    this.assessmentFormGroup.patchValue({ [name]: value });
    console.log(this.assessmentFormGroup.get(name).value);
  }

  checkIfMeetsRequirements() {
    if (this.returnInputValue('assessmentQTwo').toLowerCase() === ('no')) {
      return true;
    }
  }

  switchClassesForButtons(name, value) {
    if (name.includes('QOne') && value === 'Yes') {
      this.buttonClassOne = 'yes-no-button-selected';
      this.buttonClassUnSelectedOne = 'yes-no-button';
    }
    if (name.includes('QOne') && value === 'No') {
      this.buttonClassOne = 'yes-no-button';
      this.buttonClassUnSelectedOne = 'yes-no-button-selected';
    }

    if (name.includes('QTwo') && value === 'Yes') {
      this.buttonClassTwo = 'yes-no-button-selected';
      this.buttonClassUnSelectedTwo = 'yes-no-button';
    }
    if (name.includes('QTwo') && value === 'No') {
      this.buttonClassTwo = 'yes-no-button';
      this.buttonClassUnSelectedTwo = 'yes-no-button-selected';
    }

    if (name.includes('QThree') && value === 'Yes') {
      this.buttonClassThree = 'yes-no-button-selected';
      this.buttonClassUnSelectedThree = 'yes-no-button';
    }
    if (name.includes('QThree') && value === 'No') {
      this.buttonClassThree = 'yes-no-button';
      this.buttonClassUnSelectedThree = 'yes-no-button-selected';
    }

    if (name.includes('QFour') && value === 'Yes') {
      this.buttonClassFour = 'yes-no-button-selected';
      this.buttonClassUnSelectedFour = 'yes-no-button';
    }
    if (name.includes('QFour') && value === 'No') {
      this.buttonClassFour = 'yes-no-button';
      this.buttonClassUnSelectedFour = 'yes-no-button-selected';
    }
    if (name.includes('Vaccination Status Required') && value === 'Yes') {
      this.vaccStatus = 'yes-no-button-selected';
      this.vaccStatusUnSelected = 'yes-no-button';
    }
    if (name.includes('Vaccination Status Required') && value === 'No') {
      this.vaccStatus = 'yes-no-button';
      this.vaccStatusUnSelected = 'yes-no-button-selected';
    }
  }


}
