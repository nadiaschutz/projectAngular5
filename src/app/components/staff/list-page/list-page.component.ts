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

  constructor(private questionnaireService: QuestionnaireService) { }

  ngOnInit() {
    this.questionnaireService.getAllUnassignedQuestionnaireResponses().subscribe(data => {
      this.mapToEpisodeOfCare(data);
      this.questionnaireService.getAllEpisodeOfCare().subscribe(episodes => {
        console.log(episodes);
        episodes['entry'].forEach(episode => {
          this.episodesOfCareList.push(episode.resource);
        });
        console.log(this.episodesOfCareList);
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

}
