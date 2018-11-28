import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { QrequestService } from '../../service/qrequest.service';
import { QuestionnaireService } from '../../service/questionnaire.service';

@Component({
  selector: 'app-service-request-summary',
  templateUrl: './service-request-summary.component.html',
  styleUrls: ['./service-request-summary.component.css']
})
export class ServiceRequestSummaryComponent implements OnInit {

  serviceRequestObject = [];
  serviceRequestID = '';

  constructor(private userService: UserService, private qrequestService: QrequestService,
  private questionnaireService: QuestionnaireService) { }

  ngOnInit() {
    const selectedServiceRequestID = this.userService.getSelectedServiceRequestID();
    this.qrequestService.getData('/' + selectedServiceRequestID).subscribe(data => {
      if (data['item']) {
        this.serviceRequestID = data['id'];
        data['item'].forEach(item => {
          const temp = {};
          temp['name'] = item.text;
          temp['value'] = item['answer'][0]['valueString'];
          this.serviceRequestObject.push(temp);
        });
        this.serviceRequestObject.push({name: 'status', value: data['status']});
      }
    });
  }

  deleteServiceRequest() {
    this.questionnaireService.deleteServiceRequest(this.serviceRequestID).subscribe(data => {
      console.log(data);
    }, error => {
      console.error(error);
    });
  }

}
