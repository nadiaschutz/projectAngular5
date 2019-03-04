import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../../../service/staff.service';
import { UtilService } from '../../../../service/util.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import * as FHIR from '../../../../interface/FHIR';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import * as jspdf from 'jspdf';
import * as html2canvas from 'html2canvas';
@Component({
  selector: 'app-assessment-function',
  templateUrl: './assessment-function.component.html',
  styleUrls: ['./assessment-function.component.scss']
})
export class AssessmentFunctionComponent implements OnInit {
  assessmentFormGroup: FormGroup;
  minDate: Date;
  maxDate: Date;


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


  buttonSelected = false;
  assessmentSavedFlag = false;
  printFlag = false;
  twoAFlag = false;

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

    // this.saveObservation(encounter);

    this.staffService.createEncounter(JSON.stringify(encounter)).subscribe(
      data => {
        this.saveObservation(data);
      },
      error => {
        console.log(error);
      }
    );
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
                temp['serviceId'] = individualEntry['id'];
                console.log(individualEntry);
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
                        if (extension['url'] === 'https://bcip.smilecdr.com/fhir/workplace') {
                          temp['employeeDept'] = extension['valueString'];
                        }
                        if (extension['url'] === 'https://bcip.smilecdr.com/fhir/branch') {
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

    if (this.returnInputValue('vaccineStatusReviewed')) {
      const component = new FHIR.Component();
      const componentCode = new FHIR.CodeableConcept();
      const componentCoding = new FHIR.Coding();

      componentCoding.display = this.returnInputValue('vaccineStatusReviewed');
      componentCoding.code = 'VACCINE_STATUS_REVIEWED';
      componentCoding.system = 'vaccineStatusvaccineStatusReviewedequired';

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

    identifier.value = 'CLINICAL-OBSERVATION';
    context.reference = 'Encounter/' + data['id'];
    observation.effectivePeriod = period;
    observation.status = 'preliminary';
    observation.resourceType = 'Observation';
    observation.identifier = [identifier];
    observation.performer = [performer];
    observation.subject = subject;
    observation.context = context;
    observation.comment = this.assessmentFormGroup.get('comment').value;
    this.observationForDisplay = JSON.stringify(observation, undefined, 2);
    console.log(observation);

    this.staffService.saveAssessment(JSON.stringify(observation)).subscribe(
      assessment => {
        console.log(assessment);
      },
      error => {
        console.log(error);
      },
      () => {
        this.assessmentSavedFlag = true;
      }
    );
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
      this.twoAFlag = true;
    } else {
      this.twoAFlag = false;
    }
  }

  printToPDF() {
    const data = document.getElementById('print').style.display = 'block';
    html2canvas(data).then(canvas => {
    // Few necessary setting options
    const imgWidth = 190;
    const pageHeight = 350;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    const heightLeft = imgHeight;

    const contentDataURL = canvas.toDataURL('image/png');
    const pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
    const position = 0;
    pdf.save('Assessment Report.pdf'); // Generated PDF
    });
  }

  generateObjectForPrinting() {
    const printObj = {};
    this.printFlag = true;

    printObj['assessmentQOne'] = this.returnInputValue('assessmentQOne');
    printObj['assessmentQTwo'] = this.returnInputValue('assessmentQTwo');
    printObj['assessmentQTwoA'] = this.returnInputValue('assessmentQTwoA');
    printObj['assessmentQThree'] = this.returnInputValue('assessmentQThree');
    printObj['assessmentQFour'] = this.returnInputValue('assessmentQFour');
    printObj['performerType'] = this.returnInputValue('performerType');
    printObj['examDate'] = this.returnInputValue('examDate');
    printObj['expiryDate'] = this.returnInputValue('expiryDate');
    printObj['nextAssessment'] = this.returnInputValue('nextAssessment');
    printObj['vaccineStatusReviewed'] = this.returnInputValue('vaccineStatusReviewed');
    printObj['comment'] = this.returnInputValue('comment');
    printObj['pri'] = this.serviceRequestSummary['pri'];
    printObj['name'] = this.serviceRequestSummary['name'];
    printObj['dob'] = this.serviceRequestSummary['dob'];
    printObj['serviceId'] = this.serviceRequestSummary['serviceId'];
    printObj['date'] = this.utilService.getCurrentDate();

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
    if (name.includes('vaccineStatusReviewed') && value === 'Yes') {
      this.vaccStatus = 'yes-no-button-selected';
      this.vaccStatusUnSelected = 'yes-no-button';
    }
    if (name.includes('vaccineStatusReviewed') && value === 'No') {
      this.vaccStatus = 'yes-no-button';
      this.vaccStatusUnSelected = 'yes-no-button-selected';
    }
  }

  viewDetailedContext() {
    this.router.navigateByUrl('/staff/work-screen');
  }

}
