import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../../../service/staff.service';
import { UtilService } from '../../../../service/util.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import * as FHIR from '../../../../interface/FHIR';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import * as jspdf from 'jspdf';
import * as html2canvas from 'html2canvas';
import * as moment from 'moment';

@Component({
  selector: 'app-assessment-function',
  templateUrl: './assessment-function.component.html',
  styleUrls: ['./assessment-function.component.scss']
})
export class AssessmentFunctionComponent implements OnInit {

  assessmentFormGroup: FormGroup;

  minDate: Date;
  maxDate: Date;


  performerList = [
    { value: 'PSOHP', viewValue: 'PSOHP' },
    { value: 'EXTERNAL', viewValue: 'External Health Provider' }
  ];

  assessmentList = [
    { value: 'MEETSREQ', viewValue: 'Meets Medical Requirements' },
    {
      value: 'MEETSREQ-TEMP',
      viewValue: 'Meets Medical Requirements with Temporary Limiations'
    },
    {
      value: 'MEETSREQ-PERM',
      viewValue: 'Meets Medical Requirements with Permanent Limiations'
    },
    { value: 'MEETSREQ_NO', viewValue: 'Does Not Meet Medical Requirements' },
    { value: 'MISSING-MED', viewValue: 'Missing Medical Information' },
    { value: 'NOASSESMENT', viewValue: 'Unable to assess' }
  ];

  vaccineReviewChoices = [
    { value: 'YES', viewValue: 'Yes' },
    { value: 'NO', viewValue: 'No' }
  ];
  datePickerConfig: Partial<BsDatepickerConfig>;

  observationForDisplay;
  encounterForDisplay;
  printObjectForDisplay;
  milestoneObject;
  milestoneForDisplay;
  episodeOfCare;
  serviceRequestSummary;
  episodeOfCareId;

  buttonSelected = false;
  assessmentSavedFlag = false;
  printFlag = false;
  twoAFlag = false;
  hideViewButtonFlag = false;
  validateAssessmentCompleteScreenFlag = false;

