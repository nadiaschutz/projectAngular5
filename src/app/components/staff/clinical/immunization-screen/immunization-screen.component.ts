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
import { formatDate } from '@angular/common';
import { TitleCasePipe } from '@angular/common';
@Component({
  selector: 'app-immunization-screen',
  templateUrl: './immunization-screen.component.html',
  styleUrls: ['./immunization-screen.component.scss']
})
export class ImmunizationScreenComponent implements OnInit {

  clinicialFormGroup: FormGroup;
  vaccinationFormGroup: FormGroup;

  showVaccineForm = false;
  switchClinicalChecklist = false;
  hasPreviousHistory = false;
  checkboxHistoryFormDisabled = true;

  episodeOfCare;
  questionnaireID;
  questionnaireResponse;
  newNoteValue;
  selectedVaccine;
  serviceRequestSummary;


  clinicalQuestionnaireArray = [];
  administeredVaccines = [];
  cliniciansList = [];
  vaccineList = [];

  datePickerConfig: Partial<BsDatepickerConfig>;

  minDate: Date;
  maxDate: Date;


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

  siteList = [
    { value: 'LA', viewValue: 'Left Arm' },
    { value: 'RA', viewValue: 'Right Arm' }
  ];

  ngOnInit() {
    this.datePickerConfig = Object.assign(
      {},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'YYYY-MM-DD',
        showWeekNumbers: false
      }
    );
    let enableClinicalPiece = false;
    this.fetchAllClinicians();
    if (sessionStorage.getItem('userRole')) {
      if (sessionStorage.getItem('userRole') === 'clinician') {
        this.staffService.getVaccineList().subscribe(
          data => {
            data['list'].forEach(vaccine => {
              if (vaccine) {
                this.vaccineList.push(vaccine);
              }
            });
          }
        );
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
              this.staffService
                .getAdministerededVaccinesFromServer(this.episodeOfCare['id'])
                .subscribe(
                  data => {
                    this.processAdministeredVaccines(data);
                  },
                  error => {
                    console.log(error);
                  }
                );
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
        this.staffService
          .getAnyFHIRObjectByCustomQuery(
            'QuestionnaireResponse?context=' +
              episodeId +
              '&identifier=' +
              queryString
          )
          .subscribe(
            data => {
              if (data) {
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
            () => {}
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
        }
      );
  }

  processAdministeredVaccines(data) {
    if (data) {
      if (data['entry']) {
        for (const currentEntry of data['entry']) {
          const individualEntry = currentEntry['resource'];
          const temp = {};

          temp['dateAdmined'] = individualEntry['date'];
          individualEntry['vaccineCode']['coding'].forEach(codeFound => {
            temp['vaccine'] = {
              code: codeFound['code'],
              display: codeFound['display']
            };
          });

          individualEntry['site']['coding'].forEach(siteFound => {
            temp['site'] = {
              code: siteFound['code'],
              display: siteFound['display']
            };
          });
          temp['dose'] =
            individualEntry['doseQuantity']['value'] +
            ' ' +
            individualEntry['doseQuantity']['code'];
          temp['name'] = individualEntry['note'][0]['text'];
          temp['lotNumber'] = individualEntry['lotNumber'];
          temp['expirationDate'] = individualEntry['expirationDate'];
          if (individualEntry['extension']) {
            for (const extension of individualEntry['extension']) {
              if (extension['url'].includes('diluentlotnumber')) {
                temp['diluentLotNumber'] = extension['valueString'];
              }
            }
          } else {
            temp['diluentLotNumber'] = '-';
          }
          this.staffService
            .getAnyFHIRObjectByReference(
              '/' + individualEntry['practitioner'][0]['actor']['reference']
            )
            .subscribe(practitioner => {
              if (practitioner) {
                temp['adminBy'] = this.utilService.getNameFromResource(
                  practitioner
                );
              }
            });

          this.administeredVaccines.push(temp);
          console.log(temp);
        }
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
            temp['linkId'] = element['linkId'];
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
        }
      }
    }
  }

  processClinicalQuestionnaireResponseForHistory(data) {
    if (data) {
      if (data['entry']) {
        this.hasPreviousHistory = true;
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
      const codingAnswer = new FHIR.Answer();
      baseItem.linkId = item['linkId'];
      baseItem.type = item['type'];
      baseItem.text = item['text'];
      baseItem.answer = [];
        if (item['code']) {
          baseItem.answer.push(item['code']);
        }
      baseItem.item = [];


      if (item['linkId'] === 'IMMUNREVQ4') {
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
          const codingElementAnswer = new FHIR.Answer();
          const elementCoding = new FHIR.Coding();

          itemToSave.answer = [];

          elementCoding.code = element['code'][0]['code'];
          codingElementAnswer.valueCoding = elementCoding;

          itemToSave.answer.push(codingElementAnswer);

          if (!element['item']) {
            if (element.checked) {
              answer.valueBoolean = true;

              itemToSave.answer.push(answer);
              if (element['code']) {
                itemToSave.answer.push(element['code']);
              }
            } else {
              answer.valueBoolean = false;
              itemToSave.answer.push(answer);
              if (element['code']) {
                itemToSave.answer.push(element['code']);
              }
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
                if (nestedItem['code']) {
                  nestedObj.answer.push(nestedItem['code']);
                }
              } else {
                nestedAnswer.valueBoolean = false;
                nestedObj.answer.push(nestedAnswer);
                if (nestedItem['code']) {
                  nestedObj.answer.push(nestedItem['code']);
                }
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

    this.staffService
      .saveClinicalQuestionnaireResponse(JSON.stringify(questionnaireResponse))
      .subscribe(
        data => {
          if (data) {
            this.questionnaireResponse = data;
            console.log(data);
          }
        },
        error => {
          console.log(error);
        },
        () => {
          this.checkboxHistoryFormDisabled = !this.checkboxHistoryFormDisabled;
          location.reload();
        }
      );
  }

  fetchAllClinicians() {
    this.staffService.getAllClinicians().subscribe(data => {
      if (data['entry']) {
        data['entry'].forEach(element => {
          const clinician = element['resource'];
          this.cliniciansList.push({
            id: clinician['id'],
            name: this.utilService.getNameFromResource(clinician)
          });
        });
      }
    });
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

    this.staffService
      .saveProcedureRequest(JSON.stringify(procedureRequest))
      .subscribe(
        data => {
          console.log(data);
        },
        error => {
          console.log(error);
        },
        () => {
          this.saveQuestionnaireResponse();
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

    identifier.value = 'VACCINE-ENCOUNTER';
    encounter.subject = patient;
    encounter.episodeOfCare.push(eoc);
    encounter.identifier.push(identifier);
    encounter.status = 'in-progress';
    encounter.resourceType = 'Encounter';

    this.staffService.createEncounter(JSON.stringify(encounter)).subscribe(
      data => {
        this.addImmunization(data);
      },
      error => {
        console.log(error);
      }
    );
  }

  addImmunization(data: any) {
    const immunization = new FHIR.Immunization();
    const encounterReference = new FHIR.Reference();
    const patientReference = new FHIR.Reference();
    const site = new FHIR.CodeableConcept();
    const siteCoding = new FHIR.Coding();
    const vaccine = new FHIR.CodeableConcept();
    const vaccineCoding = new FHIR.Coding();
    const doseCoding = new FHIR.Coding();
    const practitioner = new FHIR.PractitionerForImmunization();
    const identifier = new FHIR.Identifier();
    const note = new FHIR.Annotation();
    const diluentLotNumber = new FHIR.Extension();
    practitioner.actor = new FHIR.Reference();
    site.coding = [];
    vaccine.coding = [];
    immunization.identifier = [];
    immunization.note = [];

    identifier.value = 'VACCINATION-' + data['id'];

    const practitionerObject = this.vaccinationFormGroup.get('adminBy').value;
    practitioner.actor.reference = 'Practitioner/' + practitionerObject['id'];
    encounterReference.reference = 'Encounter/' + data['id'];
    patientReference.reference = this.episodeOfCare['patient']['reference'];

    doseCoding.code = 'mg';
    doseCoding.system = 'http://unitsofmeasure.org';
    doseCoding.value = this.vaccinationFormGroup.get('dose').value;

    const vaccineFromForm = this.vaccinationFormGroup.get('vaccine').value;
    vaccineCoding.code = vaccineFromForm['code'];
    vaccineCoding.system = 'http://hl7.org/fhir/sid/cvx';
    vaccineCoding.display = vaccineFromForm['display'];

    siteCoding.code = this.vaccinationFormGroup.get('site').value;
    siteCoding.system = 'http://hl7.org/fhir/v3/ActSite';
    this.siteList.forEach(siteFound => {
      if (this.vaccinationFormGroup.get('site').value === siteFound['value']) {
        siteCoding.display = siteFound['viewValue'];
      }
    });

    vaccine.coding.push(vaccineCoding);
    site.coding.push(siteCoding);
    const dateAdmined = formatDate(
      this.vaccinationFormGroup.get('dateAdministered').value,
      'yyyy-MM-dd',
      'en'
    );
    const expiryDate = formatDate(
      this.vaccinationFormGroup.get('expirationDate').value,
      'yyyy-MM-dd',
      'en'
    );

    note.text = this.vaccinationFormGroup.get('productName').value;

    diluentLotNumber.valueString = this.vaccinationFormGroup.get(
      'diluentLotNumber'
    ).value;
    diluentLotNumber.url = 'https://bcip.smilecdr.com/fhir/diluentlotnumber';

    immunization.extension = [diluentLotNumber];
    immunization.identifier.push(identifier);
    immunization.note.push(note);
    immunization.practitioner = practitioner;
    immunization.encounter = encounterReference;
    immunization.site = site;
    immunization.patient = patientReference;
    immunization.lotNumber = this.vaccinationFormGroup.get('lotNumber').value;
    immunization.date = dateAdmined;
    immunization.expirationDate = expiryDate;
    immunization.doseQuantity = doseCoding;
    immunization.vaccineCode = vaccine;
    immunization.resourceType = 'Immunization';

    this.staffService
      .createImmunizationInfo(JSON.stringify(immunization))
      .subscribe(
        dataImmunization => {
          if (data) {
            console.log(dataImmunization);
          }
        },
        error => {
          console.log(error);
        },
        () => {
          this.staffService
            .getAdministerededVaccinesFromServer(this.episodeOfCare['id'])
            .subscribe(
              results => {
                this.processAdministeredVaccines(results);
              },
              error => {
                console.log(error);
              }
            );
          this.showVaccineForm = !this.showVaccineForm;
        }
      );
  }

  updateQuestionnaireResponse() {
    for (const item of this.questionnaireResponse['item']) {
      if (
        item['answer'][0]['valueCoding']['code'] === 'IMMUNREVQ4' &&
        this.newNoteValue
      ) {
        const temp = {};
        temp['valueString'] = this.newNoteValue;
        item['answer'].push(temp);
        console.log(item, this.questionnaireResponse);
      }
    }

    this.staffService
      .updateClinicalQuestionnaireResponse(
        this.questionnaireResponse['id'],
        JSON.stringify(this.questionnaireResponse)
      )
      .subscribe(
        data => {
          console.log('SUCESS', data);
          this.questionnaireResponse = data;
        },
        error => {
          console.log(error);
        },
        () => {
          this.checkboxHistoryFormDisabled = !this.checkboxHistoryFormDisabled;
        }
      );
  }

  viewDetailedContext() {
    this.router.navigateByUrl('/staff/work-screen');
  }
}
