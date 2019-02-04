import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../../service/staff.service';
import { UtilService } from '../../../service/util.service';
import { UserService } from '../../../service/user.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as FHIR from '../../../interface/FHIR';
import { OAuthService } from 'angular-oauth2-oidc';
import { log } from 'util';
import { Router } from '@angular/router';


@Component({
  selector: 'app-work-screen',
  templateUrl: './work-screen.component.html',
  styleUrls: ['./work-screen.component.scss']
})
export class WorkScreenComponent implements OnInit {

  carePlanActivities = [];
  summary = {} as any;
  episodeOfCare = {};
  carePlan = {};
  showTaskForm = false;
  showNoteForm = false;
  taskFormGroup: FormGroup;
  noteFormGroup: FormGroup;
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

  currentPractitionerFHIRIDInSession;

  assignedAdmin = '';
  assignedClinician = {};
  selectedClinician = {};
  clinicians = [];
  cliniciansWithId = [];
  showClinicianButtons = false;
  clinicalAssignmentTask = {};

  constructor(private staffService: StaffService, private utilService: UtilService,
  private route: ActivatedRoute, private formBuilder: FormBuilder,
  private oAuthService: OAuthService, private userService: UserService,
  private router: Router) { }

  ngOnInit() {

    this.currentPractitionerFHIRIDInSession = sessionStorage.getItem('userFHIRID');

    console.log(this.route.snapshot.paramMap.get('id'));
    this.episodeOfCareId = this.route.snapshot.paramMap.get('id');
    this.userService.fetchCurrentRole();
    this.staffService.getAllPractitioners().subscribe(data => {
        this.subscribePractitioners(data);
        this.fetchAllClinicians();
        this.fetchAllData();
      },
      error => console.error(error)
    );
  }

  fetchAllData() {
    this.staffService.getEpisodeOfCareAndRelatedData(this.episodeOfCareId).subscribe(data => {
      this.processResponse(data);
      this.displayAll();
    });
  }

  fetchAllClinicians() {
    this.staffService.getAllClinicians().subscribe(data => {
      if (data['entry']) {
        data['entry'].forEach(element => {
          const clinician = element['resource'];
          this.clinicians.push({id: clinician['id'],
          name: this.utilService.getNameFromResource(clinician)});
          this.cliniciansWithId[clinician.id] = clinician;
        });
        this.fetchAssignedClinician();
      }
    });
  }

  fetchAssignedClinician() {
    this.staffService.getClinicianAssignedToEpisode(this.episodeOfCareId).subscribe(data => {
      if (data['total'] > 0) {
        data['entry'].forEach(element => {
          const task = element['resource'];
          if (task['status'] === 'ready') {
            this.clinicalAssignmentTask = task;
            const clinicianId = this.utilService.getIdFromReference(task.owner.reference);
            const clinician = this.cliniciansWithId[clinicianId];
            this.assignedClinician = {id: clinician.id, name: this.utilService.getNameFromResource(clinician)};
            this.selectedClinician = this.assignedClinician;
          } else {
            console.log('No assigned clinician');
          }
        });
      }
    });
  }

  compareClinicians(clinician1, clinician2): boolean {
    return clinician1 && clinician2 && clinician1.name === clinician2.name ;
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
    this.staffService.updateTask(this.clinicalAssignmentTask['id'], JSON.stringify(this.clinicalAssignmentTask)).subscribe(data => {
      console.log(data);
      this.createTaskToAssignClinician();
    });
  }

