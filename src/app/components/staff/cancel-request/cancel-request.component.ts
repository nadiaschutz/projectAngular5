import { Component, OnInit, OnDestroy } from '@angular/core';
import { StaffService } from '../../../service/staff.service';
import { UtilService } from '../../../service/util.service';
import { UserService } from '../../../service/user.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as FHIR from '../../../interface/FHIR';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { formatDate } from '@angular/common';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-cancel-request',
  templateUrl: './cancel-request.component.html',
  styleUrls: ['./cancel-request.component.scss']
})
export class CancelRequestComponent implements OnInit {
  cancelFormGroup: FormGroup;

  constructor(
    private staffService: StaffService,
    private utilService: UtilService,
    private formBuilder: FormBuilder,
    private oAuthService: OAuthService,
    private userService: UserService,
    private router: Router
  ) {}

  statusObject;
  episodeOfCare;
  serviceRequestSummary;

  onSuccess = false;

  cancelReasonList = [
    { value: 'REASON_ONE', viewValue: 'As requested by the Employee' },
    {
      value: 'REASON_TWO',
      viewValue: 'As requested by the Department'
    },
    { value: 'REASON_THREE', viewValue: 'The OHAG assessment category is in error (see comment for appropriate category)' },
    { value: 'REASON_FOUR', viewValue: 'Employee is not due for medical exam (see comment for next due date)' },
    { value: 'REASON_FIVE', viewValue: 'Missing or incorrect information (please call your PSOHP office before re-submitting)' },
    { value: 'REASON_SIX', viewValue: 'Other (please call your PSOHP office for details)' },
  ];
  ngOnInit() {
    this.cancelFormGroup = this.formBuilder.group({
      cancelReason: new FormControl(''),
      comment: new FormControl('')
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
          this.processServiceRequestForSummary();
          this.changeStatusToWorkCompleted();
        }
      );

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
                for (const item of individualEntry['item']) {
                  if (item['text'].toLowerCase().includes('regional office')) {
                    if (item['answer']) {
                      temp['region'] = item['answer'][0]['valueString'];
                    }
                  }
                }
                this.staffService
                  .getAnyFHIRObjectByCustomQuery(
                    individualEntry['subject']['reference']
                  )
                  .subscribe(patient => {
                    if (patient) {
                      temp['name'] = this.utilService.getNameFromResource(
                        patient
                      );
                      temp['dob'] = patient['birthDate'];
                      if (patient['identifier']) {
                        temp['pri'] = patient['identifier'][0]['value'];
                      }
                      for (const extension of patient['extension']) {
                        if (
                          extension['url'] ===
                          'https://bcip.smilecdr.com/fhir/workplace'
                        ) {
                          temp['employeeDept'] = extension['valueString'];
                        }
                        if (
                          extension['url'] ===
                          'https://bcip.smilecdr.com/fhir/branch'
                        ) {
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
        }
      );
  }

  returnInputValue(input) {
    return this.cancelFormGroup.get(input).value;
  }

  createEmailPayload() {
    const payload = new FHIR.Payload;

    let reasonGiven;
    let comments;
    if (this.returnInputValue('cancelReason')) {
      for (const reason of this.cancelReasonList) {
        if (reason.value === this.returnInputValue('cancelReason')) {
          reasonGiven = reason.viewValue;
        }
      }
    }

    if (this.returnInputValue('comment')) {
      comments = this.returnInputValue('comment');
    }

    payload.contentString = `
    <p>
      Hello,

      The Service Request ID No. xxxxxxx has been cancelled due to the following reason: {{reasonGiven}}.
      Here are some additional comments regarding this cancellation:

      {{comments}}

      You can call your local PSOHP office for details or you use the CONTACT US feature in the NOHIS portal.

      Thank you for your cooperation,

      Regards,
      The PSOHP Staff
    </p>
    `;

    return payload;
  }

  createCommunication() {
    const communication = new FHIR.Communication();
    const identifier = new FHIR.Identifier();
    const context = new FHIR.Reference();
    const sender = new FHIR.Reference();
    const subject = new FHIR.Reference();
    const partOf = new FHIR.Reference();
    const note = new FHIR.Annotation();
    const category = new FHIR.CodeableConcept();
    const categoryCoding = new FHIR.Coding();
    communication.note = [];
    communication.payload = [];
    category.coding = [];

    identifier.value = 'CANCEL-REQUEST-' + this.episodeOfCare['id'];
    context.reference = 'EpisodeOfCare/' + this.episodeOfCare['id'];
    sender.reference = 'Practitioner/' + sessionStorage.getItem('userFHIRID');
    partOf.reference =
      'QuestionnaireResponse/' + this.serviceRequestSummary['serviceId'];
    subject.reference = this.episodeOfCare['patient']['reference'];
    if (this.returnInputValue('comment')) {
      note.text = this.returnInputValue('comment');
      communication.note.push(note);
    }
    if (this.returnInputValue('cancelReason')) {
      for (const reason of this.cancelReasonList) {
        if (reason.value === this.returnInputValue('cancelReason')) {
          categoryCoding.value = this.returnInputValue('cancelReason');
          categoryCoding.display = reason.viewValue;
          category.coding.push(categoryCoding);
        }
      }
    }

    communication.payload.push(this.createEmailPayload());
    communication.category = [category];
    communication.context = context;
    communication.sender = sender;
    communication.subject = subject;
    communication.partOf = [partOf];
    communication.identifier = [identifier];
    communication.status = 'in-progress';
    communication.resourceType = 'Communication';

    this.staffService.createCommunication(JSON.stringify(communication)).subscribe(
      data => {
        if (data) {
          console.log (data);
          this.changeStatusToSelected();
          this.onSuccess = true;
        }
      },
      error => {
        console.log(error);
      },
      () => {

      }
    );
    console.log(JSON.stringify(communication, undefined, 2));
  }

  viewDetailedContext() {
    this.router.navigateByUrl('/staff/work-screen');
  }

  changeStatusToWorkCompleted() {
    this.staffService
      .getStatusList(this.episodeOfCare['id'])
      .subscribe(data => {
        if (data) {
          data['entry'].forEach(element => {
            const individualEntry = element['resource'];
            this.statusObject = individualEntry;
          });
        }
      });
  }

  changeStatusToSelected() {
    const itemAnswer = new FHIR.Answer();
    const itemTime = new FHIR.Answer();
    const itemReason = new FHIR.Answer();

    const selectedStatus = 'Work-Completed';
    itemTime.valueDate = new Date();
    itemReason.valueString = this.returnInputValue('comment');
    this.statusObject['item'].forEach(element => {
      console.log(element['text']);

      if (element['text'] === selectedStatus) {
        itemAnswer.valueBoolean = true;

        element['answer'] = [];
        element['answer'][0] = itemAnswer;
        element['answer'][1] = itemTime;
        element['answer'][2] = itemReason;
        console.log('matched', element['answer']);
      }
      if (element['text'] !== selectedStatus) {
        element['answer'] = [];

        console.log('unmatched', element['answer']);
      }
    });
    this.staffService
      .updateStatusList(
        this.statusObject['id'],
        JSON.stringify(this.statusObject)
      )
      .subscribe(data => {
        console.log(data);
        this.statusObject = data;
      });
  }
}
