import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { QrequestService } from '../../service/qrequest.service';

@Component({
  selector: 'app-service-request-summary',
  templateUrl: './service-request-summary.component.html',
  styleUrls: ['./service-request-summary.component.css']
})
export class ServiceRequestSummaryComponent implements OnInit {

  serviceRequestObject = [];

  constructor(private userService: UserService, private qrequestService: QrequestService) { }

  ngOnInit() {
    const selectedServiceRequestID = this.userService.getSelectedServiceRequestID();
    this.qrequestService.getData('/' + '2161').subscribe(data => {
      console.log(data);
      data['item'].forEach(item => {
        const temp = {};
        temp['name'] = item.text;
        temp['value'] = item['answer'][0]['valueString'];
        this.serviceRequestObject.push(temp);
      });
      this.serviceRequestObject.push({name: 'status', value: data['status']});
      console.log(this.serviceRequestObject);
    });
  }

}