  createTaskToAssignClinician() {
    this.clinicalAssignmentTask = {};
    const task = new FHIR.Task;
    const episodeOfCareReference = new FHIR.Reference;
    episodeOfCareReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    task.context = episodeOfCareReference;

    const requester = new FHIR.Requester;
    const requesterReference = new FHIR.Reference();
    requesterReference.reference = 'Practitioner/' + this.currentPractitionerFHIRIDInSession;
    requester.agent = requesterReference;
    task.requester = requester;
    task.authoredOn = this.utilService.getCurrentDate();

    const ownerReference = new FHIR.Reference;
    ownerReference.reference = 'Practitioner/' + this.selectedClinician['id'];
    task.owner = ownerReference;
    task.description = 'Clinical assignment';

    task.intent = 'plan';
    task.status = 'ready';
    task.resourceType = 'Task';

    const code = new FHIR.Coding;
    code.code = 'clinician';
    const coding = new FHIR.CodeableConcept;
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
          this.processQuestionnaireResponseForSummary(element.resource);
        } else if (element.resource.resourceType === 'EpisodeOfCare') {
          this.episodeOfCare = element.resource;
          this.getCurrentlyAssignedUsername();
        } else if (element.resource.resourceType === 'Task') {
          this.processTaskForHistory(element.resource);
        } else if (element.resource.resourceType === 'Communication') {
          const communication = element.resource;
          communication.note.forEach(note => {
            this.processNoteForHistory(note);
          });
        }
      });
    }
  }

  getCurrentlyAssignedUsername() {
    const userId = this.utilService.getIdFromReference(this.episodeOfCare['careManager']['reference']);
    this.assignedAdmin = this.utilService.getNameFromResource(this.practitionersWithId[userId]);
  }

  processCarePlanForDisplay() {
    this.carePlanActivities = [];
    this.carePlan['activity'].forEach(activity => {
      const temp = {};
      temp['description'] = activity['detail']['description'];
      temp['status'] = activity['detail']['status'];
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
        return new Date(b['lastUpdated']).getTime() - new Date(a['lastUpdated']).getTime();
      }
    });
  }

  processPatientForSummary(patient) {
    this.summary['clientName'] = this.utilService.getNameFromResource(patient);
    this.summary['clientDOB'] = patient['birthDate'];
    patient.extension.forEach(extension => {
      if (extension.url === 'https://bcip.smilecdr.com/fhir/workplace') {
        this.summary['clientDepartment'] = extension.valueString;
      } else if (extension.url === 'https://bcip.smilecdr.com/fhir/jobtile') {
        this.summary['jobTitle'] = extension.valueString;
      } else if (extension.url === 'https://bcip.smilecdr.com/fhir/branch') {
        this.summary['clientBranch'] = extension.valueString;
      }
    });
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
        this.summary['ohagEnvironmentalModifier'] = item['answer'][0]['valueString'];
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
        const requesterId = this.utilService.getIdFromReference(task['requester']['agent']['reference']);
        if (this.practitionersWithId[requesterId]) {
          temp['assignor'] = this.utilService.getNameFromResource(this.practitionersWithId[requesterId]);
        } else if (this.cliniciansWithId[requesterId]) {
          temp['assignor'] = this.utilService.getNameFromResource(this.cliniciansWithId[requesterId]);
        }
      }
      if (task['authoredOn']) {
        temp['dateCreated'] = task['authoredOn'];
      }
      const practitionerId = this.utilService.getIdFromReference(task['owner']['reference']);
      temp['assignee'] =
      this.utilService.getNameFromResource(this.practitionersWithId[practitionerId]);
      temp['lastUpdated'] = task['meta']['lastUpdated'];
      temp['date'] = this.utilService.getDateTime(task['meta']['lastUpdated']);
      temp['id'] = task['id'];
      if (task['status'] === 'completed') {
        temp['dateCompleted'] = this.utilService.getDate(task['meta']['lastUpdated']);
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
        const requesterId = this.utilService.getIdFromReference(task['requester']['agent']['reference']);
        if (this.practitionersWithId[requesterId]) {
          temp['assignor'] = this.utilService.getNameFromResource(this.practitionersWithId[requesterId]);
        } else if (this.cliniciansWithId[requesterId]) {
          temp['assignor'] = this.utilService.getNameFromResource(this.cliniciansWithId[requesterId]);
        }
      }
      if (task['authoredOn']) {
        temp['dateCreated'] = task['authoredOn'];
      }
      const practitionerId = this.utilService.getIdFromReference(task['owner']['reference']);
      temp['assignee'] =
      this.utilService.getNameFromResource(this.practitionersWithId[practitionerId]);
      temp['lastUpdated'] = task['meta']['lastUpdated'];
      temp['date'] = this.utilService.getDateTime(task['meta']['lastUpdated']);
      temp['id'] = task['id'];
      if (task['status'] === 'completed') {
        temp['dateCompleted'] = this.utilService.getDate(task['meta']['lastUpdated']);
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
    if (this.carePlan) {
      const annotation = new FHIR.Annotation;
      annotation.time = new Date();
      if (this.carePlanActivities[index]['value']) {
        annotation.text = 'COMPLETED: User ' + this.fetchCurrentUsername() +
         ' marked item ' + this.carePlan['activity'][index]['detail']['description'] + ' as Completed';
        this.carePlan['activity'][index]['detail']['status'] = 'completed';
      } else {
        annotation.text = 'INCOMPLETE: User ' + this.fetchCurrentUsername() +
         ' marked item ' + this.carePlan['activity'][index]['detail']['description'] + ' as Incomplete';
        this.carePlan['activity'][index]['detail']['status'] = 'in-progress';
        console.log(this.carePlan['activity'][index]);
      }
      if (this.carePlan['activity'][index]['progress']) {
        this.carePlan['activity'][index]['progress'].push(annotation);
      } else {
        this.carePlan['activity'][index]['progress'] = new Array<FHIR.Annotation>();
        this.carePlan['activity'][index]['progress'].push(annotation);
      }
      this.staffService.updateCarePlan(this.carePlan['id'], JSON.stringify(this.carePlan)).subscribe(data => {
        this.processRecentCarePlanActivityForHistory(data['activity'][index]);
        this.carePlan = data;
        this.processCarePlanForDisplay();
        this.displayAll();
      });
    }
  }

  processCarePlanActivityForHistory(carePlanActivity) {
    if (carePlanActivity['progress']) {
      carePlanActivity['progress'].forEach(element => {
        const temp = {};
        temp['type'] = 'checklistItem';
        temp['status'] = carePlanActivity['detail']['status'];
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
      const authorId =
      this.utilService.getIdFromReference(communicationItem['authorReference']['reference']);
      if (this.practitionersWithId[authorId]) {
        temp['author'] = this.utilService.getNameFromResource(this.practitionersWithId[authorId]);
      } else {
        temp['author'] = this.utilService.getNameFromResource(this.cliniciansWithId[authorId]);
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
    this.staffService.getCommunicationRelatedToEpisodeOfCare(this.episodeOfCareId).
      subscribe(data => {
        if (data['entry']) {
          this.communication = data['entry'][0]['resource'];
        } else {
          this.createCommunicationObject();
        }
      });
  }

  saveNotes() {
    const annotation = new FHIR.Annotation;
    const authorReference = new FHIR.Reference;
    authorReference.reference = 'Practitioner/' + sessionStorage;

    annotation.authorReference = authorReference;
    annotation.id = this.noteFormGroup.get('title').value;
    annotation.time = new Date();
    annotation.text = this.noteFormGroup.get('note').value;
    if (!this.communication['note']) {
      this.communication['note'] = new Array<FHIR.Annotation>();
    }
    this.communication['note'].push(annotation);
    this.staffService.updateCommunication(this.communication['id'], JSON.stringify(this.communication)).subscribe(data => {
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
    const communication = new FHIR.Communication;
    communication.resourceType = 'Communication';

    const episodeReference = new FHIR.Reference;
    episodeReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    communication.context = episodeReference;

    const annotation = new FHIR.Annotation;
    annotation.time = new Date();
    // Fetch from html
    communication.note = new Array<FHIR.Annotation>();
    this.staffService.createCommunication(JSON.stringify(communication)).subscribe(data => {
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
    const context = new FHIR.Reference();
    const taskOwner = new FHIR.Reference();
    const taskAnnotation = new FHIR.Annotation();

    const requester = new FHIR.Requester;
    const requesterReference = new FHIR.Reference();
    requesterReference.reference = 'Practitioner/' + sessionStorage.getItem('userFHIRID');
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
    this.staffService
      .saveTask(JSON.stringify(task)).subscribe((data) => {
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
    this.historyToDisplay = [];
    this.historyToDisplay = this.history;
    this.sortHistory();
  }

  displayOnlyTasks() {
    this.showOnlyNotes = false;
    this.showOnlyTasks = true;
    this.historyToDisplay = [];
    this.history.forEach(item => {
      if (item['type'] === 'task') {
        this.historyToDisplay.push(item);
      }
    });
    this.sortHistory();
  }

  displayOnlyNotes() {
    this.showOnlyNotes = true;
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
    this.staffService.updateTask(this.clinicalAssignmentTask['id'], JSON.stringify(this.clinicalAssignmentTask)).subscribe(task => {
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
      this.staffService.updateTask(task['id'], JSON.stringify(task)).subscribe(updatedTask => {
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

  redirectToLabRequisition() {
    this.staffService.setSelectedEpisodeId(this.episodeOfCareId);
    this.router.navigateByUrl('/staff/lab-requisition');
  }

}
