import { Component, OnInit } from '@angular/core';
import { QrequestService } from '../../service/qrequest.service';
import { QuestionnaireService } from '../../service/questionnaire.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-service-request-summary',
  templateUrl: './service-request-summary.component.html',
  styleUrls: ['./service-request-summary.component.scss']
})
export class ServiceRequestSummaryComponent implements OnInit {

  serviceRequestObject = [];
  serviceRequestID = null;
  showSuccessMessage = false;

  constructor(private qrequestService: QrequestService,
  private questionnaireService: QuestionnaireService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    const selectedServiceRequestID = this.route.snapshot.paramMap.get('id');
    this.qrequestService.getAllQuestionnaireResponseData(selectedServiceRequestID).subscribe(data => {
      console.log(data);
      if (data['entry']) {
        data['entry'].forEach(element => {
          if (element['resource']['resourceType'] === 'QuestionnaireResponse') {
            this.processQuestionnaireResponse(element['resource']);
          }
          if (element['resource']['resourceType'] === 'Patient') {
            this.processPatientDetails(element['resource']);
          }
        });
      }
    });
  }

  processQuestionnaireResponse(data) {
    if (data['item']) {
        this.serviceRequestObject.push({name: 'Service Request Id', value: data['id']});
        this.serviceRequestID = data['id'];
        data['item'].forEach(item => {
          if (item.text !== 'Document') {
            const temp = {};
            if (item.answer) {
              temp['name'] = item.text;
              if (item['answer'][0]['valueString']) {
                temp['value'] = item['answer'][0]['valueString'];
              } else {
                if (item['answer'][0]['valueBoolean']) {
                  temp['value'] = 'yes';
                } else {
                  temp['value'] = 'no';
                }
              }
              this.serviceRequestObject.push(temp);
            }
          }
        });
        this.serviceRequestObject.push({name: 'status', value: data['status']});
    }
  }

  processPatientDetails(data) {
    if (data) {
      this.serviceRequestObject.push({name: 'First Name', value: data['name'][0]['given'][0]});
      this.serviceRequestObject.push({name: 'Last Name', value: data['name'][0]['family']});
      this.serviceRequestObject.push({name: 'Date of Birth', value: data['birthDate']});
      this.serviceRequestObject.push({name: 'Employee PRI', value: data['id']});
      data.extension.forEach(element => {
        if (element.url === 'https://bcip.smilecdr.com/fhir/jobtile') {
          this.serviceRequestObject.push({name: 'Job Title', value: element.valueString});
        }
        if (element.url === 'https://bcip.smilecdr.com/fhir/workplace') {
          this.serviceRequestObject.push({name: 'Employing Department Name', value: element.valueString});
        }
        if (element.url === 'https://bcip.smilecdr.com/fhir/branch') {
          this.serviceRequestObject.push({name: 'Employing Department Branch', value: element.valueString});
        }
      });
    }
  }

  deleteServiceRequest() {
    this.questionnaireService.deleteServiceRequest(this.serviceRequestID).subscribe(data => {
      console.log(data);
      this.showSuccessMessage = true;
    }, error => {
      console.error(error);
    });
  }

  redirectToServiceRequestMainPage() {
    this.router.navigateByUrl('/servreqmain');
  }

}