  vaccStatus;

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
    if (this.episodeOfCareId) {
      this.checkIfAssociatedMilestoneListExists();
    }
    this.assessmentFormGroup = this.formBuilder.group({
      performerType: new FormControl(''),
      examDate: new FormControl(''),
      expiryDate: new FormControl(''),
      assessment: new FormControl(''),
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
                for (const item of individualEntry['item']) {
                  if (item['linkId'] === 'REGOFFICE') {
                    if (item['answer']) {
                      for (const answer of item['answer']) {
                        if (answer['valueCoding']) {
                          temp['region'] = answer['valueCoding']['display'];
                        }
                      }
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

  saveObservation(data) {
    const observation = new FHIR.Observation();
    const identifier = new FHIR.Identifier();
    // const basedOn = new FHIR.Reference;
    const subject = new FHIR.Reference();
    const context = new FHIR.Reference();
    const performer = new FHIR.Reference();
    const period = new FHIR.Period();

    observation.component = [];


    if (this.returnInputValue('assessment')) {
      const component = new FHIR.Component();
      const componentCode = new FHIR.CodeableConcept();
      const componentCoding = new FHIR.Coding();
      this.assessmentList.forEach(currentObj => {
        if (this.returnInputValue('assessment') === currentObj['value']) {
          console.log('found2');

          componentCoding.display = currentObj['viewValue'];
          componentCoding.code = currentObj['value'];
          componentCoding.system = 'ASSESSMENT';
          componentCode.coding = [];
          componentCode.coding.push(componentCoding);
          component.code = componentCode;
          observation.component.push(component);
        }
      });
    }

    if (this.returnInputValue('vaccineStatusReviewed')) {
      const component = new FHIR.Component();
      const componentCode = new FHIR.CodeableConcept();
      const componentCoding = new FHIR.Coding();
      this.vaccineReviewChoices.forEach(currentObj => {
        if (
          this.returnInputValue('vaccineStatusReviewed') === currentObj['value']
        ) {
          componentCoding.display = currentObj['viewValue'];
          componentCoding.code = 'VACCINE_STATUS_REVIEWED';
          componentCoding.system = 'vaccineStatusReviewed';
          componentCode.coding = [];

          componentCode.coding.push(componentCoding);
          component.code = componentCode;
          observation.component.push(component);
        }
      });
    }

    if (this.returnInputValue('performerType') === 'PSOHP') {
      performer.reference =
        'Practitioner/' + sessionStorage.getItem('userFHIRID');
    }
    subject.reference = this.episodeOfCare['patient']['reference'];

    console.log(this.returnInputValue('examDate'));

    period.start = this.returnInputValue('examDate');
    period.end = this.returnInputValue('expiryDate');

    period.start = this.utilService.getDate(period.start);
    period.end = this.utilService.getDate(period.end);

    identifier.value = 'CLINICAL-OBSERVATION-' + this.episodeOfCare['patient']['reference'];
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
    console.log(JSON.stringify(observation));

    // this.staffService.saveAssessment(JSON.stringify(observation)).subscribe(
    //   assessment => {
    //     console.log(assessment);
    //   },
    //   error => {
    //     console.log(error);
    //   },
    //   () => {
    //     this.assessmentSavedFlag = true;
    //     this.changeMilestoneToWorkCompleted();
    //     this.createCommunicationObjectForAssessments('withassess');
    //   }
    // );
  }

  // patchFormValueForButton(name, value) {
  //   this.switchClassesForButtons(name, value);
  //   this.assessmentFormGroup.patchValue({ [name]: value });
  //   console.log(this.assessmentFormGroup.get(name).value);
  // }

  returnInputValue(input) {
    return this.assessmentFormGroup.get(input).value;
  }

  generatePageToPrint() {
    this.changeFlagsForPrinting();
    this.generateObjectForPrinting();
  }

  printToPDF() {
    if (this.printFlag === true) {
      const data = document.getElementById('print');
      html2canvas(data).then(canvas => {
        // Few necessary setting options
        const imgWidth = 190;
        const pageHeight = 350;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const heightLeft = imgHeight;

        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
        const position = 0;
        pdf.addImage(contentDataURL, 'PNG', 10, position, imgWidth, imgHeight);
        pdf.save('Diagnostics Test.pdf'); // Generated PDF
      });
    }

  }

  generateObjectForPrinting() {
    const printObj = {};

    let examDate = this.returnInputValue('examDate');
    let expiry = this.returnInputValue('expiryDate');
    let nextAssessment = this.returnInputValue('nextAssessment');
    examDate = this.utilService.getDate(examDate);
    expiry = this.utilService.getDate(expiry);
    nextAssessment = this.utilService.getDate(nextAssessment);
    for (const type of this.assessmentList) {
      if (type.value === this.returnInputValue('assessment')) {
        printObj['assessment'] = type.viewValue;
        if (type.value === 'MEETSREQ-TEMP') {
          printObj['limitation'] = 'Yes - Temporary';
        } else if (type.value === 'MEETSREQ-PERM') {
          printObj['limitation'] = 'Yes - Permanent';
        } else {
          printObj['limitation'] = 'No';
        }
      }
    }

    for (const type of this.performerList) {
      if (type.value === this.returnInputValue('performerType')) {
        printObj['performerType'] = type.viewValue;
      }
    }

    for (const type of this.vaccineReviewChoices) {
      if (type.value === this.returnInputValue('vaccineStatusReviewed')) {
        printObj['vaccineStatusReviewed'] = type.viewValue;
      }
    }

    printObj['examDate'] = examDate;
    printObj['expiryDate'] = expiry;
    printObj['nextAssessment'] = nextAssessment;
    printObj['comment'] = this.returnInputValue('comment');
    printObj['pri'] = this.serviceRequestSummary['pri'];
    printObj['name'] = this.serviceRequestSummary['name'];
    printObj['dob'] = this.serviceRequestSummary['dob'];
    printObj['serviceId'] = this.serviceRequestSummary['serviceId'];
    printObj['date'] = this.utilService.getCurrentDate();
    printObj['region'] = this.serviceRequestSummary['region'];
    printObj['employeeDept'] = this.serviceRequestSummary['employeeDept'];
    printObj['employeeBranch'] = this.serviceRequestSummary['employeeBranch'];
    this.printObjectForDisplay = printObj;
  }

  changeScreenToValidationScreen() {
    this.validateAssessmentCompleteScreenFlag = !this.validateAssessmentCompleteScreenFlag;
  }


  validateNoAssessment() {
    this.createCommunicationObjectForAssessments('noassess');
    this.changeMilestoneToWorkCompleted();
  }

  viewDetailedContext() {
    this.router.navigateByUrl('/staff/work-screen');
  }

  goToAppointmentScreen() {
    this.router.navigateByUrl('/staff/clincal/scheduler');
  }

  changeFlagsForPrinting() {
    this.printFlag = !this.printFlag;
    this.hideViewButtonFlag = !this.hideViewButtonFlag;
  }

  createCommunicationObjectForAssessments(type: string) {
    const communication = new FHIR.Communication();
    const payload = new FHIR.Payload;
    const identifier = new FHIR.Identifier();
    const episodeReference = new FHIR.Reference();
    const categoryConcept = new FHIR.CodeableConcept;
    const categoryCoding = new FHIR.Coding;
    const newDate = new Date();
    let authorName = null;

    categoryCoding.system = 'https://bcip.smilecdr.com/fhir/documentcommunication';


    communication.status = 'completed';
    if (type === 'withassess') {
      identifier.value = 'VALIDATED-WITH-ASSESSMENT-' + this.episodeOfCareId;
      categoryCoding.code = 'VALIDATED-WITH-ASSESSMENT';
    }
    if (type === 'noassess') {
      identifier.value = 'VALIDATED-NO-ASSESSMENT-' + this.episodeOfCareId;
      categoryCoding.code = 'VALIDATED-NO-ASSESSMENT';
    }

    categoryConcept.coding = [categoryCoding];
    communication.category = [categoryConcept];
    communication.resourceType = 'Communication';

    episodeReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    communication.context = episodeReference;
    communication.identifier = [identifier];

    this.staffService.getPractitionerByID(sessionStorage.getItem('userFHIRID')).subscribe(
      author => {
        authorName = this.utilService.getNameFromResource(author);
        if (type === 'withassess') {
          payload.contentString = authorName + ' has validated that all clinical work for ' + this.serviceRequestSummary['name']
            + ' has been completed without filing an assessment at ' + this.utilService.getDate(newDate);
        }
        if (type === 'noassess') {
          payload.contentString = authorName + ' has validated that all clinical work for ' + this.serviceRequestSummary['name']
            + ' has been completed with an assessment result of: ' + this.returnInputValue('assessment') + ' at '
            + this.utilService.getDate(newDate);
        }
        communication.payload = [payload];
        this.staffService
          .createCommunication(JSON.stringify(communication))
          .subscribe(data => {
            console.log(data);
          });
      },
      error => {
        console.log(error);
      }
    );
  }

  checkIfAssociatedMilestoneListExists() {
    this.staffService.getStatusList(this.episodeOfCareId).subscribe(data => {
      if (data) {
        console.log(data)
        data['entry'].forEach(entry => {
          this.milestoneObject = entry['resource'];
        });
      }
    });
  }


  changeMilestoneToWorkCompleted() {
    const itemAnswer = new FHIR.Answer();
    const dateTime = moment();

    this.milestoneObject['item'].forEach(element => {
      if (element['linkId'] === 'Work-Completed') {
        if (!element['text']) {
          element['text'] = '';
        }
        if (!element['answer']) {
          element['answer'] = [];
          itemAnswer.valueDateTime = new Date();
          element['answer'].push(itemAnswer);
        }
        if (element['answer']) {
          element['answer'].forEach(timeFound => {
            if (timeFound['valueDateTime']) {
              timeFound['valueDateTime'] = dateTime.format();
            }
          });
        }
      }
    });
    this.staffService
      .updateStatusList(
        this.milestoneObject['id'],
        JSON.stringify(this.milestoneObject)
      )
      .subscribe(data => {
        console.log(data);
        this.milestoneObject = data;
      },
        error => {
          console.log(error);
        });
  }
}
