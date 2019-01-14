import { Component, OnInit, NgZone } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

import { UserService } from '../../service/user.service';
import { PatientService } from '../../service/patient.service';
import { StaffService } from '../../service/staff.service';

import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as FHIR from '../../interface/FHIR';
import * as uuid from 'uuid';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-tasklist',
  templateUrl: './tasklist.component.html',
  styleUrls: ['./tasklist.component.scss']
})
export class TasklistComponent implements OnInit {
  taskFormGroup: FormGroup;
  epsOfCare;
  practitioners = [];
  practitionersWithId = [];
  tasklist = [];
  taskID;
  practitionerForClass = {};
  updatingCheck = false;
  constructor(
    private fb: FormBuilder,
    public translate: TranslateService,
    private staffService: StaffService,
    private router: Router,
    private datepipe: DatePipe
  ) {}

  ngOnInit() {
    this.taskFormGroup = this.fb.group({
      description: new FormControl(''),
      assignTo: new FormControl(''),
      instruction: new FormControl('')
      // episodeOfCare: new FormControl('', Validators.required)
    });

    const epsID = '2486';

    this.staffService
      .getAllPractitioners()
      .subscribe(
        data => this.subscribePractitioners(data),
        error => this.handleError(error)
      );

    this.staffService
      .getAllTasksForEpisodeOfCare(epsID)
      .subscribe(
        data => this.loadTasks(data),
        error => this.handleError(error)
      );
  }

  subscribePractitioners(data) {
    data.entry.forEach(element => {
      const individualEntry = element.resource;
      this.practitionersWithId[individualEntry.id] = individualEntry;
      this.practitioners.push(individualEntry);
    });
  }

  handleError(error) {
    console.error(error);
  }

  setTask() {
    const task = new FHIR.Task();
    const context = new FHIR.Reference();
    const taskOwner = new FHIR.Reference();
    const taskAnnotation = new FHIR.Annotation();

    // const taskPerformer = new FHIR.CodeableConcept;
    // const taskPerformerCoding = new FHIR.Coding;
    taskAnnotation.text = this.taskFormGroup.get('instruction').value;
    taskOwner.reference =
      'Practitioner/' + this.taskFormGroup.get('assignTo').value;
    context.reference = 'EpisodeOfCare/' + this.epsOfCare.id;
    task.description = this.taskFormGroup.get('description').value;
    task.status = 'in-progress';
    task.intent = 'order';
    task.priority = 'routine';
    task.context = context;
    task.owner = taskOwner;
    task.note = [taskAnnotation];
    task.resourceType = 'Task';
    // console.log(task);
    // console.log(finalJSON);

    if (!this.updatingCheck) {
      this.staffService
        .saveTask(JSON.stringify(task))
        .subscribe(() => {
          // reset here
          this.staffService
            .getAllTasksForEpisodeOfCare('')
            .subscribe(
              data => this.loadTasks(data),
              error => this.handleError(error)
            );
        });
    } else {
      task.id = this.taskID;
      this.staffService
        .updateTask(this.taskID, JSON.stringify(task))
        .subscribe(() => {
          // reset here
          this.staffService
            .getAllTasksForEpisodeOfCare('')
            .subscribe(
              data => this.loadTasks(data),
              error => this.handleError(error)
            );
        });
    }
  }

  loadTasks(data) {
    if (data.entry) {
      this.tasklist = [];
      data.entry.forEach(element => {
        const task = element.resource;
        const temp = {};
        temp['id'] = task['id'];
        temp['description'] = task['description'];
        temp['note'] = task.note[0].text;
        temp['date'] = this.datepipe.transform(
          task.meta.lastUpdated,
          'yyyy-MM-dd'
        );
        temp['status'] = task['status'];
        temp['practitionerName'] = this.getPractitionerName(
          task['owner']['reference']
        );
        this.tasklist.push(temp);
      });
    }
  }

  getPractitionerName(practitionerReference) {
    let lastName = '';
    let firstName = '';
    const practitionerId = this.getIdFromReference(practitionerReference);
    const practitioner = this.practitionersWithId[practitionerId];
    if (practitioner) {
      practitioner.name.forEach(name => {
        lastName = name['family'];
        name['given'].forEach(givenName => {
          firstName += givenName;
        });
      });
      return  firstName + ' ' + lastName ;
    }
  }

  getIdFromReference(reference) {
    return reference.substring(reference.indexOf('/') + 1, reference.length);
  }

  getPractitionerAssigned(query) {
    this.staffService
      .getAnyFHIRObjectByReference('/' + query)
      .subscribe(data => this.buildNameOfPractitioner(data));
  }

  buildNameOfPractitioner(data) {
    this.practitionerForClass = {};
    data.name.forEach(element => {
      element.given.forEach(firstName => {
        this.practitionerForClass['given'] = firstName;
      });
      this.practitionerForClass['family'] = element;
    });
    // console.log(tempObj)
    // return this.practitionerForClass;
  }
}
