import { Component, OnInit, Input, ResolvedReflectiveFactory } from '@angular/core';
import { StaffService } from '../../service/staff.service';
import { UtilService } from '../../service/util.service';
import { UserService } from '../../service/user.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import * as FHIR from '../../interface/FHIR';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-document-management',
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.scss']
})
export class DocumentManagementComponent implements OnInit {

  constructor(
    private staffService: StaffService,
    private utilService: UtilService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router
  ) { }

  // documentChecklistItemsList = [];

  docFormGroup: FormGroup;
  checkListItemGroup: FormGroup;
  currentProgressFormGroup: FormGroup;

  docListForTable = [];

  episodeOfCareId;
  serviceRequestSummary;
  displayDocStatus;
  documentCheckList;
  uploadedDocument;

  showSpinner = false;
  statusSelectionList = [
    { value: 'stopped', viewValue: 'SUSPENDED' },
    { value: 'entered-in-error', viewValue: 'CANELED' },
    { value: 'completed', viewValue: 'WAITING' },
    { value: 'in-progress', viewValue: 'ACTION-REQUIRED' },
    { value: 'amended', viewValue: 'IN-PROGRESS' }
  ];

  fileTypeList = [
    { value: 'ADMINISTRATIVE', viewValue: 'ADMINISTRATIVE' },
    { value: 'CLINICAL', viewValue: 'CLINICAL' },
    { value: 'INVOICE', viewValue: 'INVOICE' },
    { value: 'PSOHP-FORM', viewValue: 'PSOHP-FORM' },
    { value: 'OTHER', viewValue: 'OTHER' }
  ];

  ngOnInit() {

    this.episodeOfCareId = sessionStorage.getItem('selectedEpisodeId');

    this.currentProgressFormGroup = this.formBuilder.group({
      currentProgress: new FormControl('')
    });
    this.docFormGroup = this.formBuilder.group({
      filename: new FormControl('', Validators.required),
      filetype: new FormControl('', Validators.required)
    });
    // this.checkDocStatusViewText();
    this.checkIfAssociatedDocCheckListExists();
    // this.loadFilesRelatedToWorkOrder();
    this.processServiceRequestForSummary();

  }

  enableCheckboxForClinicians(item) {
    if (sessionStorage.getItem('userRole') === 'clinician' && item['type'].toLowerCase() === 'clinical') {
      return true;
    } else {
      return false;
    }
  }

  validateClinicalDocument(item) {
    if (item['documentReference']) {
      this.staffService.getAnyFHIRObjectByReference('/' + item['documentReference']).subscribe(
        doc => {
          if (doc) {
            const authenticator = new FHIR.Reference;
            authenticator.reference = 'Practitioner/' + sessionStorage.getItem('userFHIRID');
            doc['authenticator'] = authenticator;
            this.staffService.updateDocumentFile(doc['id'], JSON.stringify(doc)).subscribe(
              () => {
                item['validated'] = true;
                this.createCommunicationObjectForItemValidated(item);
              },
              error => {
                console.log(error);
              }
            );
          }
        }
      );
    }
  }


