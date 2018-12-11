import { Component, OnInit } from '@angular/core';
import { QuestionnaireService } from '../../../service/questionnaire.service';
import * as FHIR from '../../../interface/FHIR';
import { Reference } from '@angular/compiler/src/render3/r3_ast';
import { formatDate } from '@angular/common';

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
  selectedItems = [];
  selectedPractitioner = '';

  constructor(private questionnaireService: QuestionnaireService) { }

  ngOnInit() {
    this.questionnaireService.getAllUnassignedQuestionnaireResponses().subscribe(data => {
      this.mapToEpisodeOfCare(data);
      this.questionnaireService.getAllEpisodeOfCare().subscribe(episodes => {
        // console.log(episodes);
        // episodes['entry'].forEach(episode => {
        //   this.episodesOfCareList.push(episode.resource);
        // });
        // console.log(this.episodesOfCareList);
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

  buildResponseObject(episodes) {
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
      this.resultList.push(temp);
    });
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
    console.log(this.selectedItems);
  }

  getAllPractitioners() {
  }

  getIdFromReference(reference) {
    return reference.substring(reference.indexOf('/') + 1, reference.length);
  }

}
