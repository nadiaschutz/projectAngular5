import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { QrequestService } from '../../service/qrequest.service';
import { QuestionnaireService } from '../../service/questionnaire.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service-request-summary',
  templateUrl: './service-request-summary.component.html',
  styleUrls: ['./service-request-summary.component.scss']
})
export class ServiceRequestSummaryComponent implements OnInit {

  serviceRequestObject = [];
  serviceRequestID = null;
  showSuccessMessage = false;

  constructor(private userService: UserService, private qrequestService: QrequestService,
  private questionnaireService: QuestionnaireService, private router: Router) { }

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
      this.showSuccessMessage = true;
    }, error => {
      console.error(error);
    });
  }

  redirectToServiceRequestMainPage() {
    this.router.navigateByUrl('/servreqmain');
  }

}
