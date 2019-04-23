import { Component, OnInit, OnDestroy } from '@angular/core';
import { StaffService } from '../../../service/staff.service';
import { UtilService } from '../../../service/util.service';
import { UserService } from '../../../service/user.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import * as FHIR from '../../../interface/FHIR';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-validate-request',
  templateUrl: './validate-request.component.html',
  styleUrls: ['./validate-request.component.scss']
})
export class ValidateRequestComponent implements OnInit {

  constructor(
    private staffService: StaffService,
    private utilService: UtilService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  serviceRequestSummary;
  validateFormGroup: FormGroup;

  onSuccess = false;
  onError = false;

  milestoneObject;
  episodeOfCareId;
  ngOnInit() {

    this.route.params.subscribe(params => {
      this.episodeOfCareId = params['eocId'];
      this.checkIfAssociatedMilestoneListExists();
    });
    this.validateFormGroup = this.formBuilder.group({
      comment: new FormControl('')
    });

    this.processServiceRequestForSummary();
  }


  returnEoC() {
    return sessionStorage.getItem('selectedEpisodeId');
  }
  processServiceRequestForSummary() {
    const temp = {};
    this.staffService
      .getAnyFHIRObjectByCustomQuery(
        'QuestionnaireResponse?identifier=SERVREQ&context=' +
        this.returnEoC()
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

  checkIfAssociatedMilestoneListExists() {
    this.staffService.getStatusList(this.episodeOfCareId).subscribe(data => {
      if (data) {
        console.log(data);
        data['entry'].forEach(entry => {
          this.milestoneObject = entry['resource'];
        });
      }
    });
  }

  changeMileStoneToValidated() {
    const itemAnswer = new FHIR.Answer();
    const dateTime = moment();

    this.milestoneObject['item'].forEach(element => {
      if (element['linkId'] === 'Validated') {
        if (!element['text']) {
          element['text'] = '';
        }
        if (!element['answer']) {
          element['answer'] = [];
          itemAnswer.valueDateTime = new Date();
          element['answer'].push(itemAnswer);
        }
        if (element['answer']) {
          element['answer'].forEach(timeFound => {
            if (timeFound['valueDateTime']) {
              timeFound['valueDateTime'] = dateTime.format();
            }
          });
        }
      }
    });
    this.staffService
      .updateStatusList(
        this.milestoneObject['id'],
        JSON.stringify(this.milestoneObject)
      )
      .subscribe(data => {
        console.log(data);
        this.milestoneObject = data;
      },
        error => {
          console.log(error);
          this.onError = !this.onError;
        },
        () => {
          this.createCommunicationObjectForValidatedMilestone();
          this.onSuccess = !this.onSuccess;
        });
  }

  createCommunicationObjectForValidatedMilestone() {
    const communication = new FHIR.Communication();
    const identifier = new FHIR.Identifier();
    const episodeReference = new FHIR.Reference();
    const categoryConcept = new FHIR.CodeableConcept;
    const categoryCoding = new FHIR.Coding;
    const payload = new FHIR.Payload;

    identifier.value = 'MILESTONE-UDPATE-' + this.episodeOfCareId;
    communication.resourceType = 'Communication';
    communication.status = 'completed';

    categoryCoding.system = 'https://bcip.smilecdr.com/fhir/documentcommunication';
    categoryCoding.code = 'DOCUMENT-CHECKLIST-ITEM-VALIDATED';

    categoryConcept.coding = [categoryCoding];
    communication.category = [categoryConcept];

    episodeReference.reference = 'EpisodeOfCare/' + this.episodeOfCareId;
    communication.context = episodeReference;
    communication.identifier = [identifier];
    const newDate = new Date();

    let authorName = null;
    this.staffService.getPractitionerByID(sessionStorage.getItem('userFHIRID')).subscribe(
      author => {
        authorName = this.utilService.getNameFromResource(author);
        payload.contentString = authorName + ' has validated the work order and moved the milestone to Validated at ' +
        this.utilService.getDate(newDate);
        communication.payload = [payload];
        this.staffService
          .createCommunication(JSON.stringify(communication))
          .subscribe(data => {
            console.log(data);
          });
      },
      error => {
        console.log(error);
      }
    );
  }

  viewDetailedContext() {
    this.router.navigateByUrl('/staff/work-screen');
  }
}
