import { Component, OnInit } from '@angular/core';
import { QrequestService } from '../../service/qrequest.service';
import { QuestionnaireService } from '../../service/questionnaire.service';
import { Router, ActivatedRoute } from '@angular/router';
import { element } from '@angular/core/src/render3/instructions';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-service-request-summary',
  templateUrl: './service-request-summary.component.html',
  styleUrls: ['./service-request-summary.component.scss']
})
export class ServiceRequestSummaryComponent implements OnInit {
  questId = null;
  newArr = [];

  serviceRequestObject = [];
  serviceRequestID = null;
  showSuccessMessage = false;
  documentForServiceRequest = [];
  listOrderTest1 = [
    'Service Request Id',
    'First Name',
    'Last Name',
    'Date of Birth',
    'Employee PRI',
    'PSOHP Service',
    // 'Date Created',quest responce , meta, or autored
    // 'Client email:',  patient. telecom
    // 'Client tel. No.',patient. telecom
    // 'Preferred Language', patient.comuniction
    'Employing Department Branch',
    'Employing Department Name',
    // 'Dependents List',
    // https://bcip.smilecdr.com/fhir-request/Patient?dependentlink=461b0635-c217-4b70-be29-d35bcd25afd6, getPatientByLinkID(query: string)
    // 'Cross-Reference #1', patient, extention, cross reff value
    // 'Cross-Reference #2',
    'Submitting Department',
    'Receiving Department',
    'Regional Office for Processing',
    'Job Title',
    // 'Job Location', don't do for now
    'Instructions regarding the request',
    'OHAG Occupation',
    'OHAG Environment Modifier',
    'OHAG Exposure Modifier',
    'Notefor Employee availability for appointment',
    'Instructions regarding the request',
    'status'
  ];

  constructor(
    private qrequestService: QrequestService,
    private questionnaireService: QuestionnaireService,
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const selectedServiceRequestID = this.route.snapshot.paramMap.get('id');
    console.log(selectedServiceRequestID);
    this.qrequestService
      .getAllQuestionnaireResponseData(selectedServiceRequestID)
      .subscribe(data => {
        console.log(data);
        if (data['entry']) {
          data['entry'].forEach(element => {
            if (
              element['resource']['resourceType'] === 'QuestionnaireResponse'
            ) {
              this.processQuestionnaireResponse(element['resource']);
            }
            if (element['resource']['resourceType'] === 'Questionnaire') {
              this.questId = element.resource.id;
            }
            if (element['resource']['resourceType'] === 'Patient') {
              this.processPatientDetails(element['resource']);
            }
          });
        }

        for (let i = 0; i < this.serviceRequestObject.length; i++) {
          console.log(this.serviceRequestObject[i].name.replace(/\s+/g, ''));
          console.log(this.serviceRequestObject[i].value);
          this.newArr[
            this.serviceRequestObject[i].name.replace(/\s+/g, '')
          ] = this.serviceRequestObject[i].value;
        }

        console.log(this.serviceRequestObject);
        console.log(this.newArr);
        // if (this.questId === 'TEST1') {
        //   // console.log('the questId = TEST1' );
        //   this.useListOrder(this.serviceRequestObject, this.listOrderTest1);
        // }
      });
  }

  //  useListOrder(data, list) {
  //   console.log('SR object length', data.length, data, list.length, list);

  //   list.map( order => {
  //       data.forEach( elem => {
  //           const x = order.toLowerCase();
  //           const y = elem.name.toLowerCase();
  //         if (x === y) {
  //           this.newArr.push(elem);
  //         }
  //     });
  //   });
  //   console.log(this.newArr);

  // }

  processQuestionnaireResponse(data) {
    if (data['item']) {
      this.serviceRequestObject.push({
        name: 'Service Request Id',
        value: data['id']
      });
      this.serviceRequestID = data['id'];
      data['item'].forEach(item => {
        if (item['text'] !== 'Document') {
          const temp = {};
          if (item.answer) {
            temp['name'] = item['text'];
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

        if (item['text'] === 'Document') {
          this.userService.getAnyFHIRObjectByReference('/' + item['answer'][0]['valueReference']['reference']).subscribe(
            document => this.handleDocumentLoading(document)
          );
        }
      });
      this.serviceRequestObject.push({ name: 'status', value: data['status'] });
      console.log(this.questId);
    }
  }

  handleDocumentLoading(data: any) {
    this.documentForServiceRequest.push(data);
  }

  downloadFile(file) {
    const sourceData =
      'data:' + file['content'][0]['attachment']['contentType'] +
      ';base64,' + file['content'][0]['attachment']['data'];
    console.log(sourceData);
    const downloadElement = document.createElement('a');
    const fileName = file['content'][0]['attachment']['title'] ;

    downloadElement.href = sourceData;
    downloadElement.download = fileName;
    downloadElement.click();
  }

  processPatientDetails(data) {
    if (data) {
      this.serviceRequestObject.push({
        name: 'First Name',
        value: data['name'][0]['given'][0]
      });
      this.serviceRequestObject.push({
        name: 'Last Name',
        value: data['name'][0]['family']
      });
      this.serviceRequestObject.push({
        name: 'Date of Birth',
        value: data['birthDate']
      });
      this.serviceRequestObject.push({
        name: 'Employee PRI',
        value: data['id']
      });
      data.extension.forEach(element => {
        if (element.url === 'https://bcip.smilecdr.com/fhir/jobtile') {
          this.serviceRequestObject.push({
            name: 'Job Title',
            value: element.valueString
          });
        }
        if (element.url === 'https://bcip.smilecdr.com/fhir/workplace') {
          this.serviceRequestObject.push({
            name: 'Employing Department Name',
            value: element.valueString
          });
        }
        if (element.url === 'https://bcip.smilecdr.com/fhir/branch') {
          this.serviceRequestObject.push({
            name: 'Employing Department Branch',
            value: element.valueString
          });
        }
      });
    }
  }

  deleteServiceRequest() {
    this.questionnaireService
      .deleteServiceRequest(this.serviceRequestID)
      .subscribe(
        data => {
          console.log(data);
          this.showSuccessMessage = true;
        },
        error => {
          console.error(error);
        }
      );
  }

  redirectToServiceRequestMainPage() {
    this.router.navigateByUrl('/servreqmain');
  }
}
