import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../../service/staff.service';
import { UtilService } from '../../../service/util.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-work-screen',
  templateUrl: './work-screen.component.html',
  styleUrls: ['./work-screen.component.scss']
})
export class WorkScreenComponent implements OnInit {

  carePlanActivities = [];
  summary = [];

  constructor(private staffService: StaffService, private utilService: UtilService,
  private route: ActivatedRoute) { }

  ngOnInit() {
    console.log(this.route.snapshot.paramMap.get('id'));
    // this.route.data.subscribe(data => {
    //   console.log(data);
    // });
    // const episodeOfCareId = this.staffService.getSelectedEpisodeId();
    const episodeOfCareId = this.route.snapshot.paramMap.get('id');
    this.staffService.getEpisodeOfCareAndRelatedData(episodeOfCareId).subscribe(data => {
      console.log(data);
      this.processResponse(data);
    });
  }

  processResponse(data) {
    console.log(data);
    if (data && data.entry) {
      data.entry.forEach(element => {
        if (element.resource.resourceType === 'CarePlan') {
          const carePlan = element.resource;
          carePlan.activity.forEach(activity => {
            const temp = {};
            temp['description'] = activity['detail']['description'];
            temp['status'] = activity['detail']['status'];
            temp['value'] = false;
            this.carePlanActivities.push(temp);
          });
        } else if (element.resource.resourceType === 'Patient') {
          this.processPatientForSummary(element.resource);
        } else if (element.resource.resourceType === 'QuestionnaireResponse') {
          this.processQuestionnaireResponseForSummary(element.resource);
        }
        console.log(this.summary);
      });
    }
  }

  processPatientForSummary(patient) {
    console.log(patient);
    this.summary.push({id: 'Client Name', value: this.utilService.getNameFromResource(patient)});
    this.summary.push({id: 'Client Date of Birth', value: patient['birthDate']});
    patient.extension.forEach(extension => {
      if (extension.url === 'https://bcip.smilecdr.com/fhir/workplace') {
        this.summary.push({id: 'Client Workplace', value: extension.valueString});
      } else if (extension.url === 'https://bcip.smilecdr.com/fhir/jobtile') {
        this.summary.push({id: 'Job Title', value: extension.valueString});
      } else if (extension.url === 'https://bcip.smilecdr.com/fhir/branch') {
        this.summary.push({id: 'Client Branch', value: extension.valueString});
      }
    });
  }

  processQuestionnaireResponseForSummary(questionnaireResponse) {
    console.log(questionnaireResponse);
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

  onChange() {
    // Post Care Plan here
    console.log(this.carePlanActivities);
  }

  activeTask() {}

  createTasksForEpisodeOfCare() {}

}
