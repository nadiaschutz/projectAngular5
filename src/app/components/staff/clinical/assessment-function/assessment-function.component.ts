import { Component, OnInit, OnDestroy } from '@angular/core';
import { StaffService } from '../../../../service/staff.service';
import { UtilService } from '../../../../service/util.service';
import { UserService } from '../../../../service/user.service';
import {
  FormBuilder,
  FormGroup,
  FormControl
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as FHIR from '../../../../interface/FHIR';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { formatDate } from '@angular/common';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-assessment-function',
  templateUrl: './assessment-function.component.html',
  styleUrls: ['./assessment-function.component.scss']
})
export class AssessmentFunctionComponent implements OnInit {

  constructor(
    private staffService: StaffService,
    private utilService: UtilService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
  }

}