  processServiceRequestForSummary() {
    const temp = {};
    const epsId = sessionStorage.getItem('selectedEpisodeId');

    this.staffService
      .getAnyFHIRObjectByCustomQuery(
        'QuestionnaireResponse?identifier=SERVREQ&context=' +
        epsId
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
                      temp['patientFhirId'] = patient['id'];
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

  createEncounterObjectToLinkToEpisodeOfCare($event, item) {
    const encounter = new FHIR.Encounter();
    const episodeOfCareReference = new FHIR.Reference();
    const patientInEpisodeOfCare = new FHIR.Reference();

    episodeOfCareReference.reference = 'EpisodeOfCare/' + sessionStorage.getItem('selectedEpisodeId');
    patientInEpisodeOfCare.reference =
      'Patient/' + this.serviceRequestSummary['patientFhirId'];

    encounter.subject = patientInEpisodeOfCare;
    encounter.episodeOfCare = [episodeOfCareReference];
    encounter.resourceType = 'Encounter';

    const encounterStringified = JSON.stringify(encounter);

    let returnEncounter;
    if (patientInEpisodeOfCare.reference !== null) {
      this.staffService.createEncounter(encounterStringified).subscribe(
        data => {
          returnEncounter = data['id'];
          this.addDocument($event, item, returnEncounter);
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  linkDocumentToChecklist(document, item) {
    const id = document['id'];
    const answer = new FHIR.Answer;
    const reference = new FHIR.Reference;
    reference.reference = 'DocumentReference/' + id;
    answer.valueReference = reference;
    if (document) {
      for (const itemInList of this.documentCheckList['item']) {
        if (itemInList['linkId'] === item) {

          itemInList.answer.push(answer);
          this.staffService.updateDocumentsChecklist(this.documentCheckList['id'], this.documentCheckList).subscribe(
            data => {
              if (data) {
                this.documentCheckList = data;
                this.createCommunicationObjectForCheclistItemUpdate(itemInList);
                this.setupDocumentTable(data);
              }
            }
          );
        }
      }
    }
  }

  saveItemToQResponse() {
    const itemToAdd = new FHIR.Item();
    if (this.checkListItemGroup.get('document').value) {
      itemToAdd.linkId = this.documentCheckList['item'].length + 1;
      itemToAdd.text = this.checkListItemGroup.get('document').value;
      this.documentCheckList['item'].push(itemToAdd);
      this.documentCheckList['status'] = 'stopped';

      this.staffService
        .updateDocumentsChecklist(
          this.documentCheckList['id'],
          JSON.stringify(this.documentCheckList)
        )
        .subscribe(data => {
          if (data) {
            console.log('UPDATED', data);
            this.documentCheckList = data;
            this.changeDocumentListStatus();
          }
        },
          error => {
            console.log(error);
          });
    }
  }

  checkDocStatusViewText() {
    for (const status of this.statusSelectionList) {
      if (this.documentCheckList) {
        if (this.documentCheckList['status'] === status['value']) {
          this.displayDocStatus = status['viewValue'];
        }
      } else {
        if (this.documentCheckList['item'].length < 1) {
          this.displayDocStatus = 'Not-Started';
        }
      }
    }
  }

  changeDocumentListStatus() {
    if (this.documentCheckList) {
      if (this.documentCheckList['status'] !== 'amended') {

        if (this.documentCheckList['item'] && this.documentCheckList['status']) {
          const lengthOfItemArray = this.documentCheckList['item'].length;
          let currentAmountOfAnsweredItems = 0;
          this.documentCheckList['item'].forEach(itemFound => {
            if (itemFound['answer']) {
              currentAmountOfAnsweredItems++;
            }
          });
          if (currentAmountOfAnsweredItems === lengthOfItemArray) {
            this.documentCheckList['status'] = 'completed';
          } else {
            this.documentCheckList['status'] = 'stopped';
          }
          this.staffService.updateDocumentsChecklist(this.documentCheckList['id'], JSON.stringify(this.documentCheckList)).subscribe(
            data => {
              if (data) {
                this.documentCheckList = data;
                this.checkDocStatusViewText();
                this.documentCheckList['item'].forEach(item => {
                  if (item.answer) {
                    item.value = true;
                  } else {
                    item.value = false;
                  }
                });
              }
            }
          );
        }
      }
    }
  }

  // updateCurrentProgress() {
  //   if (this.currentProgressFormGroup.valid) {
  //     if (this.documentCheckList) {
  //       this.documentCheckList['status'] = this.currentProgressFormGroup.get('currentProgress').value;
  //       this.staffService
  //       .updateDocumentsChecklist(
  //         this.documentCheckList['id'],
  //         JSON.stringify(this.documentCheckList)
  //       )
  //       .subscribe(data => {
  //         if (data) {
  //           console.log('UPDATED', data);
  //           this.documentCheckList = data;
  //           this.checkDocStatusViewText();
  //           this.currentProgressFormGroup.reset();
  //         }
  //       },
  //       error => {
  //         console.log(error);
  //       });
  //     }
  //   }
  // }

  changeDocStatusFromActionRequired(incomingFile) {
    this.documentCheckList['status'] = 'stopped';
    if (incomingFile['content']['attachment']['contentType'] !== 'pdf') {
      this.downloadFile(incomingFile);
    } else {
      this.previewFile(incomingFile);
    }
    this.staffService.updateDocumentsChecklist(this.documentCheckList['id'], JSON.stringify(this.documentCheckList)).subscribe(
      data => {
        if (data) {
          this.documentCheckList = data;
          this.changeDocumentListStatus();
          this.documentCheckList['item'].forEach(item => {
            if (item.answer) {
              item.value = true;
            } else {
              item.value = false;
            }
          });
        }
      }
    );
  }

  checkIfAssociatedDocCheckListExists() {
    const epsId = sessionStorage.getItem('selectedEpisodeId');
    this.staffService.getDocumentsChecklist(epsId).subscribe(
      data => {
        console.log(data);
        if (data) {
          if (data['entry']) {
            data['entry'].forEach(element => {
              this.documentCheckList = element['resource'];
              if (!this.documentCheckList['item']) {
                this.documentCheckList['item'] = [];
              }
              if (this.documentCheckList['item']) {
                this.setupDocumentTable(this.documentCheckList);
              }
              this.checkDocStatusViewText();
            });
            //   ();
          } else {
            //     // This scenario means status is In-POGRESS
            this.newDocChecklist();
          }
        }
      },
      error => {
        console.log(error);
      },
      () => {
        this.checkDocStatusViewText();
      }
    );
  }

  newDocChecklist() {
    const epsId = sessionStorage.getItem('selectedEpisodeId');

    const checkListQResponse = new FHIR.QuestionnaireResponse();
    const checklistReference = new FHIR.Reference();
    const checklistContextReference = new FHIR.Reference();
    const checklistIdentifier = new FHIR.Identifier();

    checklistReference.reference = 'Questionnaire/13019';
    checklistContextReference.reference =
      'EpisodeOfCare/' + epsId;
    checklistIdentifier.value = 'RDCL';

    checkListQResponse.identifier = checklistIdentifier;
    checkListQResponse.resourceType = 'QuestionnaireResponse';
    checkListQResponse.questionnaire = checklistReference;
    checkListQResponse.status = 'amended';
    checkListQResponse.context = checklistContextReference;

    this.staffService
      .createDocumentsChecklist(JSON.stringify(checkListQResponse))
      .subscribe(
        data => {
          console.log('POST SUCCESSFUL', data);
          this.documentCheckList = data;
          if (!this.documentCheckList['item']) {
            this.documentCheckList['item'] = [];
          }
        },
        error => {
          console.log(error);
        }
      );
  }

  resetForm() {
    this.docFormGroup.reset();
    console.log(this.docFormGroup);
  }


  setupDocumentTable(data) {
    this.docListForTable = [];
    data['item'].forEach(item => {
      const temp = {};
      this.staffService.getAnyFHIRObjectByReference('/' + item['subject']['reference']).subscribe(
        prac => {
          const practitioner = this.utilService.getNameFromResource(prac);
          temp['addedBy'] = practitioner;
        }
      );
      temp['linkId'] = item['linkId'];
      temp['name'] = item['text'];
      if (item['answer']) {
        item['answer'].forEach(answer => {
          if (answer['valueCoding']) {
            temp['type'] = answer['valueCoding']['code'];
          }
          if (answer['valueDate']) {
            temp['dateAdded'] = answer['valueDate'];
          }
          if (answer['valueReference']) {
            temp['documentReference'] = answer['valueReference']['reference'];
            this.staffService.getAnyFHIRObjectByReference('/' + answer['valueReference']['reference']).subscribe(
              document => {
                if (document) {
                  if (document['authenticator']) {
                    temp['validated'] = true;
                  }
                  temp['dateUploaded'] = this.utilService.getDate(document['indexed']);
                  console.log(temp['dateUploaded']);
                  for (const author of document['author']) {
                    if (author) {
                      console.log(author);
                      this.staffService.getAnyFHIRObjectByReference('/' + author['reference']).subscribe(
                        authorFound => {
                          if (authorFound) {
                            temp['uploadedBy'] = this.utilService.getNameFromResource(authorFound);
                          }
                        }
                      );
                    }
                  }
                }
              }
            );
          }
        });
      }
      this.docListForTable.push(temp);
    });
  }

  addRequiredDocumentItemToChecklist() {
    const item = new FHIR.Item;
    const answer = new FHIR.Answer;
    const time = new FHIR.Answer;
    const subject = new FHIR.Reference;
    item.linkId = this.documentCheckList['item'].length + 1;
    item.text = this.docFormGroup.get('filename').value;

    time.valueDate = new Date();

    answer.valueCoding = new FHIR.Coding;
    answer.valueCoding.code = this.docFormGroup.get('filetype').value;

    item.answer = [answer, time];
    item.subject = subject;
    this.documentCheckList['item'].push(item);

    this.documentCheckList['authored'] = new Date();
    subject.reference = 'Practitioner/' + sessionStorage.getItem('userFHIRID');

    console.log(this.documentCheckList['item']);

    this.staffService.updateDocumentsChecklist(this.documentCheckList['id'], this.documentCheckList).subscribe(
      data => {
        this.createCommunicationObjectForCheclistItemCreation(item);
        this.documentCheckList = data;
        this.setupDocumentTable(this.documentCheckList);
        this.checkDocStatusViewText();
      }
    );
    this.docFormGroup.reset();
  }

  // // Documents Features


  // updateCurrentProgress() {
  //   if (this.currentProgressFormGroup.valid) {
  //     if (this.documentCheckList) {
  //       this.documentCheckList['status'] = this.currentProgressFormGroup.get('currentProgress').value;
  //       this.staffService
  //       .updateDocumentsChecklist(
  //         this.documentCheckList['id'],
  //         JSON.stringify(this.documentCheckList)
  //       )
  //       .subscribe(data => {
  //         if (data) {
  //           console.log('UPDATED', data);
  //           this.documentCheckList = data;
  //           this.checkDocStatusViewText();
  //           this.currentProgressFormGroup.reset();
  //         }
  //       },
  //       error => {
  //         console.log(error);
  //       });
  //     }
  //   }
  // }
  /**
   * This functiom takes in a file, grabs various details relating to the file, and converts it
   * into a DocumentReference FHIR object
   * @param $event File event from browser
   */
  addDocument($event, item, encounterId) {
    const documentReference = new FHIR.DocumentReference();
    const documentReferenceCodeableConcept = new FHIR.CodeableConcept();
    const content = new FHIR.Content();
    const contentAttachment = new FHIR.Attachment();
    const documentReferenceAuthor = new FHIR.Reference();
    const encounterReference = new FHIR.Reference;
    const encounterContext = new FHIR.Context();

    let file;
    let trimmedFile = '';
    let size: number;
    let type;
    const date = this.utilService.getCurrentDate();
    console.log(date);
    const fileList = $event.target.files;
    const reader = new FileReader();
    if (fileList[0]) {
      size = fileList[0].size;
      type = fileList[0].type;
      reader.readAsDataURL(fileList[0]);
    }
    const that = this;
    reader.onloadend = function () {
      file = reader.result;
      trimmedFile = file.split(',').pop();
      documentReference.resourceType = 'DocumentReference';
      contentAttachment.size = size;
      contentAttachment.contentType = type;
      contentAttachment.data = trimmedFile;
      contentAttachment.creation = date;
      contentAttachment.title = item['name'];

      documentReferenceAuthor.reference =
        'Practitioner/' + sessionStorage.getItem('userFHIRID');
      content.attachment = contentAttachment;
      documentReferenceCodeableConcept.text = item['type'];

      encounterReference.reference = 'Encounter/' + encounterId;
      encounterContext.encounter = encounterReference;
      documentReference.indexed = new Date();
      documentReference.author = [documentReferenceAuthor];
      documentReference.type = documentReferenceCodeableConcept;
      documentReference.content = [content];
      documentReference.context = encounterContext;

      if (encounterId !== null) {
        that.staffService.postDataFile(JSON.stringify(documentReference)).subscribe(
          uploadedFile => {
            console.log(uploadedFile);
            if (uploadedFile) {
              that.linkDocumentToChecklist(uploadedFile, item['linkId']);
            }
          }
        );
      }

      return reader.result;
    };

    reader.onerror = function (error) {
      console.log('ERROR: ', error);
    };
  }



  getFileReference(reference) {
    if (reference) {

      this.staffService.getAnyFHIRObjectByReference('/' + reference).subscribe(
        document => {
          this.downloadFile(document);
        }
      );
    }
  }

  downloadFile(incomingFile) {
    const byteCharacters = atob(incomingFile['content'][0]['attachment']['data']);
    const byteNumbers = new Array(byteCharacters.length);
    for (let index = 0; index < byteCharacters.length; index++) {
      byteNumbers[index] = byteCharacters.charCodeAt(index);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: incomingFile['content'][0]['attachment']['contentType']
    });

    if (navigator.msSaveBlob) {
      const filename = incomingFile['fileFullName'];
      navigator.msSaveBlob(blob, filename);
    } else {
      const fileLink = document.createElement('a');
      fileLink.href = URL.createObjectURL(blob);
      fileLink.setAttribute('visibility', 'hidden');
      fileLink.download = incomingFile['content'][0]['attachment']['title'];
      document.body.appendChild(fileLink);
      fileLink.click();
      document.body.removeChild(fileLink);
    }
  }

  previewFile(incomingFile) {
    const byteCharacters = atob(incomingFile['content'][0]['attachment']['data']);
    const byteNumbers = new Array(byteCharacters.length);
    for (let index = 0; index < byteCharacters.length; index++) {
      byteNumbers[index] = byteCharacters.charCodeAt(index);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: incomingFile['content'][0]['attachment']['contentType']
    });
    const filename = incomingFile['content'][0]['attachment']['title'];

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      console.log(filename);
      const fileLink = document.createElement('a');
      fileLink.href = URL.createObjectURL(blob);
      fileLink.name = filename;
      fileLink.target = '_blank';
      fileLink.setAttribute('download', filename);
      window.open(fileLink.href);
    }
  }

  createCommunicationObjectForCheclistItemCreation(item) {
    const communication = new FHIR.Communication();
    const identifier = new FHIR.Identifier();
    const payload = new FHIR.Payload;

    identifier.value = 'DOCUMENT-CHECKLIST-ITEM-' + item['linkId'] + '-' + this.episodeOfCareId;
    communication.resourceType = 'Communication';

    const categoryConcept = new FHIR.CodeableConcept;
    const categoryCoding = new FHIR.Coding;
    categoryCoding.system = 'https://bcip.smilecdr.com/fhir/documentcommunication';
    categoryCoding.code = 'DOCUMENT-CHECKLIST-ITEM-CREATED';

    categoryConcept.coding = [categoryCoding];
    communication.category = [categoryConcept];
    communication.status = 'completed';
    const episodeReference = new FHIR.Reference();
    episodeReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    communication.context = episodeReference;
    communication.identifier = [identifier];
    const annotation = new FHIR.Annotation();
    annotation.time = new Date();

    let authorName = null;
    this.staffService.getPractitionerByID(sessionStorage.getItem('userFHIRID')).subscribe(
      author => {
        authorName = this.utilService.getNameFromResource(author);
        payload.contentString = authorName + ' has added the following required documents item: ' + item['text'];
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

  createCommunicationObjectForCheclistItemUpdate(item) {
    const communication = new FHIR.Communication();
    const identifier = new FHIR.Identifier();
    const episodeReference = new FHIR.Reference();
    const categoryConcept = new FHIR.CodeableConcept;
    const categoryCoding = new FHIR.Coding;
    const payload = new FHIR.Payload;

    identifier.value = 'DOCUMENT-CHECKLIST-ITEM-'
    + item['linkId'] + '-UPDATE-' + this.episodeOfCareId;
    communication.resourceType = 'Communication';

    categoryCoding.system = 'https://bcip.smilecdr.com/fhir/documentcommunication';
    categoryCoding.code = 'DOCUMENT-CHECKLIST-ITEM-UPDATED';

    categoryConcept.coding = [categoryCoding];
    communication.category = [categoryConcept];
    communication.status = 'completed';

    episodeReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    communication.context = episodeReference;
    communication.identifier = [identifier];
    const annotation = new FHIR.Annotation();
    annotation.time = new Date();

    let authorName = null;
    this.staffService.getPractitionerByID(sessionStorage.getItem('userFHIRID')).subscribe(
      author => {
        authorName = this.utilService.getNameFromResource(author);
        payload.contentString = authorName + ' has added the required document for this checklist item at ' +
        this.utilService.getDate(annotation.time);
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

  createCommunicationObjectForItemValidated(item) {
    const communication = new FHIR.Communication();
    const identifier = new FHIR.Identifier();
    const episodeReference = new FHIR.Reference();
    const categoryConcept = new FHIR.CodeableConcept;
    const categoryCoding = new FHIR.Coding;
    const payload = new FHIR.Payload;

    identifier.value = 'DOCUMENT-CHECKLIST-ITEM-'
    + item['linkId'] + '-VALIDATED-' + this.episodeOfCareId;
    communication.resourceType = 'Communication';
    communication.status = 'completed';

    categoryCoding.system = 'https://bcip.smilecdr.com/fhir/documentcommunication';
    categoryCoding.code = 'DOCUMENT-CHECKLIST-ITEM-VALIDATED';

    categoryConcept.coding = [categoryCoding];
    communication.category = [categoryConcept];

    episodeReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    communication.context = episodeReference;
    communication.identifier = [identifier];
    const annotation = new FHIR.Annotation();
    annotation.time = new Date();

    let authorName = null;
    this.staffService.getPractitionerByID(sessionStorage.getItem('userFHIRID')).subscribe(
      author => {
        authorName = this.utilService.getNameFromResource(author);
        payload.contentString = authorName + ' has reviewed the clinical document at  ' +
        this.utilService.getDate(annotation.time);
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





  viewDetailedContext() {
    this.router.navigateByUrl('/staff/work-screen');
  }
}
