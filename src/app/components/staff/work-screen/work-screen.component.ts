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

  carePlanActivities = [];
  summary = {} as any;
  episodeOfCare = {};
  indexOfCheckListItems = [];
  indexOfDocCheckListItems = [];
  carePlan = {};
  showTaskForm = false;
  showNoteForm = false;
  showChecklistForm = false;
  showSelectionOfDocsForm = false;
  showShowDocListField = false;
  showMilestoneFormGroup = false;
  taskFormGroup: FormGroup;
  noteFormGroup: FormGroup;
  selectionOfDocsGroup: FormGroup;
  milestoneFormGroup: FormGroup;
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
  milestoneForDisplay;
  encounterd;
  currentPractitionerFHIRIDInSession;

  dependentList = [];
  clinicalQuestionnaireArray = [];
  documentsList = [];
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



  milestoneSelectionList = [
    { value: 'Validated', viewValue: 'Validated' },
    { value: 'Assigned', viewValue: 'Assigned to Clinician' },
    { value: 'Scheduled', viewValue: 'Scheduled' },
    { value: 'Work-Completed', viewValue: 'Clinical Work Completed' },
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

    this.currentPractitionerFHIRIDInSession = sessionStorage.getItem(
      'userFHIRID'
    );
      this.showClinicalFunctions = true;
    this.episodeOfCareId = sessionStorage.getItem('selectedEpisodeId');
    this.userService.fetchCurrentRole();
    this.staffService.getAllPractitioners().subscribe(
      data => {
        this.subscribePractitioners(data);
        this.fetchAllClinicians();
        this.fetchAllData();
      },
      error => console.error(error)
    );
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
        const authorReference = new FHIR.Reference();
        authorReference.reference = 'Practitioner/' + sessionStorage.getItem('userFHIRID');
        annotation.authorReference = authorReference;
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
          itemAnswer.valueDateTime = new Date();
          element['answer'].push(itemAnswer);
        }
        if (element['answer']) {
          element['answer'].forEach(timeFound => {
            if (timeFound['valueDateTime']) {
              timeFound['valueDateTime'] = new Date();
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
      if (arr[0]['answer'][0]['valueDateTime']) {

        const timeVariable = this.utilService.convertUTCForDisplay(arr[0]['answer'][0]['valueDateTime']);
        temp['displayTime'] = timeVariable;
      }
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
    this.taskFormGroup = this.formBuilder.group({
      description: new FormControl(''),
      assignTo: new FormControl(''),
      instruction: new FormControl('')
    });
  }

  openNoteForm() {
    this.showNoteForm = true;
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
    // milestoneItemSix.text = 'Received at ' + this.summary['serviceRequestSubmittedDate'];
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

  redirectToLabRequisition() {
      this.staffService.setSelectedEpisodeId(this.episodeOfCareId);
      this.router.navigateByUrl(
        '/staff/lab-requisition/' + this.episodeOfCareId
      );
  }

  redirectToAssessment() {
      this.staffService.setSelectedEpisodeId(this.episodeOfCareId);
      this.router.navigateByUrl('/staff/clinical/assessment-screen/'  + this.episodeOfCareId);
  }

  redirectToCloseScreen () {
    this.staffService.setSelectedEpisodeId(this.episodeOfCareId);
    this.router.navigateByUrl('/staff/cancel-request/' + this.episodeOfCareId);
  }

  redirectToValidateScreen() {
    this.staffService.setSelectedEpisodeId(this.episodeOfCareId);
    this.router.navigateByUrl('/staff/validate-request/' + this.episodeOfCareId);
  }

  redirectToScheduler() {
      this.staffService.setSelectedEpisodeId(this.episodeOfCareId);
      this.router.navigateByUrl('/staff/clinical/scheduler');
  }

  redirectToAssessmentSelected(event) {
      console.log(event);
      if (event === 'IMMUNIZATION') {
        this.router.navigateByUrl('/staff/clinical/immunization-screen/' + this.episodeOfCareId);
      }
      if (event === 'AUDIOGRAM') {
        this.router.navigateByUrl('/staff/audiogram/' + this.episodeOfCareId);
      }
      if (event === 'DOCUMENTS') {
        this.router.navigateByUrl('/staff/document-management/' + this.episodeOfCareId);
      }
      if (event === 'TURBTEST') {
      }
  }

  collapseCard() {
    this.collapseFlag = !this.collapseFlag;
    console.log(this.collapseFlag);
  }
}
