import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../../../service/staff.service';
import { UtilService } from '../../../../service/util.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import * as FHIR from '../../../../interface/FHIR';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

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

    appointment.status = ''
    appointment.resourceType = 'Appointment';
    appointment.identifier = [identifier];
    appointment.participant = [patientParticipant, practitionerParticipant];
  }
}
