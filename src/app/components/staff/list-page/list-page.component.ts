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
  resultList = [];
  selectedEpisodes = [];
  selectedPractitioner = '';
  admins = [];
  adminListWithIds = [];
  selectedAdmin = null;

  constructor(private questionnaireService: QuestionnaireService,
  private tasksService: TasksService, private staffService: StaffService) { }

  ngOnInit() {
    this.getAllAdmins();
    this.questionnaireService.getAllUnassignedQuestionnaireResponses().subscribe(data => {
      this.mapToEpisodeOfCare(data);
      this.questionnaireService.getAllEpisodeOfCare().subscribe(episodes => {
        this.buildResponseObject(episodes);
      });
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
    this.resultList = [];
    this.selectedEpisodes = [];
    this.selectedPractitioner = '';
    this.selectedAdmin = null;
  }

  buildResponseObject(episodes) {
    this.resetData();
    console.log(episodes);
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
    console.log(this.episodesOfCareList);
    console.log(this.questionnaireResponseList);
    console.log(this.patientList);
    this.episodesOfCareList.forEach(episode => {
      const temp = {};
      temp['episodeOfCareId'] = episode['id'];
      temp['clientName'] = this.getClientName(episode['patient']['reference']);
      temp['serviceAssessmentType'] = this.getServiceAssessmentType(episode['id']);
      temp['daysInQueue'] = this.getDaysInQueue(episode['period']['start']);
      temp['status'] = episode['status'];
      if (episode['careManager']) {
        temp['careManager'] = this.getAdminNameFromReference(episode['careManager']['reference']);
      } else {
        temp['careManager'] = 'Unassigned';
      }
      this.resultList.push(temp);
    });
    this.selectedEpisodes = new Array(this.resultList.length);
    console.log(this.resultList);
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
    let serviceAssessmentType = '';
    const questionnaireResponse = this.questionnaireResponseList[episodeOfCareId];
    if (questionnaireResponse && questionnaireResponse.item) {
      questionnaireResponse.item.forEach(item => {
        if (item.text === 'PSOHP Service') {
          serviceAssessmentType = item['answer'][0]['valueString'];
        }
      });
      return serviceAssessmentType;
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
    console.log(this.selectedEpisodes);
    console.log(this.selectedAdmin);
    const selectedAdmin = this.adminListWithIds[this.selectedAdmin];
    console.log(this.selectedEpisodes.length);
    for (let i = 0; i < this.selectedEpisodes.length; i++) {
      if (this.selectedEpisodes[i]) {
        console.log(i);
        console.log(this.resultList[i]);
        const selectedEpisodeOfCareId = this.resultList[i]['episodeOfCareId'];
        console.log(selectedEpisodeOfCareId);
        console.log(this.episodesOfCareList[selectedEpisodeOfCareId]);
        const reference = new FHIR.Reference;
        reference.reference = 'Practitioner/' + this.selectedAdmin;
        const episode = this.episodesOfCareList[selectedEpisodeOfCareId];
        console.log(episode);
        episode.careManager = reference;
        this.updateEpisodeOfCare(episode);
      }
    }
  }

  updateEpisodeOfCare(episode) {
    const episodeString = JSON.stringify(episode);
    this.staffService.updateEpisodeOfCare(episode.id, episodeString).subscribe(data => {
      this.questionnaireService.getAllEpisodeOfCare().subscribe(episodes => {
        this.buildResponseObject(episodes);
      });
    });
  }

  getAllAdmins() {
    this.tasksService.getAllPractitioners().subscribe(data => {
      data['entry'].forEach(element => {
        const admin = element.resource;
        this.admins.push({id: admin.id, value: this.getAdminName(admin)});
        this.adminListWithIds[admin.id] = admin;
      });
      console.log(this.adminListWithIds);
      console.log(this.admins);
    });
  }

  getAdminNameFromReference(adminReference) {
    const adminId = this.getIdFromReference(adminReference);
    const admin = this.adminListWithIds[adminId];
    return this.getAdminName(admin);
  }

  getAdminName(admin: string) {
    let lastName = '';
    let firstName = '';
    admin['name'].forEach(adminName => {
      lastName = adminName['family'];
      adminName.given.forEach(givenName => {
        firstName += givenName;
      });
      firstName = adminName['given'][0];
    });
    return firstName + ' ' + lastName;
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

}
