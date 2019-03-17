import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../../service/staff.service';
import { UserService } from '../../../service/user.service';
import { UtilService } from '../../../service/util.service';
import * as FHIR from '../../../interface/FHIR';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import * as jspdf from 'jspdf';
import * as html2canvas from 'html2canvas';
import {PatientService} from '../../../service/patient.service';
import { formatDate } from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-lab-requisition',
  templateUrl: './lab-requisition.component.html',
  styleUrls: ['./lab-requisition.component.scss']
})
export class LabRequisitionComponent implements OnInit {
    consultationClinicianName: any;
    consultationClinicianEmail: any;
    diagnosticsClinicianEmail: any;
    diagnosticsClinicianName: any;
  printData = {
      assignTo: null,
      speciality: null,
      instructions: null
  };
  id_token_claims_obj = JSON.parse(sessionStorage.getItem('id_token_claims_obj'));
  userName = sessionStorage.getItem('userName');
  todayDate: any;
  listOfPatient: any;
  selectedPatient: any;
  specialities = [
      'Anaesthesia',
      'Dermatology',
      'Emergency medicine',
      'Cardiac Surgery',
      'Family medicine',
      'Internal medicine',
      'Neurology',
      'Obstetrics and Gynecology',
      'Ophthalmology',
      'Orthopedic surgery',
      'Otolaryngology',
      'Oral and Maxillofacial Surgery',
      'Pediatrics',
      'Podiatry',
      'Psychiatry',
      'Radiology (diagnostic)',
      'Surgery (general)',
      'Urology',
      'Neurosurgery',
      'Plastic surgery',
      'Gastroenterology',
      'Pulmonology'
  ];
  episodeOfCareId = null;
  requisitionType = '';
  serviceDeliveryType = '';
  instructions = '';
  checkboxArray = [];
  labTestArray = [];
  clinicians = [];
  selectedClinician = '';
  environment = environment;
  patient = {} as any;
  consultationFormGroup: FormGroup;
  currentPractitionerFHIRIDInSession;
  patients: any;
  clinician_id: any;
    listQuestionary: any;
    questionaryData: any;
    eocId: any;
    assessmentType: any;

  constructor(private staffService: StaffService,
              private patientService: PatientService,
              private route: ActivatedRoute,
              private userService: UserService,
              private utilService: UtilService,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
      this.route.params.subscribe(params => {
          this.episodeOfCareId = params['eocId'];


          this.staffService.getLabTestQuestionnaire().subscribe(data => {
              this.processQuestionnaire(data);
              this.fetchAllClinicians();
              this.staffService.getIncludedItemsForEpisodeOfCare(this.episodeOfCareId).subscribe(episodeOfCareAndRelatedData => {

                  this.processPatientDetails(episodeOfCareAndRelatedData);
              });
          });
          for (let i = 0; i < 34; i++) {
              this.checkboxArray.push('item: ' + i);
          }



      });



    this.currentPractitionerFHIRIDInSession = sessionStorage.getItem('userFHIRID');



   /* if (sessionStorage.getItem('userDept') !== null) {
      this.getPatientByDepartment();
    }*/

    this.todayDate = this.utilService.getCurrentDate();
    if (this.id_token_claims_obj) {
     this.clinician_id = this.id_token_claims_obj.sub;
    }

  }

  processPatientDetails(episodeOfCareAndRelatedData) {
    episodeOfCareAndRelatedData.entry.forEach(element => {
      if (element.resource.resourceType === 'Patient') {
        this.patient = this.utilService.getPatientJsonObjectFromPatientFhirObject(element.resource);
      }
      if (element.resource.resourceType === 'EpisodeOfCare') {
          this.getQuestionnaireResponse(element.resource.resourceType , element.resource.id);
      }
    });
  }

  processQuestionnaire(data) {
    data.item.forEach(element => {
      const temp = {};
      temp['id'] = element['linkId'];
      temp['text'] = element['text'];
      if (element.item) {
        temp['items'] = new Array();
        element.item.forEach(items => {
          temp['items'].push({id: items['linkId'], text: items['text'], checked: false});
        });
      }
      this.labTestArray.push(temp);
    });
  }

  fetchAllClinicians() {
    this.staffService.getAllClinicians().subscribe(data => {
      if (data['entry']) {
        data['entry'].forEach(element => {
          const clinician = element['resource'];
          this.clinicians.push({id: clinician['id'],
          name: this.utilService.getNameFromResource(clinician)});
          // this.cliniciansWithId[clinician.id] = clinician;
        });
      }
    });
  }

  checkForChangeInRequisitionType() {
    if (this.requisitionType === 'Medical Information' || 'Consultation') {
      this.consultationFormGroup = this.formBuilder.group({

          consultationClinicianEmail: new FormControl(''),
          consultationClinicianName: new FormControl(''),
        speciality: new FormControl(''),
        instructions: new FormControl('')
      });
    }
  }

