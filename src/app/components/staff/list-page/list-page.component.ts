import { Component, OnInit } from '@angular/core';
import { QuestionnaireService } from '../../../service/questionnaire.service';
import { TasksService } from '../../../service/tasks.service';
import * as FHIR from '../../../interface/FHIR';
import { Reference } from '@angular/compiler/src/render3/r3_ast';
import { formatDate } from '@angular/common';
import { StaffService } from '../../../service/staff.service';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.scss']
})
export class ListPageComponent implements OnInit {

  episodesOfCareList = [];
  patientList = [];
  questionnaireResponseList = [];
  episodeResultList = [];
  selectedEpisodes = [];
  admins = [];
  adminListWithIds = [];
  selectedEpisodeAdmin = null;
  taskList = [];
  taskResultList = [];
  selectedTasks = [];
  selectedTaskAdmin = null;

  constructor(private questionnaireService: QuestionnaireService,
  private tasksService: TasksService, private staffService: StaffService) { }

  ngOnInit() {
    this.getAllAdmins();
    this.questionnaireService.getAllUnassignedQuestionnaireResponses().subscribe(data => {
      this.mapToEpisodeOfCare(data);
      this.questionnaireService.getAllEpisodeOfCare().subscribe(episodes => {
        this.buildEpisodeResponseObject(episodes);
      });
    });
    this.tasksService.getAllTasks().subscribe(tasks => {
      this.buildTaskResponseObject(tasks);
    });
  }

  mapToEpisodeOfCare(questionnaireData) {
    questionnaireData.entry.forEach(entry => {
      // Only the Questionnaire Responses that have a patient associated to them are
      // mapped to Episode of Care
      const questionnaireResponse = entry.resource;
      if (questionnaireResponse.subject && !questionnaireResponse.context) {

        const episodeOfCare = new FHIR.EpisodeOfCare;
        episodeOfCare.resourceType = 'EpisodeOfCare';
        episodeOfCare.status = 'planned';

        const type = new FHIR.CodeableConcept;
        type.text = 'Episode of Care';
        episodeOfCare.type = [type];

        const managingOrganization = new FHIR.Reference;
        managingOrganization.reference = 'Organization/NOHIS';

        const patient = new FHIR.Reference;
        patient.reference = questionnaireResponse.subject.reference;
        episodeOfCare.patient = patient;

        const period = new FHIR.Period;
        period.start = formatDate(new Date, 'yyyy-MM-dd', 'en');
        episodeOfCare.period = period;

        this.questionnaireService.saveEpisodeOfCare(JSON.stringify(episodeOfCare)).subscribe(createdEpisodeOfCare => {
          const reference = new FHIR.Reference;
          reference.reference = '/EpisodeOfCare/' + createdEpisodeOfCare['id'];
          questionnaireResponse['context'] = reference;
          this.questionnaireService.changeRequest(questionnaireResponse).subscribe(data => {
            console.log(data);
          }, error => console.error(error));
        }, error => {
          console.error(error);
        });
      }
    });
  }

  resetData() {
    this.episodesOfCareList = [];
    this.patientList = [];
    this.questionnaireResponseList = [];
    this.episodeResultList = [];
    this.selectedEpisodes = [];
    this.selectedEpisodeAdmin = null;
  }

  buildEpisodeResponseObject(episodes) {
    this.resetData();
    episodes.entry.forEach(element => {
      const resource = element.resource;
      if (resource.resourceType === 'EpisodeOfCare') {
        this.episodesOfCareList[resource.id] = resource;
      } else if (resource.resourceType === 'QuestionnaireResponse') {
        if (resource.context) {
          const associatedEpisodeOfCareId = this.getIdFromReference(resource.context.reference);
          this.questionnaireResponseList[associatedEpisodeOfCareId] = resource;
        }
      } else if (resource.resourceType === 'Patient') {
        this.patientList[resource.id] = resource;
      }
    });
    this.episodesOfCareList.forEach(episode => {
      const temp = {};
      temp['episodeOfCareId'] = episode['id'];
      temp['clientName'] = this.getClientName(episode['patient']['reference']);
      temp['serviceAssessmentType'] = this.getServiceAssessmentType(episode['id']);
      temp['clientDepartment'] = this.getClientDepartment(episode['id']);
      temp['daysInQueue'] = this.getDaysInQueue(episode['period']['start']);
      temp['status'] = episode['status'];
      if (episode['careManager']) {
        temp['careManager'] = this.getAdminNameFromReference(episode['careManager']['reference']);
      } else {
        temp['careManager'] = 'Unassigned';
      }
      this.episodeResultList.push(temp);
    });
    this.selectedEpisodes = new Array(this.episodeResultList.length);
  }

  getClientName(patientReference: string) {
    let lastName = '';
    let firstName = '';
    if (patientReference) {
      const patientId = this.getIdFromReference(patientReference);
      const patient = this.patientList[patientId];
      patient['name'].forEach(patientName => {
        lastName = patientName['family'];
        firstName = patientName['given'][0];
      });
      return lastName + ' ' + firstName;
    }
  }

