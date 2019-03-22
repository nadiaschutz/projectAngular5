import { Component, OnInit, Input } from '@angular/core';
import { StaffService } from '../../../service/staff.service';
import { UtilService } from '../../../service/util.service';
import { UserService } from '../../../service/user.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import * as FHIR from '../../../interface/FHIR';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import * as moment from 'moment';
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
  indexOfCheckListItems = [];
  indexOfDocCheckListItems = [];
  carePlan = {};
  showTaskForm = false;
  showNoteForm = false;
  showDocForm = false;
  showChecklistForm = false;
  showSelectionOfDocsForm = false;
  showShowDocListField = false;
  showMilestoneFormGroup = false;
  taskFormGroup: FormGroup;
  noteFormGroup: FormGroup;
  docFormGroup: FormGroup;
  checkListItemGroup: FormGroup;
  selectionOfDocsGroup: FormGroup;
  milestoneFormGroup: FormGroup;
  currentProgressFormGroup: FormGroup;
  checkListDocObject;
  milestoneObject;
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
  enableWorkListUpdate = true;
  displayDocStatus;
  milestoneForDisplay;
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
    { value: 'completed', viewValue: 'IN-PROGRESS' }
  ];

  milestoneSelectionList = [
    { value: 'Validated', viewValue: 'Validated' },
    { value: 'Assigned', viewValue: 'Assigned' },
    { value: 'Scheduled', viewValue: 'Scheduled' },
    { value: 'Work-Completed', viewValue: 'Work-Completed' },
    { value: 'Closed', viewValue: 'Closed' }
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

    this.enableMilestoneFormGroup();
    this.checkDocStatusViewText();
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
    this.checkIfAssociatedMilestoneListExists();
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
        console.log(typeof(new Date(b['lastUpdated']).getTime()));
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

    if (patient['identifier']) {
      patient['identifier'].forEach(identifier => {
          this.summary['employeePRI'] = identifier['value'];
      });
    }
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
    this.summary['serviceRequestId'] = questionnaireResponse['id'];
    this.summary['serviceRequestSubmittedDate'] = questionnaireResponse['meta']['lastUpdated'];
    questionnaireResponse.item.forEach(item => {
      if (item['linkId'] === 'PSOHPSERV') {
        for (const answer of item['answer']) {
          if (answer['valueCoding']) {
            this.summary['psohpService'] = answer['valueCoding']['display'];
          }
        }
      }
      if (item['linkId'] === 'OHAGOCC') {
        for (const answer of item['answer']) {
          if (answer['valueCoding']) {
            this.summary['ohagOccupation'] = answer['valueCoding']['display'];
          }
        }
      }
      if (item['linkId'] === 'ENVMODIF') {
        for (const answer of item['answer']) {
          if (answer['valueCoding']) {
            this.summary['ohagEnvironmentalModifier'] = answer['valueCoding']['display'];
          }
        }
      }
      if (item['linkId'] === 'USERDEPT') {
        for (const answer of item['answer']) {
          if (answer['valueCoding']) {
            this.summary['submittingDepartment'] = answer['valueCoding']['display'];
          }
        }
      }
      if (item['linkId'] === 'REGOFFICE') {
        for (const answer of item['answer']) {
          if (answer['valueCoding']) {
            this.summary['regionalOffice'] = answer['valueCoding']['display'];
          }
        }
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
      this.history.push(temp);
    }
  }

  cancelCarePlanUpdate() {
    this.enableWorkListUpdate = !this.enableWorkListUpdate;
    this.indexOfCheckListItems.forEach(index => {
      this.carePlanActivities[index]['value'] = !this.carePlanActivities[index]['value'];
    });
    this.indexOfCheckListItems = [];
  }

  onChecklistChange(index) {
    this.indexOfCheckListItems.push(index);
  }


  saveCarePlan() {
    this.indexOfCheckListItems.forEach(index => {

      if (this.carePlan) {
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
        }
        if (this.carePlan['activity'][index]['progress']) {
          this.carePlan['activity'][index]['progress'].push(annotation);
        } else {
          this.carePlan['activity'][index]['progress'] = new Array<
            FHIR.Annotation
          >();
          this.carePlan['activity'][index]['progress'].push(annotation);
        }
      }
    });
    this.staffService
          .updateCarePlan(this.carePlan['id'], JSON.stringify(this.carePlan))
          .subscribe(data => {
            // this.processRecentCarePlanActivityForHistory(data['activity'][index]);
            this.indexOfCheckListItems = [];
            this.carePlan = data;
            this.enableWorkListUpdate = !this.enableWorkListUpdate;
            this.processCarePlanForDisplay();
            this.displayAll();
          });
  }

  updateHistoryForDisplay() {
    this.staffService
        .updateCarePlan(this.carePlan['id'], JSON.stringify(this.carePlan))
        .subscribe(data => {
          // this.processRecentCarePlanActivityForHistory(data['activity'][index]);
          this.carePlan = data;
          this.processCarePlanForDisplay();
          this.displayAll();
          location.reload();

        },
        error => {
          console.log(error);
        },
        () => {
          this.enableWorkListUpdate = !this.enableWorkListUpdate;
        });
  }


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

  enableMilestoneFormGroup() {
    // this.showMilestoneFormGroup = !this.showMilestoneFormGroup;
    this.milestoneFormGroup = this.formBuilder.group({
      status: new FormControl(''),
      statusNote: new FormControl('')
    });
  }

  changeMilestoneToSelected() {
    const itemAnswer = new FHIR.Answer();
    const dateTime = moment();
    const selectedStatus = this.milestoneFormGroup.get('status').value;
    this.milestoneObject['item'].forEach(element => {
      if (element['linkId'] === selectedStatus) {
        if (!element['text']) {
          element['text'] = '';
        }
        if (!element['answer']) {
          element['answer'] = [];
          itemAnswer.valueDateTime = dateTime.format();
          element['answer'].push(itemAnswer);
        }
        if (element['answer']) {
          element['answer'].forEach(timeFound => {
            if (timeFound['valueDateTime']) {
              timeFound['valueDateTime'] = dateTime.format();
            }
          });
        }
        element['text'] = this.milestoneFormGroup.get('statusNote').value;
        console.log('matched', element['answer']);
      }

    });
    this.showMilestoneFormGroup = !this.showMilestoneFormGroup;
    this.staffService
      .updateStatusList(
        this.milestoneObject['id'],
        JSON.stringify(this.milestoneObject)
      )
      .subscribe(data => {
        console.log(data);
        this.milestoneObject = data;
        // console.log(this.sortMilestone());
        this.sortMilestone();
      },
      error => {
        console.log(error);
      },
      () => {
        this.milestoneFormGroup.patchValue({status: null});
        this.milestoneFormGroup.patchValue({statusNote: null});
        this.milestoneFormGroup.reset();
      });
  }

  sortMilestone() {
    if (this.milestoneObject) {
      const arr = [];
      this.milestoneObject.item.forEach(element => {
        if (element.answer) {
          arr.push(element);
        }
      });
      console.log(arr);
      arr.sort(function(a, b) {
        if (a['answer'] && b['answer']) {
          if (a['answer'][0]['valueDateTime'] && b['answer'][0]['valueDateTime']) {
            return (
              new Date(b['answer'][0]['valueDateTime']).getTime() -
              new Date(a['answer'][0]['valueDateTime']).getTime()
            );
          }
        }
      });

      const temp = arr[0];
      const timeVariable = this.utilService.convertUTCForDisplay(arr[0]['answer'][0]['valueDateTime']);
      temp['displayTime'] = timeVariable;
     this.milestoneForDisplay = temp;

    }
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

  checkIfAssociatedMilestoneListExists() {
    this.staffService.getStatusList(this.episodeOfCareId).subscribe(data => {
      if (data) {
        if (data['total'] === 0) {
          console.log('nothing here, creating milestone skeleton');
          this.newMilestoneList();
        } else {
          data['entry'].forEach(entry => {
            this.milestoneObject = entry['resource'];
            this.sortMilestone();
          });
        }
      }
    });
  }

  newMilestoneList() {
    const statusQResponse = new FHIR.QuestionnaireResponse();
    const statusReference = new FHIR.Reference();
    const statusContextReference = new FHIR.Reference();
    const statusIdentifier = new FHIR.Identifier();
    const milestoneItemOne = new FHIR.Item();
    const milestoneItemTwo = new FHIR.Item();
    const milestoneItemThree = new FHIR.Item();
    const milestoneItemFour = new FHIR.Item();
    const milestoneItemFive = new FHIR.Item();
    const milestoneItemSix = new FHIR.Item();
    const statusItemAnswer = new FHIR.Answer();
    statusItemAnswer.valueCoding = new FHIR.Coding();

    milestoneItemOne.linkId = 'Validated';

    milestoneItemTwo.linkId = 'Scheduled';

    milestoneItemThree.linkId = 'Assigned';

    milestoneItemFour.linkId = 'Work-Completed';

    milestoneItemFive.linkId = 'Closed';

    milestoneItemSix.linkId = 'Received';
    milestoneItemSix.text = 'Received at ' + this.summary['serviceRequestSubmittedDate'];
    statusItemAnswer.valueCoding.code = this.utilService.getCurrentDateTime();
    statusItemAnswer.valueCoding.system = 'https://bcip.smilecdr.com/fhir/WorkOrderMlestone';
    statusItemAnswer.valueCoding.display = 'Received at ' + this.utilService.getCurrentDateTime();
    milestoneItemSix.answer = [statusItemAnswer];
    statusReference.reference = 'Questionnaire/13064';
    statusContextReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    statusIdentifier.value = 'STATUS';

    statusQResponse.resourceType = 'QuestionnaireResponse';
    statusQResponse.identifier = statusIdentifier;
    statusQResponse.questionnaire = statusReference;
    statusQResponse.status = 'in-progress';
    statusQResponse.context = statusContextReference;
    statusQResponse.item = [
      milestoneItemOne,
      milestoneItemTwo,
      milestoneItemThree,
      milestoneItemFour,
      milestoneItemFive,
      milestoneItemSix
    ];

    console.log(statusQResponse);

    this.staffService
      .createStatusList(JSON.stringify(statusQResponse))
      .subscribe(data => {
        console.log('POST SUCCESSFUL', data);
        this.milestoneObject = data;
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
              this.checkDocStatusViewText();
              this.checkListDocObject['item'].forEach(item => {
                if (item.answer) {
                  item.value = true;
                } else {
                  item.value = false;
                }
              });
              if (!this.checkListDocObject['item']) {
                this.checkListDocObject['item'] = [];
              }
            });
          } else {
            // This scenario means status is In-POGRESS
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


  // checkDocListStatus(obj) {
    
  // }

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
      this.checkListDocObject['item'].forEach(itemFound => {
        if (itemFound['text'] === selectedValue['text']) {
          selectedValue['answer'][0] = newAnswer;
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
      this.checkListDocObject['item'].push(itemToAdd);
      this.checkListDocObject['status'] = 'stopped';

      this.staffService
        .updateDocumentsChecklist(
          this.checkListDocObject['id'],
          JSON.stringify(this.checkListDocObject)
        )
        .subscribe(data => {
          if (data) {
            console.log('UPDATED', data);
            this.checkListDocObject = data;
            this.changeDocumentListStatus();
            this.showChecklistForm = !this.showChecklistForm;
          }
        },
        error => {
          console.log(error);
        });
    }
  }

  onDockChecklistItemChange(index) {
    this.indexOfDocCheckListItems.push(index);
  }


  updateDocumentsCheckedOff(itemPassed, event, index) {
    console.log(this.checkListDocObject['item'][index]);
    const docAnswer = new FHIR.Answer();
    const docReference = new FHIR.Reference();
    this.checkListDocObject['status'] = 'amended';

    docReference.reference = event;
    docAnswer.valueReference = docReference;
    this.checkListDocObject['item'].forEach(itemFound => {
      if (itemFound['linkId'] === itemPassed['linkId']) {
        itemFound['answer'] = [];
        itemFound['answer'].push(docAnswer);
        this.staffService
          .updateDocumentsChecklist(
            this.checkListDocObject['id'],
            JSON.stringify(this.checkListDocObject)
          )
          .subscribe(data => {
            if (data) {
              console.log('UPDATED', data);
              this.checkListDocObject = data;
              this.changeDocumentListStatus();
              this.checkDocStatusViewText();
              this.checkListDocObject['item'].forEach(item => {
                if (item.answer) {
                  item.value = true;
                } else {
                  item.value = false;
                }
              });
            }
          },
          error => {
            console.log(error);
          });
      }
    });
  }

  checkDocStatusViewText() {
    for (const status of this.statusSelectionList) {
      if (this.checkListDocObject) {
        if (this.checkListDocObject['status'] === status['value']) {
          this.displayDocStatus = status['viewValue'];
        }
      }
    }
  }

  changeDocumentListStatus() {
    if (this.checkListDocObject) {
      if (this.checkListDocObject['status'] !== 'amended') {

        if (this.checkListDocObject['item'] && this.checkListDocObject['status']) {
          const lengthOfItemArray = this.checkListDocObject['item'].length;
          let currentAmountOfAnsweredItems = 0;
          this.checkListDocObject['item'].forEach(itemFound => {
            if (itemFound['answer']) {
              currentAmountOfAnsweredItems++;
            }
          });
          if (currentAmountOfAnsweredItems === lengthOfItemArray) {
            this.checkListDocObject['status'] = 'completed';
          } else {
            this.checkListDocObject['status'] = 'stopped';
          }
          this.staffService.updateDocumentsChecklist(this.checkListDocObject['id'], JSON.stringify(this.checkListDocObject)).subscribe(
            data => {
              if (data) {
                this.checkListDocObject = data;
                this.checkDocStatusViewText();
                this.checkListDocObject['item'].forEach(item => {
                  if (item.answer) {
                    item.value = true;
                  } else {
                    item.value = false;
                  }
                });
              }
            }
          )
        }
      }
    }
  }

  changeDocStatusFromActionRequired(incomingFile) {
    this.checkListDocObject['status'] = 'stopped';
    if (incomingFile['content']['attachment']['contentType'] !== 'pdf') {
      this.downloadFile(incomingFile);
    } else {
      this.previewFile(incomingFile);
    }
    this.staffService.updateDocumentsChecklist(this.checkListDocObject['id'], JSON.stringify(this.checkListDocObject)).subscribe(
      data => {
        if (data) {
        this.checkListDocObject = data;
        this.changeDocumentListStatus();
          this.checkListDocObject['item'].forEach(item => {
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

  redirectToCloseScreen () {
    this.staffService.setSelectedEpisodeId(this.episodeOfCareId);
    this.router.navigateByUrl('/staff/cancel-request');
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