  saveConsultation() {
    const procedureRequest = new FHIR.ProcedureRequest;
    procedureRequest.resourceType = 'ProcedureRequest';
    procedureRequest.status = 'active';
    procedureRequest.intent = 'plan';
    procedureRequest.authoredOn = this.utilService.getCurrentDate();
    const requester = new FHIR.Requester;
    const requesterReference = new FHIR.Reference();
    requesterReference.reference = 'Practitioner/' + this.currentPractitionerFHIRIDInSession;
    requester.agent = requesterReference;
    procedureRequest.requester = requester;

    const episodeOfCareReference = new FHIR.Reference;
    episodeOfCareReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    procedureRequest.context = episodeOfCareReference;

   /* const performerReference = new FHIR.Reference();
    performerReference.reference = 'Practitioner/' + this.consultationFormGroup.get('assignTo').value.id;
    procedureRequest.performer = performerReference;*/

    const annotation = new FHIR.Annotation;
    annotation.text = this.consultationFormGroup.get('instructions').value;
    procedureRequest.note = [annotation];

    const performerType = new FHIR.CodeableConcept;
    performerType.text = this.consultationFormGroup.get('speciality').value;
    procedureRequest.performerType = performerType;

    const identifier = new FHIR.Identifier;
    identifier.system = 'requisition-type';
    identifier.value = this.requisitionType;
    procedureRequest.identifier = [identifier];


      const extension = [];


      if (this.consultationClinicianName) {
          const consultationClinicianName = {
              'url': 'http://nohis.gc.ca/external-clinician-name',
              'valueString': this.consultationClinicianName
          };
          extension.push(consultationClinicianName);
      }
      if (this.consultationClinicianEmail) {
          const email = {
              'url': 'http://nohis.gc.ca/external-clinician-email',
              'valueString': this.consultationClinicianEmail
          };
          extension.push(email);
      }




      const cloanProcedureRequest =  JSON.parse(JSON.stringify(procedureRequest));

      cloanProcedureRequest['extension'] = extension;



    this.staffService.saveProcedureRequest(JSON.stringify(cloanProcedureRequest)).subscribe(data => {

        if (data) {
            const context = data['context'].reference;


            this.staffService.getDocumentsChecklistLab(context).subscribe( dataItem => {

                let resource: any;
                if (dataItem && dataItem['entry'] && dataItem['entry'][0]) {
                    resource = dataItem['entry'][0].resource;

                    if (resource && resource['item']) {
                        const req = {
                            'linkId': resource['item'].length + 1,
                            'text':  this.requisitionType + ' - ' + moment().format('MMM DD YYYY'),
                            'answer': [
                                {
                                    'valueBoolean': false
                                }
                            ]
                        } ;

                        resource['item'].push(req);

                    } else {
                        resource['item'] = [{
                            'linkId': '1',
                            'text':  this.requisitionType + ' - ' + moment().format('MMM DD YYYY'),
                            'answer': [
                                {
                                    'valueBoolean': false
                                }
                            ]
                        }];
                    }

                    const udateDocId = resource['id'];

                    this.staffService.updateDocumentFile(udateDocId , resource).subscribe(
                      updatedDocItem => {
                        console.log(updatedDocItem);
                      },
                      error => {
                        console.log(error);
                      },
                      () => {
                        this.requisitionType = '';
                        this.consultationClinicianEmail = null;
                        this.consultationClinicianName  = null;
                        this.labTestArray = [];
                        this.printData.instructions = null;
                        this.printData.speciality = null;
                      }
                      );

                }



            });


        }
    });
  }

