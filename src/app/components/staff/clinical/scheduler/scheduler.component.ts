import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../../../service/staff.service';
import { UtilService } from '../../../../service/util.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import * as FHIR from '../../../../interface/FHIR';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import * as jspdf from 'jspdf';
import * as html2canvas from 'html2canvas';
@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent implements OnInit {

  minDate: Date;
  maxDate: Date;

  datePickerConfig: Partial<BsDatepickerConfig>;

  scheduleFormGroup: FormGroup;
  episodeOfCare;
  serviceRequestSummary;

  postCompleteFlag = false;
  printFlag = false;
  dependentList = [];
  cliniciansList = [];
  attendanceOptionList = [
    { value: 'arrived', viewValue: 'Show' },
    { value: 'noshow', viewValue: 'No Show' }
  ];
  constructor(
    private staffService: StaffService,
    private utilService: UtilService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.minDate.setDate(this.minDate.getDate() - 43800);
    this.maxDate.setDate(this.maxDate.getDate());
  }

  ngOnInit() {
    this.datePickerConfig = Object.assign(
      {},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'YYYY-MM-DD',
        showWeekNumbers: false
      }
    );
    this.scheduleFormGroup = this.formBuilder.group({
      appointment: new FormControl(''),
      clinician: new FormControl(''),
      attendance: new FormControl('')
    });
    this.staffService
      .getAnyFHIRObjectByCustomQuery(
        'EpisodeOfCare/' + sessionStorage.getItem('selectedEpisodeId')
      )
      .subscribe(
        data => {
          if (data) {
            this.episodeOfCare = data;
          }
        },
        error => {
          console.log(error);
        },
        () => {
          this.fetchAllClinicians();
          this.processServiceRequestForSummary();
        }
      );
  }

  fetchAllClinicians() {
    this.staffService.getAllClinicians().subscribe(data => {
      if (data['entry']) {
        data['entry'].forEach(element => {
          const clinician = element['resource'];
          this.cliniciansList.push({
            id: clinician['id'],
            name: this.utilService.getNameFromResource(clinician)
          });
        });
      }
    });
  }

  processServiceRequestForSummary() {
    const temp = {};
    this.staffService
      .getAnyFHIRObjectByCustomQuery(
        'QuestionnaireResponse?identifier=SERVREQ&context=' +
          this.episodeOfCare['id']
      )
      .subscribe(
        questionnaireFound => {
          if (questionnaireFound) {
            if (questionnaireFound['entry']) {
              for (const currentEntry of questionnaireFound['entry']) {
                const individualEntry = currentEntry['resource'];
                temp['serviceId'] = individualEntry['id'];
                console.log(individualEntry);
                this.staffService
                  .getAnyFHIRObjectByCustomQuery(
                    individualEntry['subject']['reference']
                  )
                  .subscribe(patient => {
                    if (patient) {
                      temp['patientId'] = patient['id'];
                      temp['name'] = this.utilService.getNameFromResource(
                        patient
                      );
                      temp['dob'] = patient['birthDate'];
                      if (patient['identifier']) {
                        temp['pri'] = patient['identifier'][0]['value'];
                      }
                      for (const extension of patient['extension']) {
                        if (extension['url'] === 'https://bcip.smilecdr.com/fhir/workplace') {
                          temp['employeeDept'] = extension['valueString'];
                        }
                        if (extension['url'] === 'https://bcip.smilecdr.com/fhir/branch') {
                          temp['employeeBranch'] = extension['valueString'];
                        }
                        if (extension['url'] === 'https://bcip.smilecdr.com/fhir/dependentlink') {
                          this.processListOfDependents(extension['valueString']);
                        }
                      }
                      this.serviceRequestSummary = temp;
                    }
                  });
              }
            }
          }
        },
        error => {
          console.log(error);
        },
        () => {
          console.log('we set them boys');
        }
      );
  }

  processListOfDependents(patientLinkId) {
    this.staffService
      .getAnyFHIRObjectByReference(
        '/Patient?dependentlink=' + patientLinkId + '&employeetype=Dependent'
      )
      .subscribe(
        data => {
          if (data) {
            if (data['total'] > 0) {
              data['entry'].forEach(element => {
                const individualEntry = element['resource'];
                const temp = {};
                temp['dep_clientName'] = this.utilService.getNameFromResource(
                  individualEntry
                );
                temp['dep_id'] = individualEntry['id'];
                temp['dep_clientDOB'] = individualEntry['birthDate'];
                this.dependentList.push(temp);
              });
            }
          }
        },
        error => {
          console.log(error);
        }
      );
  }
  returnInputValue(input) {
    return this.scheduleFormGroup.get(input).value;
  }

  saveAppointment() {
    const appointment = new FHIR.Appointment;
    const identifier = new FHIR.Identifier;
    const patientType = new FHIR.CodeableConcept;
    const practitionerType = new FHIR.CodeableConcept;
    const patientParticipant = new FHIR.Participant;
    const practitionerParticipant = new FHIR.Participant;

    patientType.text = 'Patient';
    patientParticipant.type = [patientType];
    patientParticipant.actor = new FHIR.Reference;
    patientParticipant.actor.reference = 'Patient/' + this.serviceRequestSummary['patientId'];

    practitionerType.text = 'Practitioner';
    practitionerParticipant.type = [practitionerType];
    practitionerParticipant.actor = new FHIR.Reference;
    practitionerParticipant.actor.reference = 'Practitioner/' + this.returnInputValue('clinician');

    identifier.value = 'SCHEDULED-APPOINTMENT';

    appointment.status = this.returnInputValue('attendance');
    appointment.resourceType = 'Appointment';
    appointment.identifier = [identifier];
    appointment.start = this.returnInputValue('appointment');
    appointment.participant = [patientParticipant, practitionerParticipant];

    this.staffService.createAppointment(JSON.stringify(appointment)).subscribe(
      data => {
        if (data) {
          console.log (data);
        }
      },
      error => {
        console.log(error);
      },
      () => {
        this.postCompleteFlag = true;
        this.printToPDF();
      }
    );
  }

  printToPDF() {
    this.printFlag = !this.printFlag;
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
      pdf.save('Appointment.pdf'); // Generated PDF
      });

  }


  viewDetailedContext() {
    this.router.navigateByUrl('/staff/work-screen/' + this.episodeOfCare['id']);
  }

}