  getServiceAssessmentType(episodeOfCareId) {
    return this.getQuestionnaireReponseItem(episodeOfCareId, 'PSOHP Service');
  }

  getClientDepartment(episodeOfCareId) {
    return this.getQuestionnaireReponseItem(episodeOfCareId, 'Submitting Department');
  }

  getQuestionnaireReponseItem(episodeOfCareId, itemText) {
    let asnwer = '';
    const questionnaireResponse = this.questionnaireResponseList[episodeOfCareId];
    if (questionnaireResponse && questionnaireResponse.item) {
      questionnaireResponse.item.forEach(item => {
        if (item.text === itemText) {
          asnwer = item['answer'][0]['valueString'];
        }
      });
      return asnwer;
    }
  }

  getDaysInQueue(startDateString) {
    if (startDateString.length > 0) {
      const startDate = new Date(startDateString);
      const currentDate = new Date;
      const diff = currentDate.getTime() - startDate.getTime();
      return Math.ceil(diff / (1000 * 3600 * 24));
    }
  }

  assignEpisodeOfCare() {
    for (let i = 0; i < this.selectedEpisodes.length; i++) {
      if (this.selectedEpisodes[i]) {
        const reference = new FHIR.Reference;
        reference.reference = 'Practitioner/' + this.selectedEpisodeAdmin;
        const selectedEpisodeOfCareId = this.episodeResultList[i]['episodeOfCareId'];
        const episode = this.episodesOfCareList[selectedEpisodeOfCareId];
        episode.careManager = reference;
        this.updateEpisodeOfCare(episode);
      }
    }
  }

  updateEpisodeOfCare(episode) {
    const episodeString = JSON.stringify(episode);
    this.staffService.updateEpisodeOfCare(episode.id, episodeString).subscribe(data => {
      this.questionnaireService.getAllEpisodeOfCare().subscribe(episodes => {
        this.buildEpisodeResponseObject(episodes);
      });
    });
  }

  getAllAdmins() {
    this.tasksService.getAllPractitioners().subscribe(data => {
      data['entry'].forEach(element => {
        const admin = element.resource;
        this.admins.push({id: admin.id, value: this.getNameFromResource(admin)});
        this.adminListWithIds[admin.id] = admin;
      });
    });
  }

  getAdminNameFromReference(adminReference) {
    const adminId = this.getIdFromReference(adminReference);
    const admin = this.adminListWithIds[adminId];
    return this.getNameFromResource(admin);
  }

  getNameFromResource(resource: string) {
    let lastName = '';
    let firstName = '';
    if (resource && resource['name']) {
      resource['name'].forEach(resourceName => {
        lastName = resourceName['family'];
        resourceName.given.forEach(givenName => {
          firstName += givenName;
        });
      });
      return firstName + ' ' + lastName;
    }
  }

  release(episodeOfCareId) {
    const episode = this.episodesOfCareList[episodeOfCareId];
    delete episode.careManager;
    this.updateEpisodeOfCare(episode);
  }

  goToWorkScreen() {}

  getIdFromReference(reference) {
    return reference.substring(reference.indexOf('/') + 1, reference.length);
  }

  resetTaskData() {
    this.taskResultList = [];
    this.taskList = [];
    this.selectedTasks = [];
    this.selectedTaskAdmin = null;
  }

  buildTaskResponseObject(tasks) {
    this.resetTaskData();
    tasks.entry.forEach(element => {
      const task = element.resource;
      this.taskList[task.id] = task;
    });
    this.taskList.forEach(task => {
      console.log(task);
      const temp = {};
      temp['id'] = task.id;
      temp['serviceRequestId'] = this.getIdFromReference(task['context']['reference']);
      temp['from'] = formatDate(new Date(task['meta']['lastUpdated']), 'yyyy-MM-dd', 'en');
      temp['dateCreated'] = this.getDaysInQueue(task['meta']['lastUpdated']);
      temp['status'] = task.status;
      if (task.owner) {
        temp['owner'] = this.getAdminNameFromReference(task['owner']['reference']);
      } else {
        temp['owner'] = 'Unassigned';
      }
      this.taskResultList.push(temp);
    });
    this.selectedTasks = new Array(this.taskResultList.length);
    console.log(this.taskResultList);
  }

  assignTaskToAdmin() {
    for (let i = 0; i < this.selectedTasks.length; i++) {
      if (this.selectedTasks[i]) {
        const ownerReference = new FHIR.Reference;
        ownerReference.reference = 'Practitioner/' + this.selectedTaskAdmin;
        const selectedTaskId = this.taskResultList[i]['id'];
        const task = this.taskList[selectedTaskId];
        delete task.owner;
        console.log(task);
        console.log(this.selectedTaskAdmin);
        task.owner = ownerReference;
        console.log(task);
        this.updateTask(task);
      }
    }
  }

  updateTask(taskData) {
    const taskDataString = JSON.stringify(taskData);
    this.tasksService.updateTask(taskData.id, taskDataString).subscribe(data => {
      this.tasksService.getAllTasks().subscribe(tasks => {
        this.buildTaskResponseObject(tasks);
      });
    });
  }

}