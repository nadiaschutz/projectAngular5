import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../../service/staff.service';
import { UtilService } from '../../../service/util.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as FHIR from '../../../interface/FHIR';
import { OAuthService } from 'angular-oauth2-oidc';


@Component({
  selector: 'app-work-screen',
  templateUrl: './work-screen.component.html',
  styleUrls: ['./work-screen.component.scss']
})
export class WorkScreenComponent implements OnInit {

  carePlanActivities = [];
  summary = [];
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

  constructor(private staffService: StaffService, private utilService: UtilService,
  private route: ActivatedRoute, private formBuilder: FormBuilder, private oAuthService: OAuthService) { }

  ngOnInit() {
    console.log(this.route.snapshot.paramMap.get('id'));
    this.episodeOfCareId = this.route.snapshot.paramMap.get('id');
    this.staffService.getAllPractitioners().subscribe(
      data => this.subscribePractitioners(data),
      error => console.error(error)
    );
    this.fetchAllData();
  }

  fetchAllData() {
    this.staffService.getEpisodeOfCareAndRelatedData(this.episodeOfCareId).subscribe(data => {
      this.processResponse(data);
      this.displayAll();
    });
  }

  processResponse(data) {
    console.log(data);
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
        } else if (element.resource.resourceType === 'Task') {
          this.processTaskForHistory(element.resource);
        } else if (element.resource.resourceType === 'Communication') {
          const communication = element.resource;
          communication.note.forEach(note => {
            this.processCommunicationNotesForHistory(note);
          });
        }
      });
    }
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
    this.summary.push({id: 'Client Name', value: this.utilService.getNameFromResource(patient)});
    this.summary.push({id: 'Client Date of Birth', value: patient['birthDate']});
    patient.extension.forEach(extension => {
      if (extension.url === 'https://bcip.smilecdr.com/fhir/workplace') {
        this.summary.push({id: 'Client Department', value: extension.valueString});
      } else if (extension.url === 'https://bcip.smilecdr.com/fhir/jobtile') {
        this.summary.push({id: 'Job Title', value: extension.valueString});
      } else if (extension.url === 'https://bcip.smilecdr.com/fhir/branch') {
        this.summary.push({id: 'Client Branch', value: extension.valueString});
      }
    });
  }

  processQuestionnaireResponseForSummary(questionnaireResponse) {
    questionnaireResponse.item.forEach(item => {
      if (item.text === 'PSOHP Service') {
        this.summary.push({id: 'PSOHP Service', value: item['answer'][0]['valueString']});
      } else if (item.text === 'Submitting Department') {
        this.summary.push({id: 'Submitting Department', value: item['answer'][0]['valueString']});
      } else if (item.text === 'Receiving Department') {
        this.summary.push({id: 'Receiving Department', value: item['answer'][0]['valueString']});
      } else if (item.text === 'OHAG Occupation') {
        this.summary.push({id: 'OHAG Occupation', value: item['answer'][0]['valueString']});
      } else if (item.text === 'OHAG Environmental Modifier') {
        this.summary.push({id: 'OHAG Environmental Modifier', value: item['answer'][0]['valueString']});
      }
    });
  }

  processTaskForHistory(task) {
    const temp = {};
    temp['type'] = 'task';
    temp['status'] = task['status'];
    temp['title'] = 'Task: ' + task['description'];
    temp['note'] = task['note'][0]['text'];
    const practitionerId = this.utilService.getIdFromReference(task['owner']['reference']);
    temp['owner'] = this.utilService.getNameFromResource(this.practitionersWithId[practitionerId]);
    temp['lastUpdated'] = task['meta']['lastUpdated'];
    temp['date'] = this.utilService.getDateTime(task['meta']['lastUpdated']);
    temp['id'] = task['id'];
    this.history.push(temp);
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
         ' marked item ' + this.carePlan['activity'][index]['detail']['description'] + ' as In-complete';
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

  processCommunicationNotesForHistory(communicationItem) {
    const temp = {};
    temp['type'] = 'note';
    if (communicationItem['id']) {
      temp['title'] = 'Note: ' + communicationItem['id'];
    } else {
      temp['title'] = 'Note';
    }
    temp['note'] = communicationItem.text;
    temp['lastUpdated'] = communicationItem.time;
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
      this.processCommunicationNotesForHistory(annotation);
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
      .postTask(JSON.stringify(task)).subscribe((data) => {
        this.showTaskForm = false;
        this.processTaskForHistory(data);
        console.log(this.showOnlyTasks);
        if (this.showOnlyTasks) {
          this.displayOnlyTasks();
        } else {
          this.displayAll();
        }
      });
  }

  fetchTasksRelatedToEpisodeOfCare() {
    this.staffService.getAllTasksForEpisodeOfCare(this.episodeOfCareId).subscribe(data => {
      console.log(data);
      for (const task of data['entry']) {
        this.processTaskForHistory(task['resource']);
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

}
