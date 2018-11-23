import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { QrequestService } from '../../service/qrequest.service';

@Component({
  selector: 'app-service-request-summary',
  templateUrl: './service-request-summary.component.html',
  styleUrls: ['./service-request-summary.component.css']
})
export class ServiceRequestSummaryComponent implements OnInit {

  serviceRequestObject = {};

  constructor(private userService: UserService, private qrequestService: QrequestService) { }

  ngOnInit() {
    const selectedServiceRequestID = this.userService.getSelectedServiceRequestID();
    // const selectedServiceRequestID = '2153';
    this.qrequestService.getData('/' + '2161').subscribe(data => {
      console.log(data);
      this.serviceRequestObject['status'] = data['status'];
      data['item'].forEach(item => {
        console.log(item);
        this.serviceRequestObject[item.text] = item['answer'][0]['valueString'];
        // for (const item of element.item) {
        //   this.serviceRequestObject[]
        // }
        // if (element.text === 'Name of Requester') {
        //   this.serviceRequestObject['requesterName'] = element['answer'][0]['valueString'];
        // }
        // if (element.text === 'Department Name') {
        //   this.serviceRequestObject['departmentName'] = element['answer'][0]['valueString'];
        // }
        // if (element.text === 'Contact Email') {
        //   this.serviceRequestObject['email'] = element['answer'][0]['valueString'];
        // }
        // if (element.text === 'Contact Phone Number') {
        //   this.serviceRequestObject['phoneNumber'] = element['answer'][0]['valueString'];
        // }
        // if (element.text === 'Select Request Type') {
        //   this.serviceRequestObject['requesterType'] = element['answer'][0]['valueString'];
        // }
        // if (element.text === 'Detail of Request') {
        //   this.serviceRequestObject['requesterDetail'] = element['answer'][0]['valueString'];
        // }
      });
      console.log(this.serviceRequestObject);
    });
  }

}
