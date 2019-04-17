import { Component, OnInit, Input } from '@angular/core';
import { StaffService } from '../../service/staff.service';
import { UtilService } from '../../service/util.service';
import { UserService } from '../../service/user.service';
import { MilestoneTrackingService } from '../../service/milestone-tracking.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import * as FHIR from '../../interface/FHIR';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-milestone-tracking',
  templateUrl: './milestone-tracking.component.html',
  styleUrls: ['./milestone-tracking.component.scss']
})

export class MilestoneTrackingComponent implements OnInit {

  milestoneFormGroup: FormGroup;

  milestoneForDisplay;
  milestoneObject;
  episodeOfCareId;

  showMilestoneFormGroup = false;

  milestoneSelectionList = [
    { value: 'Validated', viewValue: 'Validated' },
    { value: 'Assigned', viewValue: 'Assigned to Clinician' },
    { value: 'Scheduled', viewValue: 'Scheduled' },
    { value: 'Work-Completed', viewValue: 'Clinical Work Completed' },
    { value: 'Closed', viewValue: 'Closed' }
  ];

  constructor(
    private staffService: StaffService,
    private utilService: UtilService,
    private formBuilder: FormBuilder,
    private oAuthService: OAuthService,
    private userService: UserService,
    private milestoneTrackingService: MilestoneTrackingService,
    private router: Router
  ) { }

  ngOnInit() {

    this.episodeOfCareId = sessionStorage.getItem('selectedEpisodeId');
    this.milestoneFormGroup = this.formBuilder.group({
      status: new FormControl(''),
      statusNote: new FormControl('')
    });
    this.checkIfAssociatedMilestoneListExists();
  }

  changeMilestoneToSelected() {
    const itemAnswer = new FHIR.Answer();
    const dateTime = moment();
    const selectedStatus = this.milestoneFormGroup.get('status').value;
    this.milestoneObject['item'].forEach(element => {
      if (element['linkId'] === selectedStatus) {
        if (!element['text']) {
          element['text'] = '';
        }
        if (!element['answer']) {
          element['answer'] = [];
          itemAnswer.valueDateTime = dateTime.format();
          element['answer'].push(itemAnswer);
        }
        if (element['answer']) {
          element['answer'].forEach(timeFound => {
            if (timeFound['valueDateTime']) {
              timeFound['valueDateTime'] = dateTime.format();
            }
          });
        }
        element['text'] = this.milestoneFormGroup.get('statusNote').value;
        console.log('matched', element['answer']);
      }

    });
    this.showMilestoneFormGroup = !this.showMilestoneFormGroup;
    this.staffService
      .updateStatusList(
        this.milestoneObject['id'],
        JSON.stringify(this.milestoneObject)
      )
      .subscribe(data => {
        console.log(data);
        this.milestoneObject = data;
        // console.log(this.sortMilestone());
        this.sortMilestone();
      },
        error => {
          console.log(error);
        },
        () => {
          this.milestoneFormGroup.patchValue({ status: null });
          this.milestoneFormGroup.patchValue({ statusNote: null });
          this.milestoneFormGroup.reset();
        });
  }

  sortMilestone() {
    if (this.milestoneObject) {
      const arr = [];
      this.milestoneObject.item.forEach(element => {
        if (element.answer) {
          arr.push(element);
        }
      });
      console.log(arr);
      arr.sort(function (a, b) {
        if (a['answer'] && b['answer']) {
          if (a['answer'][0]['valueDateTime'] && b['answer'][0]['valueDateTime']) {
            return (
              new Date(b['answer'][0]['valueDateTime']).getTime() -
              new Date(a['answer'][0]['valueDateTime']).getTime()
            );
          }
        }
      });

      const temp = arr[0];
      if (arr[0]['answer'][0]['valueDateTime']) {

        const timeVariable = this.utilService.convertUTCForDisplay(arr[0]['answer'][0]['valueDateTime']);
        temp['displayTime'] = timeVariable;
      }
      this.milestoneForDisplay = temp;

    }
  }

  checkIfAssociatedMilestoneListExists() {
    this.staffService.getStatusList(this.episodeOfCareId).subscribe(data => {
      if (data) {
        data['entry'].forEach(entry => {
          this.milestoneObject = entry['resource'];
          this.sortMilestone();
        });
      }
    }
    );
  }
}
