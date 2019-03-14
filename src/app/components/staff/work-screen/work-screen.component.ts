import { Component, OnInit, Input } from '@angular/core';
import { StaffService } from '../../../service/staff.service';
import { UtilService } from '../../../service/util.service';
import { UserService } from '../../../service/user.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import * as FHIR from '../../../interface/FHIR';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';

@Component({
  selector: 'app-work-screen',
  templateUrl: './work-screen.component.html',
  styleUrls: ['./work-screen.component.scss']
})
export class WorkScreenComponent implements OnInit {
  @Input() progressBarValue = 0;
  // @Input() otherValue = 100;

  documentChecklistItemsList = [];

  carePlanActivities = [];
  summary = {} as any;
  episodeOfCare = {};
  carePlan = {};
  showTaskForm = false;
  showNoteForm = false;
  showDocForm = false;
  showChecklistForm = false;
  showSelectionOfDocsForm = false;
  showShowDocListField = false;
  showStatusFormGroup = false;
  taskFormGroup: FormGroup;
  noteFormGroup: FormGroup;
  docFormGroup: FormGroup;
  checkListItemGroup: FormGroup;
  selectionOfDocsGroup: FormGroup;
  statusFormGroup: FormGroup;
  currentProgressFormGroup: FormGroup;
  checkListDocObject;
  statusObject;
  episodeOfCareId = '';
  practitioners = [];
  practitionersWithId = [];
  history = [];
  historyToDisplay = [];
  communication = {};
  showNewTool = false;
  activeTab = 'all';
  showOnlyTasks = false;
  showOnlyNotes = false;
  showOnlyDocs = false;
  collapseFlag = false;
  displayDocStatus = 'WAITING';
  encounterd;
  currentPractitionerFHIRIDInSession;

  dependentList = [];
  clinicalQuestionnaireArray = [];
  documentsList = [];
  uploadedDocument;
  serviceRequestInfoObject;

  assignedAdmin = '';
  assignedClinician = {};
  selectedClinician = {};
  clinicians = [];
  cliniciansWithId = [];
  showClinicianButtons = false;
  showClinicalFunctions = false;
  clinicalAssignmentTask = {};
  showSpinner = false;
  fileTypeList = [
    { value: 'ADMINISTRATIVE', viewValue: 'ADMINISTRATIVE' },
    { value: 'CLINICAL', viewValue: 'CLINICAL' },
    { value: 'INVOICE', viewValue: 'INVOICE' },
    { value: 'PSOHP-FORM', viewValue: 'PSOHP-FORM' },
    { value: 'OTHER', viewValue: 'OTHER' }
  ];

  assessmentType = [
    { value: 'IMMUNIZATION', viewValue: 'Immunization' },
    { value: 'AUDIOGRAM', viewValue: 'Audiogram' },
    { value: 'TURBTEST', viewValue: 'Turberculosis' }
  ];

  statusSelectionList = [
    { value: 'stopped', viewValue: 'WAITING' },
    { value: 'amended', viewValue: 'ACTION-REQUIRED' },
    { value: 'in-progress', viewValue: 'IN-PROGRESS' },
  ];

