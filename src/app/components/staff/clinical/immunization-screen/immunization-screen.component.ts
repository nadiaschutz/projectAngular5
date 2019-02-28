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
  selector: 'app-immunization-screen',
  templateUrl: './immunization-screen.component.html',
  styleUrls: ['./immunization-screen.component.scss']
})
export class ImmunizationScreenComponent implements OnInit {
  clinicalQuestionnaireArray = [];
  clinicialFormGroup: FormGroup;
  vaccinationFormGroup: FormGroup;

  showVaccineForm = false;
  switchClinicalChecklist = false;
  episodeOfCare;
  questionnaireID;
  questionnaireResponse;

  datePickerConfig: Partial<BsDatepickerConfig>;

  minDate: Date;
  maxDate: Date;
  constructor(
    private staffService: StaffService,
    private utilService: UtilService,
    private formBuilder: FormBuilder
  ) {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.minDate.setDate(this.minDate.getDate() - 43800);
    this.maxDate.setDate(this.maxDate.getDate());
  }

  siteList  = [
    { value: 'LA', viewValue: 'Left Arm' },
    { value: 'RE', viewValue: 'Right Arm' }
  ];

  ngOnInit() {
    this.datePickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'YYYY-MM-DD',
        showWeekNumbers: false
      });
    let enableClinicalPiece = false;

    if (sessionStorage.getItem('userRole')) {
      if (sessionStorage.getItem('userRole') === 'clinician') {
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
            }
          );

        this.clinicialFormGroup = this.formBuilder.group({
          historyNotes: new FormControl('')
        });
        this.vaccinationFormGroup = this.formBuilder.group({
          dateAdministered: new FormControl(''),
          vaccine: new FormControl(''),
          dose: new FormControl(''),
          site: new FormControl(''),
          productName: new FormControl(''),
          lotNumber: new FormControl(''),
          expirationDate: new FormControl(''),
          diluentLotNumber: new FormControl(''),
          adminBy: new FormControl('')
        });

        const episodeId = sessionStorage.getItem('selectedEpisodeId');
        const queryString = 'IMMUNHIST-' + episodeId;
        this.staffService.getAnyFHIRObjectByCustomQuery('QuestionnaireResponse?context='
        + episodeId + '&identifier=' + queryString).subscribe(
          data => {
            console.log('called');
            if (data) {
              console.log(data);
              if (data['total'] > 0) {
                this.processClinicalQuestionnaireResponseForHistory(data);
              } else {
                // this
              }
            }
          },
          error => {
            console.log(error);
          },
          () => {
          }
        );
        this.staffService
          .getAnyFHIRObjectByCustomQuery(
            'Questionnaire?identifier=IMMUNREV&_language=en-CA'
          )
          .subscribe(
            data => {
              this.processClinicalQuestionnaire(data);
            },
            error => {
              console.log(error);
            },
            () => {
              enableClinicalPiece = true;
            }
          );
      }
    }
  }

  processClinicalQuestionnaire(data) {
    if (data) {
      if (data['entry']) {
        for (const currentEntry of data['entry']) {
          const individualEntry = currentEntry['resource'];
          this.questionnaireID = individualEntry['id'];
          individualEntry['item'].forEach(element => {
            const temp = {};
            temp['id'] = element['linkId'];
            temp['text'] = element['text'];
            temp['type'] = element['type'];
            temp['code'] = element['code'];
            if (element.item) {
              temp['items'] = new Array();
              element.item.forEach(items => {
                const itemObj = {
                  id: items['linkId'],
                  code: items['code'],
                  type: items['type'],
                  text: items['text'],
                  checked: false
                };
                if (items['item']) {
                  itemObj['item'] = items['item'];
                }
                temp['items'].push(itemObj);
              });
            }
            this.clinicalQuestionnaireArray.push(temp);
          });
          console.log(this.clinicalQuestionnaireArray);
        }
      }
    }
  }

  processClinicalQuestionnaireResponseForHistory(data) {
    if (data) {
      if (data['entry']) {
        this.showVaccineForm = true;
        for (const currentEntry of data['entry']) {
          const individualEntry = currentEntry['resource'];
          this.questionnaireResponse = individualEntry;
        }
      }
    }
  }

  saveQuestionnaireResponse() {
    const questionnaireResponse = new FHIR.QuestionnaireResponse();
    questionnaireResponse.subject = new FHIR.Reference();
    questionnaireResponse.questionnaire = new FHIR.Reference();
    questionnaireResponse.context = new FHIR.Reference();
    const identifier = new FHIR.Identifier();
    // const subject = new FHIR.Reference;

    identifier.value =
      'IMMUNHIST-' + sessionStorage.getItem('selectedEpisodeId');

    const itemArray = new Array<FHIR.Item>();
    console.log(this.clinicalQuestionnaireArray);
    this.clinicalQuestionnaireArray.forEach(item => {
      const baseItem = new FHIR.Item();
      const codingAnswer = new FHIR.Answer;
      const coding = new FHIR.Coding;
      // console.log(item['id']);
      baseItem.linkId = item['id'];
      baseItem.type = item['type'];
      // baseItem.code = item['code'];
      baseItem.text = item['text'];
      baseItem.answer = [];
      baseItem.item = [];

      coding.code = item['code'][0]['code'];
      codingAnswer.valueCoding = coding;

      baseItem.answer.push(codingAnswer);

      if (item['code'][0]['code'] === 'IMMUNREVQ4') {
        const historyAnswer = new FHIR.Answer();

        if (this.clinicialFormGroup.get('historyNotes').value) {
          historyAnswer.valueString = this.clinicialFormGroup.get(
            'historyNotes'
          ).value;
          baseItem.answer.push(historyAnswer);
        }
        console.log('baseItem 4', baseItem);
      }

      if (item.items) {
        item.items.forEach(element => {
          const itemToSave = new FHIR.Item();
          const answer = new FHIR.Answer();
          const codingElementAnswer = new FHIR.Answer;
          const elementCoding = new FHIR.Coding;

          itemToSave.answer = [];

          elementCoding.code = element['code'][0]['code'];
          codingElementAnswer.valueCoding = elementCoding;

          itemToSave.answer.push(codingElementAnswer);

          if (!element['item']) {
            if (element.checked) {
              answer.valueBoolean = true;

              itemToSave.answer.push(answer);
            } else {
              answer.valueBoolean = false;
              itemToSave.answer.push(answer);
            }
          }

          itemToSave.linkId = element['id'];
          itemToSave.text = element['text'];
          itemToSave.type = element['type'];
          itemToSave.item = [];

          if (element['item']) {

            element['item'].forEach(nestedItem => {
              const nestedObj = new FHIR.Item();
              const nestedAnswer = new FHIR.Answer();
              nestedObj.linkId = nestedItem['linkId'];
              nestedObj.type = nestedItem['type'];
              nestedObj.text = nestedItem['text'];
              nestedObj.answer = [];
              if (nestedItem.checked) {
                nestedAnswer.valueBoolean = true;
                nestedObj.answer.push(nestedAnswer);
              } else {
                nestedAnswer.valueBoolean = false;
                nestedObj.answer.push(nestedAnswer);
              }
              itemToSave.item.push(nestedObj);
            });
          }

          baseItem.item.push(itemToSave);
        });
      }
      itemArray.push(baseItem);
    });

    questionnaireResponse.resourceType = 'QuestionnaireResponse';
    questionnaireResponse.subject.reference = 'Patient/' + this.episodeOfCare['patient'][
      'reference'
    ];
    questionnaireResponse.questionnaire.reference =
      'Questionnaire/' + this.questionnaireID;
    questionnaireResponse.context.reference =
      'EpisodeOfCare/' + this.episodeOfCare['id'];
    questionnaireResponse.identifier = identifier;
    questionnaireResponse.status = 'in-progress';
    questionnaireResponse.item = itemArray;

    this.staffService.saveClinicalQuestionnaireResponse(JSON.stringify(questionnaireResponse)).subscribe(
      data => {
        if (data) {
          console.log(data);
        }
      }
    );
  }

  displayFHIRObject() {
    console.log(this.questionnaireResponse);
  }

  saveProcedureRequest() {
    const procedureRequest = new FHIR.ProcedureRequest();
    const requester = new FHIR.Requester();
    const requesterReference = new FHIR.Reference();
    const episodeOfCareReference = new FHIR.Reference();
    procedureRequest.resourceType = 'ProcedureRequest';
    procedureRequest.status = 'active';
    procedureRequest.intent = 'plan';
    procedureRequest.authoredOn = this.utilService.getCurrentDate();
    requesterReference.reference =
      'Practitioner/' + sessionStorage.getItem('userFHIRID');
    requester.agent = requesterReference;
    procedureRequest.requester = requester;

    episodeOfCareReference.reference =
      'EpisodeOfCare/' + sessionStorage.getItem('selectedEpisodeId');
    procedureRequest.context = episodeOfCareReference;
    const categoryCodingArray = new Array<FHIR.Coding>();
    this.clinicalQuestionnaireArray.forEach(item => {
      if (item.items) {
        item.items.forEach(element => {
          if (element.checked) {
            const coding = new FHIR.Coding();
            coding.display = element.text;
            categoryCodingArray.push(coding);
          }
          if (element['item']) {
            element['item'].forEach(foundItem => {
              if (foundItem.checked) {
                const coding = new FHIR.Coding();
                coding.display =
                  element.text +
                  element['code']['0']['code'] +
                  foundItem.checked;
                categoryCodingArray.push(coding);
              }
            });
          }
        });
      }
    });

    const category = new FHIR.CodeableConcept();
    category.coding = categoryCodingArray;
    procedureRequest.category = [category];

    const annotation = new FHIR.Annotation();
    annotation.text = this.clinicialFormGroup.get('historyNotes').value;
    procedureRequest.note = [annotation];
    this.saveQuestionnaireResponse();
  }

  createEncounter() {
    const encounter = new FHIR.Encounter;

    encounter.status = 'finisihed';
    encounter.resourceType = 'Encounter';

    this.staffService.createEncounter(JSON.stringify(encounter)).subscribe(
      data => {
        console.log(data);
      },
      error => {
        console.log(error);
      }
    );

  }

  addImmunization(data) {
    const immunization = new FHIR.Immunization;
    const encounterReference = new FHIR.Reference;
    const patientReference = new FHIR.Reference;
    const site = new FHIR.CodeableConcept;
    const siteCoding = new FHIR.Coding;
    const vaccine = new FHIR.CodeableConcept;
    const vaccineCoding = new FHIR.Coding;
    const doseCoding = new FHIR.Coding;
    site.coding = [];
    vaccine.coding = [];

    encounterReference.reference = 'Encounter/' +  data['id'];
    patientReference.reference = 'Patient/' + this.episodeOfCare['patient']['reference'];

    doseCoding.code = 'mg';
    doseCoding.system = 'http://unitsofmeasure.org';
    doseCoding.value = this.vaccinationFormGroup.get('dose').value;

    vaccineCoding.code = this.vaccinationFormGroup.get('vaccine').value;
    vaccineCoding.system = 'http://hl7.org/fhir/sid/cvx';


    siteCoding.code = this.vaccinationFormGroup.get('site').value;
    siteCoding.system = 'http://hl7.org/fhir/v3/ActSite';
    this.siteList.forEach(site => {
      if (this.vaccinationFormGroup.get('site').value === site.value) {
        siteCoding.display = site['viewValue'];
      }
    });

    site.coding.push(siteCoding);
    immunization.encounter = encounterReference;
    immunization.site = site;
    immunization.patient = patientReference;
    immunization.lotNumber = this.vaccinationFormGroup.get('lotNumber').value;
    immunization.date = this.vaccinationFormGroup.get('dateAdministered').value;
    immunization.doseQuantity = doseCoding;
    // if (immunization.date)
  }
}
