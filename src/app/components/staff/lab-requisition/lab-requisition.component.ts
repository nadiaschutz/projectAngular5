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
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-lab-requisition',
  templateUrl: './lab-requisition.component.html',
  styleUrls: ['./lab-requisition.component.scss']
})
export class LabRequisitionComponent implements OnInit {
  printData = {
      assignTo: null,
      speciality: null,
      instructions: null
  }
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
      if(element.resource.resourceType === 'EpisodeOfCare'){
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
        assignTo: new FormControl(''),
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

    const performerReference = new FHIR.Reference();
    performerReference.reference = 'Practitioner/' + this.consultationFormGroup.get('assignTo').value.id;
    procedureRequest.performer = performerReference;

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

    this.staffService.saveProcedureRequest(JSON.stringify(procedureRequest)).subscribe(data => {
      this.requisitionType = '';
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
    
    if (this.serviceDeliveryType != '') {
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



    // console.log('serviceDeliveryType', this.serviceDeliveryType);
    // console.log('procedurerequest', procedureRequest);

    this.staffService.saveProcedureRequest(JSON.stringify(procedureRequest)).subscribe(data => {
      this.requisitionType = '';
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

   /* getPatientByDepartment() {
     const userDept = sessionStorage.getItem('userDept');
        this.patientService.getPatientByWorkplace(userDept).subscribe(
            data => {
               this.patients = data;
               if (this.patients && this.patients.entry) {
                this.listOfPatient = this.patients.entry;
               }
            },
            error => this.handleError(error)
        );

    }*/

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
                    if(this.listQuestionary && this.listQuestionary.length > 0){

                        this.assessmentType = this.listQuestionary[0].resource.item.filter( data => {
                            if(data && data.text === 'PSOHP Service'){
                                return data
                            }
                        })[0].answer[0].valueString;
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