  constructor(
    private staffService: StaffService,
    private utilService: UtilService,
    private formBuilder: FormBuilder,
    private oAuthService: OAuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {


    this.currentProgressFormGroup = this.formBuilder.group({
      currentProgress: new FormControl('')
    });
    this.currentPractitionerFHIRIDInSession = sessionStorage.getItem(
      'userFHIRID'
    );
    if (sessionStorage.getItem('userRole') === 'clinician') {
      this.showClinicalFunctions = true;
    }
    this.episodeOfCareId = sessionStorage.getItem('selectedEpisodeId');
    this.userService.fetchCurrentRole();
    this.staffService.getAllPractitioners().subscribe(
      data => {
        this.subscribePractitioners(data);
        this.fetchAllClinicians();
        this.fetchAllData();
        this.loadFilesRelatedToWorkOrder();
      },
      error => console.error(error)
    );
    this.checkIfAssociatedDocCheckListExists();
    this.checkIfAssociatedStatusListExists();
  }


  checkDocListStatus() {
    let counter = 0;
    let lengthOfItems = 0;
    if (this.checkListDocObject) {
      for (const item in this.checkListDocObject['item']) {
        if (item['answer']) {
          lengthOfItems = item.length;
          for (const answer in item['answer']) {
            if (answer['valueBoolean'] === true) {
              counter ++;
              if (counter === lengthOfItems) {
                console.log('they match')
                this.checkListDocObject['status'] = 'in-progress';
                this.staffService.updateDocumentsChecklist(
                  this.checkListDocObject['id'],
                  JSON.stringify(this.checkListDocObject)).subscribe(
                    data => {
                      if (data) {
                        this.checkListDocObject = data;
                        for (const status of this.statusSelectionList) {
                          if (status['value'] === this.checkListDocObject['status']) {
                            this.displayDocStatus = status['viewValue'];
                          }
                        }
                      }
                    }
                  );
              }
            }
          }
        }
      }
    }

   
  }

  // ngOnDestroy() {
  //   sessionStorage.removeItem('selectedEpisodeId');
  // }

  fetchAllData() {
    this.staffService
      .getEpisodeOfCareAndRelatedData(this.episodeOfCareId)
      .subscribe(data => {
        this.processResponse(data);
        this.displayAll();
      });
  }

  fetchAllClinicians() {
    this.staffService.getAllClinicians().subscribe(data => {
      if (data['entry']) {
        data['entry'].forEach(element => {
          const clinician = element['resource'];
          this.clinicians.push({
            id: clinician['id'],
            name: this.utilService.getNameFromResource(clinician)
          });
          this.cliniciansWithId[clinician.id] = clinician;
        });
        this.fetchAssignedClinician();
      }
    });
  }

  fetchAssignedClinician() {
    this.staffService
      .getClinicianAssignedToEpisode(this.episodeOfCareId)
      .subscribe(data => {
        if (data['total'] > 0) {
          data['entry'].forEach(element => {
            const task = element['resource'];
            if (task['status'] === 'ready') {
              this.clinicalAssignmentTask = task;
              const clinicianId = this.utilService.getIdFromReference(
                task.owner.reference
              );
              const clinician = this.cliniciansWithId[clinicianId];
              this.assignedClinician = {
                id: clinician.id,
                name: this.utilService.getNameFromResource(clinician)
              };
              this.selectedClinician = this.assignedClinician;
            } else {
              console.log('No assigned clinician');
            }
          });
        }
      });
  }

  compareClinicians(clinician1, clinician2): boolean {
    return clinician1 && clinician2 && clinician1.name === clinician2.name;
  }

  assignClinicianToEpisodeOfCare() {
    // When assigning a Clinician to an episode of care, a Task is created with the status set to ready
    // When reassigning an Episode of Care, the previous Task's status needs to be set to completed
    if (this.assignedClinician['id']) {
      this.releaseClinicanFromEpisodeOfCare();
    } else {
      this.createTaskToAssignClinician();
    }
  }

  releaseClinicanFromEpisodeOfCare() {
    console.log(this.clinicalAssignmentTask);
    this.clinicalAssignmentTask['status'] = 'completed';
    this.staffService
      .updateTask(
        this.clinicalAssignmentTask['id'],
        JSON.stringify(this.clinicalAssignmentTask)
      )
      .subscribe(data => {
        console.log(data);
        this.createTaskToAssignClinician();
      });
  }

  createTaskToAssignClinician() {
    this.clinicalAssignmentTask = {};
    const task = new FHIR.Task();
    const episodeOfCareReference = new FHIR.Reference();
    episodeOfCareReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    task.context = episodeOfCareReference;

    const requester = new FHIR.Requester();
    const requesterReference = new FHIR.Reference();
    requesterReference.reference =
      'Practitioner/' + this.currentPractitionerFHIRIDInSession;
    requester.agent = requesterReference;
    task.requester = requester;
    task.authoredOn = this.utilService.getCurrentDate();

    const ownerReference = new FHIR.Reference();
    ownerReference.reference = 'Practitioner/' + this.selectedClinician['id'];
    task.owner = ownerReference;
    task.description = 'Clinical assignment';

    task.intent = 'plan';
    task.status = 'ready';
    task.resourceType = 'Task';

    const code = new FHIR.Coding();
    code.code = 'clinician';
    const coding = new FHIR.CodeableConcept();
    coding.coding = new Array<FHIR.Coding>();
    coding.coding.push(code);
    task.code = coding;

    console.log(task);

    this.staffService.saveTask(JSON.stringify(task)).subscribe(savedTask => {
      this.clinicalAssignmentTask = savedTask;
      this.showClinicianButtons = false;
      this.assignedClinician = this.selectedClinician;
      this.processClinicalAssignmentForHistory(savedTask);
      this.displayAll();
      console.log(savedTask);
      console.log(this.assignedClinician);
      console.log(this.selectedClinician);
    });
  }

  processResponse(data) {
    this.history = [];
    if (data && data.entry) {
      data.entry.forEach(element => {
        if (element.resource.resourceType === 'CarePlan') {
          this.carePlan = element.resource;
          this.carePlan['activity'].forEach(activity => {
            this.processCarePlanActivityForHistory(activity);
          });
          this.processCarePlanForDisplay();
        } else if (element.resource.resourceType === 'Patient') {
          this.processPatientForSummary(element.resource);
        } else if (element.resource.resourceType === 'QuestionnaireResponse') {
          this.serviceRequestInfoObject = element['resource'];
          console.log(element.resource);
          if (element['resource']['identifier']) {
            if (
              element['resource']['identifier']['value'].includes('SERVREQ')
            ) {
              this.processQuestionnaireResponseForSummary(element.resource);
            }
          }
        } else if (element.resource.resourceType === 'EpisodeOfCare') {
          this.episodeOfCare = element.resource;
          this.getCurrentlyAssignedUsername();
        } else if (element.resource.resourceType === 'Task') {
          this.processTaskForHistory(element.resource);
        } else if (element.resource.resourceType === 'Communication') {
          const communication = element.resource;
          if (communication['identifier']) {
            if (
              communication['identifier'][0]['value'] !==
              'CANCEL-REQUEST-' + this.episodeOfCareId
            ) {
              if (communication.note) {
                communication.note.forEach(note => {
                  this.processNoteForHistory(note);
                });
              }
            }
          }
        }
      });
    }
  }

  getCurrentlyAssignedUsername() {
    const userId = this.utilService.getIdFromReference(
      this.episodeOfCare['careManager']['reference']
    );
    this.assignedAdmin = this.utilService.getNameFromResource(
      this.practitionersWithId[userId]
    );
  }

  processCarePlanForDisplay() {
    this.carePlanActivities = [];
    this.carePlan['activity'].forEach(activity => {
      const temp = {};
      temp['description'] = activity['detail']['description'];
      temp['status'] = activity['detail']['status'];
      if (activity['detail']['statusReason']) {
        temp['statusChanger'] = activity['detail']['statusReason'];
      }
      if (activity['detail']['status'] === 'completed') {
        temp['value'] = true;
      } else {
        temp['value'] = false;
      }

      this.carePlanActivities.push(temp);
    });
  }

  sortHistory() {
    this.historyToDisplay.sort(function(a, b) {
      if (a['lastUpdated'] && b['lastUpdated']) {
        return (
          new Date(b['lastUpdated']).getTime() -
          new Date(a['lastUpdated']).getTime()
        );
      }
    });
  }

  processPatientForSummary(patient) {
    this.summary['patientFHIRID'] = patient['id'];
    this.summary['clientName'] = this.utilService.getNameFromResource(patient);
    this.summary['clientDOB'] = patient['birthDate'];
    patient.extension.forEach(extension => {
      if (extension.url === 'https://bcip.smilecdr.com/fhir/workplace') {
        this.summary['clientDepartment'] = extension.valueString;
      } else if (extension.url === 'https://bcip.smilecdr.com/fhir/jobtile') {
        this.summary['jobTitle'] = extension.valueString;
      } else if (extension.url === 'https://bcip.smilecdr.com/fhir/branch') {
        this.summary['clientBranch'] = extension.valueString;
      } else if (
        extension.url === 'https://bcip.smilecdr.com/fhir/dependentlink'
      ) {
        this.summary['dependentLink'] = extension.valueString;
        this.processListOfDependents(this.summary['dependentLink']);
      }
    });
    // this.createEncounterObject();
  }

  processQuestionnaireResponseForSummary(questionnaireResponse) {
    questionnaireResponse.item.forEach(item => {
      if (item.text === 'PSOHP Service') {
        this.summary['psohpService'] = item['answer'][0]['valueString'];
      } else if (item.text === 'Submitting Department') {
        this.summary['submittingDepartment'] = item['answer'][0]['valueString'];
      } else if (item.text === 'Receiving Department') {
        this.summary['receivingDepartment'] = item['answer'][0]['valueString'];
      } else if (item.text === 'OHAG Occupation') {
        this.summary['ohagOccupation'] = item['answer'][0]['valueString'];
      } else if (item.text === 'OHAG Environmental Modifier') {
        this.summary['ohagEnvironmentalModifier'] =
          item['answer'][0]['valueString'];
      }
    });
    console.log(this.summary);
  }

  processTaskForHistory(task) {
    if (task['intent'] !== 'plan') {
      const temp = {};
      temp['type'] = 'task';
      temp['status'] = task['status'];
      temp['title'] = 'Task: ' + task['description'];
      if (temp['note']) {
        temp['note'] = task['note'][0]['text'];
      }
      if (task['requester']) {
        const requesterId = this.utilService.getIdFromReference(
          task['requester']['agent']['reference']
        );
        if (this.practitionersWithId[requesterId]) {
          temp['assignor'] = this.utilService.getNameFromResource(
            this.practitionersWithId[requesterId]
          );
        } else if (this.cliniciansWithId[requesterId]) {
          temp['assignor'] = this.utilService.getNameFromResource(
            this.cliniciansWithId[requesterId]
          );
        }
      }
      if (task['authoredOn']) {
        temp['dateCreated'] = task['authoredOn'];
      }
      const practitionerId = this.utilService.getIdFromReference(
        task['owner']['reference']
      );
      temp['assignee'] = this.utilService.getNameFromResource(
        this.practitionersWithId[practitionerId]
      );
      temp['lastUpdated'] = task['meta']['lastUpdated'];
      temp['date'] = this.utilService.getDateTime(task['meta']['lastUpdated']);
      temp['id'] = task['id'];
      if (task['status'] === 'completed') {
        temp['dateCompleted'] = this.utilService.getDate(
          task['meta']['lastUpdated']
        );
      }
      this.history.push(temp);
    } else {
      this.processClinicalAssignmentForHistory(task);
    }
  }

  processClinicalAssignmentForHistory(task) {
    console.log(task);
    if (task['intent'] === 'plan') {
      const temp = {};
      temp['title'] = 'Clinical Assignment';
      temp['type'] = 'task';
      temp['intent'] = 'plan';
      if (task['status'] === 'ready') {
        temp['status'] = 'Assigned - Waiting';
      } else {
        temp['status'] = 'completed';
      }
      if (task['requester']) {
        const requesterId = this.utilService.getIdFromReference(
          task['requester']['agent']['reference']
        );
        if (this.practitionersWithId[requesterId]) {
          temp['assignor'] = this.utilService.getNameFromResource(
            this.practitionersWithId[requesterId]
          );
        } else if (this.cliniciansWithId[requesterId]) {
          temp['assignor'] = this.utilService.getNameFromResource(
            this.cliniciansWithId[requesterId]
          );
        }
      }
      if (task['authoredOn']) {
        temp['dateCreated'] = task['authoredOn'];
      }
      const practitionerId = this.utilService.getIdFromReference(
        task['owner']['reference']
      );
      temp['assignee'] = this.utilService.getNameFromResource(
        this.practitionersWithId[practitionerId]
      );
      temp['lastUpdated'] = task['meta']['lastUpdated'];
      temp['date'] = this.utilService.getDateTime(task['meta']['lastUpdated']);
      temp['id'] = task['id'];
      if (task['status'] === 'completed') {
        temp['dateCompleted'] = this.utilService.getDate(
          task['meta']['lastUpdated']
        );
      }
      if (task['note']) {
        temp['closingNotes'] = task['note'][0]['text'];
      } else {
        temp['showActivity'] = false;
        temp['closingNotes'] = '';
      }
      console.log(temp);
      this.history.push(temp);
    }
  }

  onChecklistChange(index) {
    const indexArray = [];
    indexArray.push(index);
    if (this.carePlan) {
      console.log(this.carePlan);
      const annotation = new FHIR.Annotation();
      annotation.time = new Date();
      if (this.carePlanActivities[index]['value']) {
        annotation.text =
          'COMPLETED: User ' +
          this.fetchCurrentUsername() +
          ' marked item ' +
          this.carePlan['activity'][index]['detail']['description'] +
          ' as Completed';
        this.carePlan['activity'][index]['detail']['status'] = 'completed';
        // this.onCheckListChangeStatus(this.carePlanActivities[index]);
      } else {
        annotation.text =
          'INCOMPLETE: User ' +
          this.fetchCurrentUsername() +
          ' marked item ' +
          this.carePlan['activity'][index]['detail']['description'] +
          ' as Incomplete';
        this.carePlan['activity'][index]['detail']['status'] = 'in-progress';
        console.log(this.carePlan['activity'][index]);
        // this.onCheckListChangeStatus(this.carePlanActivities[index]);
      }
      if (this.carePlan['activity'][index]['progress']) {
        this.carePlan['activity'][index]['progress'].push(annotation);
      } else {
        this.carePlan['activity'][index]['progress'] = new Array<
          FHIR.Annotation
        >();
        this.carePlan['activity'][index]['progress'].push(annotation);
      }
      this.staffService
        .updateCarePlan(this.carePlan['id'], JSON.stringify(this.carePlan))
        .subscribe(data => {
          console.log(data['activity'][index]);
          // this.processRecentCarePlanActivityForHistory(data['activity'][index]);
          this.carePlan = data;
          this.processCarePlanForDisplay();
          this.displayAll();
        });
    }
  }

  // TODO - revisit functionality with updated logic after March 1st
  // onCheckListChangeStatus(cheklistItem) {

  //   const newAnswer = new FHIR.Answer;
  //   const itemTime = new FHIR.Answer;
  //   const onHoldAnswer = new FHIR.Answer;

  //   const statusArray =
  //   ['on-hold', 'waiting', 'validated', 'scheduled', 'assigned', 'work-completed'];

  //   itemTime.valueDate = this.utilService.getCurrentDate();
  //   newAnswer.valueBoolean = cheklistItem['value'];

  //   onHoldAnswer.valueBoolean = !cheklistItem['value'];
  //   // onHoldAnswer.valueDate = this.utilService.getCurrentDate();

  //   if (statusArray.indexOf(cheklistItem['statusChanger']) > -1 ) {
  //     if (cheklistItem['statusChanger'] === 'on-hold') {
  //       const onHoldFound = this.statusObject['item'].find(item => {
  //         return item['text'].toLowerCase() === 'on-hold';
  //       });
  //       if (!onHoldFound) {
  //         const onHoldItem = new FHIR.Item;
  //         onHoldItem.linkId = '0';
  //         onHoldItem.text = 'On-Hold';
  //         onHoldItem.answer = [onHoldAnswer, itemTime];
  //       }
  //       this.statusObject['item'].forEach(item => {
  //         if (item['text'].toLowerCase() === 'on-hold' ) {
  //             item['answer'] = [onHoldAnswer, itemTime];
  //         } else {
  //           const falseAnswer = new FHIR.Answer;
  //           falseAnswer.valueBoolean = false;
  //           item['answer'] = [falseAnswer];
  //         }
  //       });
  //     }

  //     if (cheklistItem['statusChanger'] !== 'on-hold') {
  //       const onHoldFound = this.statusObject['item'].find(item => {
  //         console.log('checking on hold status ', item['text'].toLowerCase() !== 'on-hold');
  //         return item['text'].toLowerCase() !== 'on-hold';
  //       });
  //       // if (!onHoldFound) {
  //       //   const onHoldItem = new FHIR.Item;
  //       //   onHoldItem.linkId = '0';
  //       //   onHoldItem.text = this.titleCase.transform(cheklistItem['statusChanger']);
  //       //   onHoldItem.answer = [newAnswer, itemTime];
  //       // }
  //       this.statusObject['item'].forEach(item => {
  //         if (item['text'].toLowerCase() == cheklistItem['statusChanger'] ) {
  //             item['answer'] = [newAnswer, itemTime];
  //         } else {
  //           const falseAnswer = new FHIR.Answer;
  //           falseAnswer.valueBoolean = false;
  //           item['answer'] = [falseAnswer];
  //         }
  //       });
  //     }
  //   }

  //   this.staffService.updateStatusList(this.statusObject['id'], JSON.stringify(this.statusObject)).subscribe(
  //     data => {
  //       console.log('UPDATED', data);
  //       this.statusObject = data;
  //     }
  //   );
  // }

  processListOfDependents(patientLinkId) {
    this.staffService
      .getAnyFHIRObjectByReference(
        '/Patient?dependentlink=' + patientLinkId + '&employeetype=Dependent'
      )
      .subscribe(
        data => {
          if (data) {
            if (data['total'] > 0) {
              data['entry'].forEach(element => {
                const individualEntry = element['resource'];
                const temp = {};
                temp['dep_clientName'] = this.utilService.getNameFromResource(
                  individualEntry
                );
                temp['dep_id'] = individualEntry['id'];
                temp['dep_clientDOB'] = individualEntry['birthDate'];
                this.dependentList.push(temp);
              });
            }
          }
        },
        error => {
          console.log(error);
        }
      );
  }

  enableStatusFormGroup() {
    this.showStatusFormGroup = !this.showStatusFormGroup;
    this.statusFormGroup = this.formBuilder.group({
      status: new FormControl(''),
      statusNote: new FormControl('')
    });
  }

  changeStatusToSelected() {
    const itemAnswer = new FHIR.Answer();
    const itemTime = new FHIR.Answer();
    const itemReason = new FHIR.Answer();

    const selectedStatus = this.statusFormGroup.get('status').value;

    itemTime.valueDate = this.utilService.getCurrentDate();
    itemReason.valueString = this.statusFormGroup.get('statusNote').value;
    this.statusObject['item'].forEach(element => {
      if (element['text'] === selectedStatus) {
        itemAnswer.valueBoolean = true;

        element['answer'] = [];
        element['answer'][0] = itemAnswer;
        element['answer'][1] = itemTime;
        element['answer'][2] = itemReason;
        console.log('matched', element['answer']);
      }
      if (element['text'] !== selectedStatus) {
        element['answer'] = [];
        // itemAnswer.valueBoolean = false;
        // element['answer'][0] = itemAnswer;
        // element['answer'][1] = itemTime;
        console.log('unmatched', element['answer']);
      }
    });
    this.showStatusFormGroup = !this.showStatusFormGroup;
    this.staffService
      .updateStatusList(
        this.statusObject['id'],
        JSON.stringify(this.statusObject)
      )
      .subscribe(data => {
        console.log(data);
        this.statusObject = data;
      });
  }

  captureStatusReasonInput(event) {
    return event;
  }

  processCarePlanActivityForHistory(carePlanActivity) {
    if (carePlanActivity['progress']) {
      carePlanActivity['progress'].forEach(element => {
        const temp = {};
        temp['type'] = 'checklistItem';
        temp['status'] = carePlanActivity['detail']['status'];
        if (carePlanActivity['detail']['statusReason']) {
          temp['statusChanger'] = carePlanActivity['detail']['statusReason'];
        }
        temp['title'] = 'Item: ' + carePlanActivity['detail']['description'];
        temp['note'] = element['text'];
        temp['lastUpdated'] = element['time'];
        this.history.push(temp);
      });
    }
  }

  processRecentCarePlanActivityForHistory(carePlanActivity) {
    if (carePlanActivity['progress']) {
      const progressArray = carePlanActivity['progress'];
      const recentActivity = progressArray[progressArray.length - 1];
      const temp = {};
      temp['type'] = 'checklistItem';
      temp['status'] = carePlanActivity['detail']['status'];
      if (carePlanActivity['detail']['statusReason']) {
        temp['statusChanger'] = carePlanActivity['detail']['statusReason'];
      }
      temp['title'] = 'Item: ' + carePlanActivity['detail']['description'];
      temp['note'] = recentActivity['text'];
      temp['lastUpdated'] = recentActivity['time'];
      this.history.push(temp);
    }
  }

  processNoteForHistory(communicationItem) {
    const temp = {};
    temp['type'] = 'note';
    if (communicationItem['id']) {
      temp['title'] = 'Note: ' + communicationItem['id'];
    } else {
      temp['title'] = 'Note';
    }
    if (communicationItem['authorReference']) {
      const authorId = this.utilService.getIdFromReference(
        communicationItem['authorReference']['reference']
      );
      if (this.practitionersWithId[authorId]) {
        temp['author'] = this.utilService.getNameFromResource(
          this.practitionersWithId[authorId]
        );
      } else {
        temp['author'] = this.utilService.getNameFromResource(
          this.cliniciansWithId[authorId]
        );
      }
    }
    temp['note'] = communicationItem.text;
    temp['lastUpdated'] = communicationItem.time;
    temp['dateCreated'] = this.utilService.getDate(communicationItem.time);
    this.history.push(temp);
  }

  openTaskForm() {
    this.showTaskForm = true;
    this.showNoteForm = false;
    this.showNewTool = false;
    this.showDocForm = false;
    this.taskFormGroup = this.formBuilder.group({
      description: new FormControl(''),
      assignTo: new FormControl(''),
      instruction: new FormControl('')
    });
  }

  openDocForm() {
    this.showDocForm = true;
    this.showTaskForm = false;
    this.showNoteForm = false;
    this.showNewTool = false;
    this.docFormGroup = this.formBuilder.group({
      filename: new FormControl(''),
      filetype: new FormControl(''),
      checkListItem: new FormControl(''),
      instruction: new FormControl('')
      // instruction: new FormControl('')
    });
  }

  openNoteForm() {
    this.showNoteForm = true;
    this.showDocForm = false;
    this.showTaskForm = false;
    this.showNewTool = false;
    this.noteFormGroup = this.formBuilder.group({
      title: new FormControl(''),
      note: new FormControl('')
    });
    this.staffService
      .getCommunicationRelatedToEpisodeOfCare(this.episodeOfCareId)
      .subscribe(data => {
        if (data['entry']) {
          this.communication = data['entry'][0]['resource'];
        } else {
          this.createCommunicationObject();
        }
      });
  }

  saveNotes() {
    const annotation = new FHIR.Annotation();
    const authorReference = new FHIR.Reference();
    authorReference.reference = 'Practitioner/' + sessionStorage;

    annotation.authorReference = authorReference;
    annotation.id = this.noteFormGroup.get('title').value;
    annotation.time = new Date();
    annotation.text = this.noteFormGroup.get('note').value;
    if (!this.communication['note']) {
      this.communication['note'] = new Array<FHIR.Annotation>();
    }
    this.communication['note'].push(annotation);
    this.staffService
      .updateCommunication(
        this.communication['id'],
        JSON.stringify(this.communication)
      )
      .subscribe(data => {
        this.showNoteForm = false;
        // This needs to use the date coming from the server, in this case, the var 'data'
        this.processNoteForHistory(annotation);
        if (this.showOnlyNotes) {
          this.displayOnlyNotes();
        } else {
          this.displayAll();
        }
      });
  }

  createCommunicationObject() {
    const communication = new FHIR.Communication();
    const identifier = new FHIR.Identifier();

    identifier.value = 'NOTE-' + this.episodeOfCareId;
    communication.resourceType = 'Communication';

    const episodeReference = new FHIR.Reference();
    episodeReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    communication.context = episodeReference;
    communication.identifier = [identifier];
    const annotation = new FHIR.Annotation();
    annotation.time = new Date();
    // Fetch from html
    communication.note = new Array<FHIR.Annotation>();
    this.staffService
      .createCommunication(JSON.stringify(communication))
      .subscribe(data => {
        this.communication = data;
        console.log(data);
      });
  }

  subscribePractitioners(data) {
    data.entry.forEach(element => {
      const individualEntry = element.resource;
      this.practitionersWithId[individualEntry.id] = individualEntry;
      this.practitioners.push(individualEntry);
    });
  }

  saveTask() {
    const task = new FHIR.Task();
    const identifier = new FHIR.Identifier();
    const context = new FHIR.Reference();
    const taskOwner = new FHIR.Reference();
    const taskAnnotation = new FHIR.Annotation();

    const requester = new FHIR.Requester();
    const requesterReference = new FHIR.Reference();

    identifier.value = 'WORKORDERTASK';
    requesterReference.reference =
      'Practitioner/' + sessionStorage.getItem('userFHIRID');
    requester.agent = requesterReference;
    task.requester = requester;
    task.authoredOn = this.utilService.getCurrentDate();
    taskAnnotation.text = this.taskFormGroup.get('instruction').value;
    taskOwner.reference =
      'Practitioner/' + this.taskFormGroup.get('assignTo').value;
    context.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    task.description = this.taskFormGroup.get('description').value;
    task.status = 'in-progress';
    task.intent = 'order';
    task.priority = 'routine';
    task.context = context;
    task.owner = taskOwner;
    task.note = [taskAnnotation];
    task.resourceType = 'Task';
    task.identifier = [identifier];
    this.staffService.saveTask(JSON.stringify(task)).subscribe(data => {
      this.showTaskForm = false;
      this.processTaskForHistory(data);
      if (this.showOnlyTasks) {
        this.displayOnlyTasks();
      } else {
        this.displayAll();
      }
    });
  }

  fetchCurrentUsername() {
    return this.oAuthService.getIdentityClaims()['name'];
  }

  displayAll() {
    this.showOnlyNotes = false;
    this.showOnlyTasks = false;
    this.showOnlyDocs = false;
    this.historyToDisplay = [];
    this.historyToDisplay = this.history;
    this.sortHistory();
  }

  displayOnlyTasks() {
    this.showOnlyNotes = false;
    this.showOnlyTasks = true;
    this.showOnlyDocs = false;
    this.historyToDisplay = [];
    this.history.forEach(item => {
      if (item['type'] === 'task') {
        this.historyToDisplay.push(item);
      }
    });
    this.sortHistory();
  }

  displayOnlyDocs() {
    this.showOnlyNotes = false;
    this.showOnlyDocs = true;
    this.showOnlyTasks = false;
    this.historyToDisplay = [];
    this.history.forEach(item => {
      if (item['type'] === 'doc') {
        this.historyToDisplay.push(item);
      }
    });
    this.sortHistory();
  }
  displayOnlyNotes() {
    this.showOnlyNotes = true;
    this.showOnlyDocs = false;
    this.showOnlyTasks = false;
    this.historyToDisplay = [];
    this.history.forEach(item => {
      if (item['type'] === 'note') {
        this.historyToDisplay.push(item);
      }
    });
    this.sortHistory();
  }

  completeClinicalAssignment(item) {
    const taskAnnotation = new FHIR.Annotation();
    taskAnnotation.text = item.closingNotes;
    this.clinicalAssignmentTask['note'] = [taskAnnotation];
    this.clinicalAssignmentTask['status'] = 'completed';
    this.staffService
      .updateTask(
        this.clinicalAssignmentTask['id'],
        JSON.stringify(this.clinicalAssignmentTask)
      )
      .subscribe(task => {
        this.assignedClinician = {};
        this.selectedClinician = {};
        let length = this.history.length;
        while (length--) {
          if (this.history[length]['id'] === task['id']) {
            this.history.splice(length, 1);
          }
        }
        this.processClinicalAssignmentForHistory(task);
        this.displayAll();
      });
  }

  completeTask(index) {
    const item = this.historyToDisplay[index];
    this.staffService.getTaskByID(item.id).subscribe(task => {
      task['status'] = 'completed';
      this.staffService
        .updateTask(task['id'], JSON.stringify(task))
        .subscribe(updatedTask => {
          task['status'] = 'completed';
          this.history.forEach(element => {
            if (element['id'] === item['id']) {
              element['status'] = 'completed';
            }
          });
          if (this.showOnlyTasks) {
            this.displayOnlyTasks();
          } else {
            this.displayAll();
          }
        });
    });
  }

  createEncounterObjectToLinkToEpisodeOfCare() {
    const encounter = new FHIR.Encounter();
    const episodeOfCareReference = new FHIR.Reference();
    const patientInEpisodeOfCare = new FHIR.Reference();

    episodeOfCareReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    patientInEpisodeOfCare.reference =
      'Patient/' + this.summary['patientFHIRID'];

    encounter.subject = patientInEpisodeOfCare;
    encounter.episodeOfCare = [episodeOfCareReference];
    encounter.resourceType = 'Encounter';

    const encounterStringified = JSON.stringify(encounter);

    if (patientInEpisodeOfCare.reference !== null) {
      this.staffService.createEncounter(encounterStringified).subscribe(
        data => {
          this.postDocumentObject(data['id']);
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  setupAuthorNameForDisplay() {
    this.documentsList.forEach(docObject => {
      if (docObject['author']) {
        if (docObject['author'].toLowerCase().includes('practitioner')) {
          this.staffService
            .getAnyFHIRObjectByReference('/' + docObject['author'])
            .subscribe(
              data => {
                docObject['author'] = this.utilService.getNameFromResource(
                  data
                );
              },
              error => {
                console.log(error);
              }
            );
        }
      }
    });
  }

  checkIfAssociatedStatusListExists() {
    this.staffService.getStatusList(this.episodeOfCareId).subscribe(data => {
      if (data) {
        if (data['total'] === 0) {
          console.log('nothing here, creating status skeleton');
          this.newStatusList();
        } else {
          data['entry'].forEach(entry => {
            this.statusObject = entry['resource'];
          });
        }
      }
    });
  }

  newStatusList() {
    const statusQResponse = new FHIR.QuestionnaireResponse();
    const statusReference = new FHIR.Reference();
    const statusContextReference = new FHIR.Reference();
    const statusIdentifier = new FHIR.Identifier();
    const statusItemOne = new FHIR.Item();
    const statusItemTwo = new FHIR.Item();
    const statusItemThree = new FHIR.Item();
    const statusItemFour = new FHIR.Item();
    const statusItemFive = new FHIR.Item();
    const statusItemSix = new FHIR.Item();
    const statusItemSeven = new FHIR.Item();
    const statusItemAnswer = new FHIR.Answer();

    statusItemAnswer.valueBoolean = false;

    statusItemOne.linkId = '1';
    statusItemOne.text = 'Validated';
    // statusItemOne.answer = [statusItemAnswer];

    statusItemTwo.linkId = '2';
    statusItemTwo.text = 'Scheduled';
    // statusItemTwo.answer = [statusItemAnswer];

    statusItemThree.linkId = '3';
    statusItemThree.text = 'Assigned';
    // statusItemThree.answer = [statusItemAnswer];

    statusItemFour.linkId = '4';
    statusItemFour.text = 'Work-Completed';
    // statusItemFour.answer = [statusItemAnswer];

    statusItemFive.linkId = '5';
    statusItemFive.text = 'Closed';
    // statusItemFive.answer = [statusItemAnswer];

    statusItemSix.linkId = '0';
    statusItemSix.text = 'On-Hold';
    // statusItemSix.answer = [statusItemAnswer];
    statusItemAnswer.valueBoolean = true;

    statusItemSeven.linkId = '6';
    statusItemSeven.text = 'Waiting';
    statusItemSeven.answer = [statusItemAnswer];

    statusReference.reference = 'Questionnaire/13064';
    statusContextReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    statusIdentifier.value = 'STATUS';

    statusQResponse.resourceType = 'QuestionnaireResponse';
    statusQResponse.identifier = statusIdentifier;
    statusQResponse.questionnaire = statusReference;
    statusQResponse.status = 'in-progress';
    statusQResponse.context = statusContextReference;
    statusQResponse.item = [
      statusItemOne,
      statusItemTwo,
      statusItemThree,
      statusItemFour,
      statusItemFive,
      statusItemSix,
      statusItemSeven
    ];

    console.log(statusQResponse);

    this.staffService
      .createStatusList(JSON.stringify(statusQResponse))
      .subscribe(data => {
        console.log('POST SUCCESSFUL', data);
        this.statusObject = data;
      });
  }

  /* Documents Functions */

  checkIfAssociatedDocCheckListExists() {
    this.staffService.getDocumentsChecklist(this.episodeOfCareId).subscribe(
      data => {
        if (data) {
          if (data['entry']) {
            data['entry'].forEach(element => {
              this.checkListDocObject = element['resource'];
              // this.determineWorkOrderStatus(this.checkListDocObject);
              for (const status of this.statusSelectionList) {
                if (status['value'] === this.checkListDocObject['status']) {
                  this.displayDocStatus = status['viewValue'];
                }
              }
              if (!this.checkListDocObject['item']) {
                this.checkListDocObject['item'] = [];
              }
              this.checkDocListStatus();

            });
          } else {
            this.newDocChecklist();
          }
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  newDocChecklist() {
    const checkListQResponse = new FHIR.QuestionnaireResponse();
    const checklistReference = new FHIR.Reference();
    const checklistContextReference = new FHIR.Reference();
    const checklistIdentifier = new FHIR.Identifier();

    checklistReference.reference = 'Questionnaire/13019';
    checklistContextReference.reference =
      'EpisodeOfCare/' + this.episodeOfCareId;
    checklistIdentifier.value = 'RDCL';

    checkListQResponse.identifier = checklistIdentifier;
    checkListQResponse.resourceType = 'QuestionnaireResponse';
    checkListQResponse.questionnaire = checklistReference;
    checkListQResponse.status = 'in-progress';
    checkListQResponse.context = checklistContextReference;

    this.staffService
      .createDocumentsChecklist(JSON.stringify(checkListQResponse))
      .subscribe(
        data => {
          console.log('POST SUCCESSFUL', data);
          this.checkListDocObject = data;
          this.checkListDocObject['item'] = [];
        },
        error => {
          console.log(error);
        }
      );
  }

  newDocChecklistItem() {
    this.showChecklistForm = !this.showChecklistForm;
    this.checkListItemGroup = this.formBuilder.group({
      document: new FormControl(''),
      selection: new FormControl('')
    });
  }

  saveDoc($event) {
    this.addDocument($event);
  }
  // Documents Features

  /**
   * This functiom takes in a file, grabs various details relating to the file, and converts it
   * into a DocumentReference FHIR object
   * @param $event File event from browser
   */
  addDocument($event) {
    const documentReference = new FHIR.DocumentReference();
    const documentReferenceCodeableConcept = new FHIR.CodeableConcept();
    const content = new FHIR.Content();
    const contentAttachment = new FHIR.Attachment();
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
    reader.onloadend = function() {
      file = reader.result;
      trimmedFile = file.split(',').pop();
      documentReference.resourceType = 'DocumentReference';
      contentAttachment.size = size;
      contentAttachment.contentType = type;
      contentAttachment.data = trimmedFile;
      contentAttachment.creation = date;

      content.attachment = contentAttachment;

      documentReference.instant = date;
      documentReference.type = documentReferenceCodeableConcept;
      documentReference.content = [content];

      that.uploadedDocument = documentReference;

      return reader.result;
    };

    reader.onerror = function(error) {
      console.log('ERROR: ', error);
    };
  }

  postDocumentObject(encounterID) {
    const documentReferenceCodeableConcept = new FHIR.CodeableConcept();
    const documentReferenceAuthor = new FHIR.Reference();

    documentReferenceAuthor.reference =
      'Practitioner/' + sessionStorage.getItem('userFHIRID');

    documentReferenceCodeableConcept.text = this.docFormGroup.get(
      'filetype'
    ).value;

    this.uploadedDocument.type = documentReferenceCodeableConcept;
    this.uploadedDocument.content[0].attachment[
      'title'
    ] = this.docFormGroup.get('filename').value;
    this.uploadedDocument.author = [documentReferenceAuthor];

    this.uploadedDocument['description'] = this.docFormGroup.get(
      'instruction'
    ).value;

    const encounterLinkingObject = new FHIR.Reference();
    const encounterContext = new FHIR.Context();
    encounterLinkingObject.reference = 'Encounter/' + encounterID;

    this.showSpinner = true;
    // this.showDocForm = false;

    encounterContext.encounter = encounterLinkingObject;
    this.uploadedDocument.context = encounterContext;
    this.staffService.postDataFile(this.uploadedDocument).subscribe(
      data => {
        this.createDocumentItemForServiceRequest(data);
        this.associateDocumentWithChecklistItemOnUpload(data['id']);
        // this.showDocForm = true;
      },
      error => {
        console.log(error);
      },
      () => {
        this.showDocForm = false;
        setTimeout(() => {
          this.showSpinner = false;
          location.reload();
        }, 500);
      }
    );
  }

  associateDocumentWithChecklistItemOnUpload(data) {
    if (this.docFormGroup.get('checkListItem').value && data) {
      const newAnswer = new FHIR.Answer();
      const newAnswerBoolean = new FHIR.Answer();
      const newReference = new FHIR.Reference();
      const selectedValue = this.docFormGroup.get('checkListItem').value;

      newReference.reference = 'DocumentReference/' + data;
      newAnswer.valueReference = newReference;
      newAnswerBoolean.valueBoolean = true;
      console.log(
        newReference.reference,
        this.checkListDocObject,
        selectedValue
      );
      this.checkListDocObject['item'].forEach(itemFound => {
        if (itemFound['text'] === selectedValue['text']) {
          selectedValue['answer'][0] = newAnswerBoolean;
          selectedValue['answer'][1] = newAnswer;
          itemFound = selectedValue;

          console.log('match!,', this.checkListDocObject['id']);

          this.staffService
            .updateDocumentsChecklist(
              this.checkListDocObject['id'],
              JSON.stringify(this.checkListDocObject)
            )
            .subscribe(
              newList => {
                this.showSpinner = true;
                if (newList) {
                  console.log('UPDATED', newList);
                  this.checkListDocObject = newList;
                }
              },
              error => {
                console.log(error);
              },
              () => {
                location.reload();
              }
            );
        }
      });
    }
  }

  createDocumentItemForServiceRequest(document) {
    if (this.serviceRequestInfoObject['item']) {
      console.log(this.serviceRequestInfoObject['item']);
    }

    console.log(this.serviceRequestInfoObject);
    const linkID = this.serviceRequestInfoObject['item'].length;

    const newDocumentItemObject = new FHIR.Item();
    const newDocumentObjectReference = new FHIR.Reference();
    const newDocumentItemObjectAnswer = new FHIR.Answer();

    newDocumentObjectReference.reference =
      'DocumentReference/' + document['id'];

    newDocumentItemObjectAnswer.valueReference = newDocumentObjectReference;

    newDocumentItemObject.answer = [newDocumentItemObjectAnswer];
    newDocumentItemObject.linkId = linkID.toString();
    newDocumentItemObject.text = 'Document';

    // this.addItemToServiceRequest(newDocumentItemObject);
  }

  addItemToServiceRequest(item) {
    this.serviceRequestInfoObject['item'].forEach(itemFound => {
      if (itemFound['text'].toLowerCase() === 'document') {
        console.log(itemFound);
      }
    });
    this.serviceRequestInfoObject['item'].push(item);
    this.staffService
      .updateServiceRequest(
        this.serviceRequestInfoObject['id'],
        this.serviceRequestInfoObject
      )
      .subscribe(
        data => {
          this.serviceRequestInfoObject = data;
          // this.showDocForm = false;
          console.log(data);
        },
        error => console.log(error)
      );
  }

  loadFilesRelatedToWorkOrder() {
    console.log('finding files');
    this.staffService
      .getAllEncountersReferencedByAnEpisodeOfCare(this.episodeOfCareId)
      .subscribe(encounters => {
        if (encounters) {
          if (encounters['entry']) {
            encounters['entry'].forEach(encounter => {
              const tempEncounterId = encounter['resource']['id'];
              this.staffService
                .getAllDocumentReferencesByAnEncounter(tempEncounterId)
                .subscribe(docs => {
                  if (docs['entry']) {
                    docs['entry'].forEach(docFound => {
                      const temp = {};
                      temp['type'] = 'doc';
                      console.log(docFound['type']);
                      temp['categoryType'] =
                        docFound['resource']['type']['text'];
                      if (docFound['resource']['description']) {
                        temp['description'] =
                          docFound['resource']['description'];
                      }
                      temp['docID'] = docFound['resource']['id'];
                      temp['docReference'] =
                        'DocumentReference/' + docFound['resource']['id'];
                      temp['dateCreated'] =
                        docFound['resource']['content'][0]['attachment'][
                          'creation'
                        ];
                      temp['fileFullName'] =
                        docFound['resource']['content'][0]['attachment'][
                          'title'
                        ] +
                        '.' +
                        docFound['resource']['content'][0]['attachment'][
                          'contentType'
                        ]
                          .split('/')
                          .pop();
                      temp['filetype'] = docFound['resource']['content'][0][
                        'attachment'
                      ]['contentType']
                        .split('/')
                        .pop();
                      temp['title'] =
                        docFound['resource']['content'][0]['attachment'][
                          'title'
                        ];
                      temp['docCategory'] =
                        docFound['resource']['type']['text'];
                      temp['content'] = docFound['resource']['content'][0];
                      temp['context'] = docFound['resource']['context'];
                      if (docFound['resource']['author']) {
                        temp['author'] =
                          docFound['resource']['author'][0]['reference'];
                      }
                      temp['lastUpdated'] =
                        docFound['resource']['meta']['lastUpdated'];
                      if (
                        temp['categoryType']
                          .toLowerCase()
                          .includes('clinical') &&
                        sessionStorage.getItem('userRole') === 'clinician'
                      ) {
                        this.history.push(temp);
                        this.documentsList.push(temp);
                      }
                      if (
                        !temp['categoryType']
                          .toLowerCase()
                          .includes('clinical') &&
                        sessionStorage.getItem('userRole') !== 'clinician'
                      ) {
                        this.history.push(temp);
                        this.documentsList.push(temp);
                      }
                      if (
                        !temp['categoryType']
                          .toLowerCase()
                          .includes('clinical') &&
                        sessionStorage.getItem('userRole') === 'clinician'
                      ) {
                        this.history.push(temp);
                        this.documentsList.push(temp);
                      }
                      this.setupAuthorNameForDisplay();
                      console.log(temp);
                    });
                  }
                });
            });
          }
        }
      });
  }

  saveItemToQResponse() {
    const itemToAdd = new FHIR.Item();
    const itemBoolAnswer = new FHIR.Answer();
    if (this.checkListItemGroup.get('document').value) {
      itemToAdd.linkId = this.checkListDocObject['item'].length + 1;
      itemToAdd.text = this.checkListItemGroup.get('document').value;
      itemBoolAnswer.valueBoolean = false;
      itemToAdd.answer = [itemBoolAnswer];
      this.checkListDocObject['status'] = 'stopped';
      this.checkListDocObject['item'].push(itemToAdd);
      this.staffService
        .updateDocumentsChecklist(
          this.checkListDocObject['id'],
          JSON.stringify(this.checkListDocObject)
        )
        .subscribe(data => {
          if (data) {
            console.log('UPDATED', data);
            this.checkListDocObject = data;
            for (const status of this.statusSelectionList) {
              if (status['value'] === this.checkListDocObject['status']) {
                this.displayDocStatus = status['viewValue'];
              }
            }
            this.showChecklistForm = !this.showChecklistForm;
          }
        });
    }
  }

  docChecklistItemStateChange() {
    this.staffService
      .updateDocumentsChecklist(
        this.checkListDocObject['id'],
        JSON.stringify(this.checkListDocObject)
      )
      .subscribe(data => {
        if (data) {
          console.log('UPDATED', data);
          this.checkListDocObject = data;
        }
      });
  }

  updateDocumentsCheckedOff(item, event) {
    const docAnswer = new FHIR.Answer();
    const docReference = new FHIR.Reference();

    docReference.reference = event;
    docAnswer.valueReference = docReference;
    this.checkListDocObject['item'].forEach(itemFound => {
      if (itemFound['linkId'] === item['linkId']) {
        item['answer'][1] = docAnswer;
        itemFound = item;
        this.checkListDocObject['status'] = 'amended';
        this.staffService
          .updateDocumentsChecklist(
            this.checkListDocObject['id'],
            JSON.stringify(this.checkListDocObject)
          )
          .subscribe(data => {
            if (data) {
              console.log('UPDATED', data);
              this.checkListDocObject = data;
              for (const status of this.statusSelectionList) {
                if (status['value'] === this.checkListDocObject['status']) {
                  this.displayDocStatus = status['viewValue'];
                }
              }
            }
          },
          error => {
            console.log(error);
          });
      }
    });
  }

  downloadFile(incomingFile) {
    const byteCharacters = atob(incomingFile['content']['attachment']['data']);
    const byteNumbers = new Array(byteCharacters.length);
    for (let index = 0; index < byteCharacters.length; index++) {
      byteNumbers[index] = byteCharacters.charCodeAt(index);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: incomingFile['content']['attachment']['contentType']
    });

    if (navigator.msSaveBlob) {
      const filename = incomingFile['fileFullName'];
      navigator.msSaveBlob(blob, filename);
    } else {
      const fileLink = document.createElement('a');
      fileLink.href = URL.createObjectURL(blob);
      fileLink.setAttribute('visibility', 'hidden');
      fileLink.download = incomingFile['fileFullName'];
      document.body.appendChild(fileLink);
      fileLink.click();
      document.body.removeChild(fileLink);
    }
  }

  previewFile(incomingFile) {
    const byteCharacters = atob(incomingFile['content']['attachment']['data']);
    const byteNumbers = new Array(byteCharacters.length);
    for (let index = 0; index < byteCharacters.length; index++) {
      byteNumbers[index] = byteCharacters.charCodeAt(index);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: incomingFile['content']['attachment']['contentType']
    });
    const filename = incomingFile['fileFullName'];

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

  // determineWorkOrderStatus(data) {
  //   console.log(data);
  //   let counter = 0;
  //   const itemList = data['item'];
  //   const numberOfItems = itemList.length;
  //   itemList.forEach(item => {
  //     if (item['answer'].length > 1 && item['answer'][0]['valueBoolean'] === true) {
  //       console.log(item);
  //     } else {
  //       counter++;
  //     }
  //   });
  //   if (counter > 1) {
  //     this.displayDocStatus = 'ACTION-REQURIED';
  //   } else {
  //     this.displayDocStatus = 'WAITING';
  //   }
  // }

  /* Document Functions (end) */


  redirectToLabRequisition() {
    if (sessionStorage.getItem('userRole') === 'clinician') {
      this.staffService.setSelectedEpisodeId(this.episodeOfCareId);
      this.router.navigateByUrl(
        '/staff/lab-requisition/' + this.episodeOfCareId
      );
    }
  }

  redirectToAssessment() {
    if (sessionStorage.getItem('userRole') === 'clinician') {
      this.staffService.setSelectedEpisodeId(this.episodeOfCareId);
      this.router.navigateByUrl('/staff/clinical/assessment-screen');
    }
  }

  redirectToScheduler() {
    if (sessionStorage.getItem('userRole') === 'clinician') {
      this.staffService.setSelectedEpisodeId(this.episodeOfCareId);
      this.router.navigateByUrl('/staff/clinical/scheduler');
    }
  }

  redirectToAssessmentSelected(event) {
    if (sessionStorage.getItem('userRole') === 'clinician') {
      console.log(event);
      if (event === 'IMMUNIZATION') {
        this.router.navigateByUrl('/staff/clinical/immunization-screen');
      }
      if (event === 'AUDIOGRAM') {
        this.router.navigateByUrl('/staff/audiogram/' + this.episodeOfCareId);
      }
      if (event === 'TURBTEST') {
      }
    }
  }

  collapseCard() {
    this.collapseFlag = !this.collapseFlag;
    console.log(this.collapseFlag);
    // return collapse;
  }
}
