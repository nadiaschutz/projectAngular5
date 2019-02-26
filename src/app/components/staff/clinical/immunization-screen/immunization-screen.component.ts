import { Component, OnInit, OnDestroy } from '@angular/core';
import { StaffService } from '../../../../service/staff.service';
import { UtilService } from '../../../../service/util.service';
import { UserService } from '../../../../service/user.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as FHIR from '../../../../interface/FHIR';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { PatientService } from 'src/app/service/patient.service';
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
  episodeOfCare;
  questionnaireID;
  constructor(
    private staffService: StaffService,
    private utilService: UtilService,
    private formBuilder: FormBuilder,
    private oAuthService: OAuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
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
      const baseItem = new FHIR.Item;
      // console.log(item['id']);

      // const baseAnswer = = new FHIR.Answer;
      baseItem.linkId = item['id'];
      baseItem.type = item['type'];
      baseItem.code = item['code'];
      baseItem.text = item['text'];
      baseItem.item = [];
      if (item.items) {
        item.items.forEach(element => {
          const itemToSave = new FHIR.Item;
          const answer = new FHIR.Answer;
          itemToSave.answer = [];

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
          itemToSave.code = element['code'];
          itemToSave.text = element['text'];
          itemToSave.type = element['type'];
          itemToSave.item = [];
          // console.log('first layer', itemToSave)

          if (element['item']) {
            // console.log('checking items', console.log(element['item']));

            element['item'].forEach(nestedItem => {

              console.log(nestedItem);

              const nestedObj = new FHIR.Item;
              const nestedAnswer = new FHIR.Answer;
              nestedObj.linkId = nestedItem['linkId'];
              nestedObj.type = nestedItem['type'];
              nestedObj.text = nestedItem['text'];
              nestedObj.code = nestedItem['code'];
              nestedObj.answer = [];
              // console.log('nestedItem found!'nestedItem.checked)
              if (nestedItem.checked) {
                nestedAnswer.valueBoolean = true;
                nestedObj.answer.push(nestedAnswer);
              } else {
                nestedAnswer.valueBoolean = false;
                nestedObj.answer.push(nestedAnswer);
              }


              // if (!nestedItem['item']) {

              // }
              // if (nestedItem['item']) {

              //   nestedItem['item'].forEach(modifier => {
              //     const modifierToSave = new FHIR.Item();
              //     const modifierAnswer = new FHIR.Answer();

              //     modifierToSave.answer = [];

              //     if (modifier.checked) {
              //       modifierAnswer.valueBoolean = true;
              //       console.log((answer));

              //       modifierToSave.answer.push(modifierAnswer);
              //     } else {
              //       modifierAnswer.valueBoolean = false;
              //       modifierToSave.answer.push(modifierAnswer);
              //     }

              //     modifierToSave.linkId = modifier['id'];
              //     modifierToSave.code = modifier['code'];
              //     modifierToSave.text = modifier['text'];
              //     modifierToSave.type = modifier['type'];

              //     nestedObj.item.push(modifierToSave);
              //   });
              // }

              itemToSave.item.push(nestedObj);
            });
          }

          baseItem.item.push(itemToSave);
        });
      }
      itemArray.push(baseItem);
    });

    questionnaireResponse.resourceType = 'QuestionnaireResponse';
    questionnaireResponse.subject.reference = this.episodeOfCare['patient'][
      'reference'
    ];
    questionnaireResponse.questionnaire.reference =
      'Questionnaire/' + this.questionnaireID;
    questionnaireResponse.context.reference =
      'EpisodeOfCare/' + this.episodeOfCare['id'];
    questionnaireResponse.identifier = identifier;
    questionnaireResponse.status = 'in-progress';
    questionnaireResponse.item = itemArray;
    questionnaireResponse.id = '13354';
    console.log(JSON.stringify(questionnaireResponse));
    // console.log(questionnaireResponse);
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
}