  saveProcedureRequest() {
    const procedureRequest = new FHIR.ProcedureRequest;
    const requester = new FHIR.Requester;
    const requesterReference = new FHIR.Reference();
    const episodeOfCareReference = new FHIR.Reference;
    procedureRequest.resourceType = 'ProcedureRequest';
    procedureRequest.status = 'active';
    procedureRequest.intent = 'plan';
    procedureRequest.authoredOn = this.utilService.getCurrentDate();
    requesterReference.reference = 'Practitioner/' + this.currentPractitionerFHIRIDInSession;
    requester.agent = requesterReference;
    procedureRequest.requester = requester;

    episodeOfCareReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    procedureRequest.context = episodeOfCareReference;
    const categoryCodingArray = new Array<FHIR.Coding>();
    this.labTestArray.forEach(item => {
      item.items.forEach(element => {
        if (element.checked) {
          const coding = new FHIR.Coding;
          coding.display = element.text;
          categoryCodingArray.push(coding);
        }
      });
    });

    const category = new FHIR.CodeableConcept;
    category.coding = categoryCodingArray;

    procedureRequest.category = [category];

    if (this.serviceDeliveryType !== '') {
      const category2CodingArray = new Array<FHIR.Coding>();

      const coding2 = new FHIR.Coding;
      coding2.code = this.serviceDeliveryType === 'Point of Care' ? 'point-of-care' : 'referral';
      coding2.display = this.serviceDeliveryType;
      category2CodingArray.push(coding2);

      const category2 = new FHIR.CodeableConcept;
      category2.coding = category2CodingArray;
      category2.text = 'Service Delivery';

      procedureRequest.category.push(category2);
    }


    const annotation = new FHIR.Annotation;
    annotation.text = this.instructions;
    procedureRequest.note = [annotation];

    const identifier = new FHIR.Identifier;
    identifier.system = 'requisition-type';
    identifier.value = 'Diagnostics Test';
    procedureRequest.identifier = [identifier];

    const extension = [];

      if (this.diagnosticsClinicianName) {
          const diagnosticsClinicianName = {
              'url': 'http://nohis.gc.ca/external-clinician-name',
              'valueString': this.diagnosticsClinicianName
          };
          extension.push(diagnosticsClinicianName);
      }
      if (this.diagnosticsClinicianEmail) {
          const email = {
              'url': 'http://nohis.gc.ca/external-clinician-email',
              'valueString': this.diagnosticsClinicianEmail
          };
          extension.push(email);
      }


      const cloanProcedureRequest =  JSON.parse(JSON.stringify(procedureRequest));

      cloanProcedureRequest['extension'] = extension;


    this.staffService.saveProcedureRequest(JSON.stringify(cloanProcedureRequest)).subscribe(data => {


        if (data) {
            const context = data['context'].reference;

            this.staffService.getDocumentsChecklistLab(context).subscribe( dataItem => {

                let resource: any;
                if (dataItem && dataItem['entry'] && dataItem['entry'][0]) {
                    resource = dataItem['entry'][0].resource;

                    if (resource && resource['item']) {
                        const req = {
                            'linkId': resource['item'].length + 1,
                            'text':  this.requisitionType + ' - ' + moment().format('MMM DD YYYY'),
                            'answer': [
                                {
                                    'valueBoolean': false
                                }
                            ]
                        } ;

                        resource['item'].push(req);

                    } else {
                        resource['item'] = [{
                            'linkId': '1',
                            'text':  this.requisitionType + ' - ' + moment().format('MMM DD YYYY'),
                            'answer': [
                                {
                                    'valueBoolean': false
                                }
                            ]
                        }];
                    }

                    const udateDocId = resource['id'];

                    this.staffService.updateDocumentFile(udateDocId , resource).subscribe( dataItem => {
                        this.requisitionType = '';
                        this.diagnosticsClinicianEmail = null;
                        this.diagnosticsClinicianName  = null;
                        this.labTestArray = [];
                        this.printData.instructions = null;
                        this.printData.speciality = null;

                    });
                }

            });


        }

    });
  }

  printToPDF() {
    const data = document.getElementById('print');
    html2canvas(data).then(canvas => {
    // Few necessary setting options
    const imgWidth = 190;
    const pageHeight = 350;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    const heightLeft = imgHeight;

    const contentDataURL = canvas.toDataURL('image/png');
    const pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
    const position = 0;
    pdf.addImage(contentDataURL, 'PNG', 10, position, imgWidth, imgHeight);
    pdf.save('Diagnostics Test.pdf'); // Generated PDF
    });
  }


    handleError(error) {
        console.log(error);
    }



    getDate(dateTime) {
        return formatDate(new Date(dateTime), 'MMM d, y', 'en');
    }


    getQuestionnaireResponse(resourceType , resourseId) {

        this.patientService.QuestionnaireResponse(resourceType , resourseId).subscribe(
            data => {

                this.questionaryData = data;


                if (this.questionaryData && this.questionaryData.entry && this.questionaryData.entry.length > 0) {
                    this.listQuestionary = this.questionaryData.entry;
                    if (this.listQuestionary && this.listQuestionary.length > 0) {

                      for (const questionnaire of this.listQuestionary) {
                        const qr = questionnaire['resource'];
                        if (qr['item']) {
                          qr.item.forEach(item => {
                            if (item['linkId'] === 'PSOHPSERV') {
                              for (const answer of item['answer']) {
                                if (answer['valueCoding']) {
                                  this.assessmentType = answer['valueCoding']['display'];
                                }
                              }
                            }
                          });
                        }
                      }
                       
                    }





                }

            },
            error => this.handleError(error)
        );

    }


    printConsutationMadicalInfo(name) {
        const data = document.getElementById('print2');
        html2canvas(data).then(canvas => {
            // Few necessary setting options
            const imgWidth = 190;
            const pageHeight = 350;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            const heightLeft = imgHeight;

            const contentDataURL = canvas.toDataURL('image/png');
            const pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
            const position = 0;
            pdf.addImage(contentDataURL, 'PNG', 10, position, imgWidth, imgHeight);
            pdf.save( name + '.pdf'); // Generated PDF
        });
    }


}
