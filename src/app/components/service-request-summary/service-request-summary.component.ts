import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { QrequestService } from '../../service/qrequest.service';
import { QuestionnaireService } from '../../service/questionnaire.service';
import { Router, ActivatedRoute } from '@angular/router';
import { element } from '@angular/core/src/render3/instructions';
import { UserService } from 'src/app/service/user.service';
import { ServiceRequestSummaryService } from 'src/app/service/service-request-summary.service';


// for custom form components to work
import { Validators } from '@angular/forms';
import { Field } from '../dynamic-forms/field.interface';
import { FieldConfig } from '../dynamic-forms/field-config.interface';
import { DynamicFormComponent } from '../dynamic-forms/dynamic-form.component';
import { CustomValidator } from '../dynamic-forms/custom-validator';
import { filter } from 'rxjs/operators';



@Component({
  selector: 'app-service-request-summary',
  templateUrl: './service-request-summary.component.html',
  styleUrls: ['./service-request-summary.component.scss']
})


export class ServiceRequestSummaryComponent implements OnInit, AfterViewInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  // var for styling each form field
  style = 'col-6';


  questId = null;
  newArr = [];
  allFields = [];
  allEnableWhenFields = [];
  configuration;
  config: FieldConfig[] = [];
  questResp;

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
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {


    this.activatedRoute.data.subscribe(data => {
      console.log(data);
      if (data.data['entry']) {
        data.data['entry'].forEach(elem => {
          if (
            elem['resource']['resourceType'] === 'QuestionnaireResponse'
          ) {
            this.processQuestionnaireResponse(elem['resource']);
          }
          if (elem['resource']['resourceType'] === 'Questionnaire') {
            this.questId = elem.resource.id;
            this.processQuestionnaire(elem['resource']);
          }
          // if (elem['resource']['resourceType'] === 'Patient') {
          //   this.processPatientDetails(elem['resource']);
          // }
        });

      }
    });
    this.showFields();
  }




  ngAfterViewInit() {
    setTimeout(() => {
      console.log(this.form);

      // let previousValid = this.form.valid;
      // this.form.changes.subscribe(() => {
      //   if (this.form.valid !== previousValid) {
      //     previousValid = this.form.valid;
      //     this.form.setDisabled('submit', !previousValid);
      //   }
      // });

      // this.form.setDisabled('submit', true);
    });


    // if you want to style 2 form fields per a row do these :
    // this.wrap();
    // this.addDiv();
    // the end

  }



  submit(value: { [name: string]: any }) {
    console.log(value);
  }


  wrap() {
    const x = $('.field-holder-2 form-input');
    for (let i = 0; i < x.length; i++) {
      console.log(x[i]);
      $(x[i]).wrap("<div class='" + this.style + "'></div>");
    }
  }



  addDiv() {
    const sections = $('.dynamic-form .' + this.style);
    for (let i = 0; i < sections.length; i += 2) {
      sections.slice(i, i + 2).wrapAll("<div class='row'></div>");
    }
  }

  processQuestionnaire(data) {
    console.log('processQuestionnaire', data);
    data.item.forEach(field => {
      this.allFields.push(field);
    });
  }

  processQuestionnaireResponse(data) {
    console.log('processQuestionnaireResponse', data);
    this.questResp = data.item;

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
            if (item['answer'][0]['valueCoding']) {
              temp['value'] = item['answer'][0]['valueCoding']['display'];
            } else if (item['answer'][0]['valueString']) {
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
      // this.serviceRequestObject.push({ name: 'status', value: data['status'] });
      // console.log(this.questId);
    }
  }


  showFields() {
    const fieldsToShow = [];
    // allEnableWhenFields
    console.log(this.allFields);
    this.configuration = this.allFields.map(el => {
      if (el.code[1].code === 'BOOL') {
        const enableWhen = this.populateEnableWhenObj(el);
        return {
          type: 'checkbox',
          label: el.text,
          name: el.linkId,
          typeElem: el.code[1].code,
          enableWhen: el.enableWhen ? enableWhen : false,
          elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',
          value: el.enableWhen ? null : false,
          disabled: true,
          validation: false
        };
      } else if (el.code[1].code === 'COMMENT') {
        const enableWhen = this.populateEnableWhenObj(el);
        return {
          type: 'comment',
          label: el.text,
          name: el.linkId,
          typeElem: el.code[1].code,
          enableWhen: el.enableWhen ? enableWhen : false,
          elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',
          value: '-',
          disabled: true,
          validation: false
        };
      } else {
        const enableWhen = this.populateEnableWhenObj(el);
        return {
          type: 'input',
          inputType: 'text',
          label: el.text,
          name: el.linkId,
          enableWhen: el.enableWhen ? enableWhen : false,
          elementClass: el.enableWhen ? 'enable-when-hide' : 'enable-when-show',
          value: '-',
          disabled: true,
          validation: false
        };

      }


    });
    this.configuration.forEach(field => {
      console.log(field);
      this.questResp.forEach(qRespElem => {
        if (field.name === qRespElem.linkId) {
          if (field.type === 'checkbox') {
            field.value = JSON.parse(qRespElem.answer[0]['valueCoding']['display']);
          } else {
            field.value = qRespElem.answer[0]['valueCoding']['display'];
          }
        }
        if (field.enableWhen) {
          for (const formElem of field.enableWhen) {
            if (formElem.enableWhenQ === qRespElem.linkId) {
              console.log(field);
              if (formElem.enableWhenA === qRespElem.answer[0]['valueCoding']['display']) {
                field.elementClass = 'enable-when-show';
                console.log(field);
              }
            }
          }
        }
      });
    });

    this.config = this.configuration;
    console.log(this.config);

  }

  populateEnableWhenObj(el) {
    const enableWhen = [];
    if (el.enableWhen) {
      el.enableWhen.forEach(elem => {
        enableWhen.push(
          {
            enableWhenQ: elem.question,
            enableWhenA: elem.answerCoding.display
          });
      });
    }
    return enableWhen;
  }


  handleDocumentLoading(data: any) {
    this.documentForServiceRequest.push(data);
  }

  downloadFile(incomingFile) {

    const byteCharacters = atob(incomingFile['content'][0]['attachment']['data']);

    const byteNumbers = new Array(byteCharacters.length);
    for (let index = 0; index < byteCharacters.length; index++) {
      byteNumbers[index] = byteCharacters.charCodeAt(index);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { 'type': incomingFile['content'][0]['attachment']['contentType'] });

    if (navigator.msSaveBlob) {
      const filename = incomingFile['content'][0]['attachment']['title'];
      navigator.msSaveBlob(blob, filename);
    } else {
      const fileLink = document.createElement('a');
      fileLink.href = URL.createObjectURL(blob);
      fileLink.setAttribute('visibility', 'hidden');
      fileLink.download = incomingFile['content'][0]['attachment']['title'];
      document.body.appendChild(fileLink);
      fileLink.click();
      document.body.removeChild(fileLink);
    }

  }

  previewFile(incomingFile) {

    const byteCharacters = atob(incomingFile['content'][0]['attachment']['data']);

    const byteNumbers = new Array(byteCharacters.length);
    for (let index = 0; index < byteCharacters.length; index++) {
      byteNumbers[index] = byteCharacters.charCodeAt(index);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { 'type': incomingFile['content'][0]['attachment']['contentType'] });
    const filename = incomingFile['content'][0]['attachment']['title'];

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      console.log(filename);
      const fileLink = document.createElement('a');
      fileLink.href = URL.createObjectURL(blob);
      fileLink.name = filename;
      fileLink.target = '_blank';
      fileLink.setAttribute('download', filename);
      window.open(fileLink.href);
    }
  }


  redirectToServiceRequestMainPage() {
    this.router.navigateByUrl('/servreqmain');
  }
}
