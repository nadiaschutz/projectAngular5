import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../../service/staff.service';
import { UserService } from '../../../service/user.service';
import { UtilService } from '../../../service/util.service';
import * as FHIR from '../../../interface/FHIR';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import * as jspdf from 'jspdf';
import * as html2canvas from 'html2canvas';

@Component({
  selector: 'app-lab-requisition',
  templateUrl: './lab-requisition.component.html',
  styleUrls: ['./lab-requisition.component.scss']
})
export class LabRequisitionComponent implements OnInit {

  episodeOfCareId = '2965';
  requisitionType = '';
  serviceDeliveryType = '';
  instructions = '';
  checkboxArray = [];
  labTestArray = [];
  clinicians = [];
  selectedClinician = '';
  environment = environment;
  patient = {};

  consultationFormGroup: FormGroup;

  constructor(private staffService: StaffService, private userService: UserService,
  private utilService: UtilService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    // For Lab test form, dropdown 1 to select Type of requisition
    // Dropdown 2 to select Service Delivery
    // Instructions
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
  }

  processPatientDetails(episodeOfCareAndRelatedData) {
    episodeOfCareAndRelatedData.entry.forEach(element => {
      if (element.resource.resourceType === 'Patient') {
        this.patient = this.utilService.getPatientJsonObjectFromPatientFhirObject(element.resource);
        console.log(this.patient);
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
    console.log(this.labTestArray);
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

  openConsultationForm() {
    this.consultationFormGroup = this.formBuilder.group({
      assignedTo: new FormControl(''),
      speciality: new FormControl(''),
      instructions: new FormControl('')
    });
  }

  saveConsultation() {
    const procedureRequest = new FHIR.ProcedureRequest;
    procedureRequest.resourceType = 'ProcedureRequest';
    procedureRequest.status = 'active';
    procedureRequest.intent = 'plan';
    procedureRequest.authoredOn = this.utilService.getCurrentDate();
    this.userService.subscribeUserFHIRID().subscribe(authorId => {
      const requester = new FHIR.Requester;
      const requesterReference = new FHIR.Reference();
      requesterReference.reference = 'Practitioner/' + authorId;
      requester.agent = requesterReference;
      procedureRequest.requester = requester;
    });
    const episodeOfCareReference = new FHIR.Reference;
    episodeOfCareReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    procedureRequest.context = episodeOfCareReference;
  }

  saveProcedureRequest() {
    console.log(this.labTestArray);
    const procedureRequest = new FHIR.ProcedureRequest;
    procedureRequest.resourceType = 'ProcedureRequest';
    procedureRequest.status = 'active';
    procedureRequest.intent = 'plan';
    procedureRequest.authoredOn = this.utilService.getCurrentDate();
    this.userService.subscribeUserFHIRID().subscribe(authorId => {
      const requester = new FHIR.Requester;
      const requesterReference = new FHIR.Reference();
      requesterReference.reference = 'Practitioner/' + authorId;
      requester.agent = requesterReference;
      procedureRequest.requester = requester;
    });
    const episodeOfCareReference = new FHIR.Reference;
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
    console.log(procedureRequest);
    this.staffService.saveProcedureRequest(JSON.stringify(procedureRequest)).subscribe(data => {
      console.log(data);
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

}
