import { Component, OnInit } from '@angular/core';
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

import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as Employee from '../../interface/patient';
import * as uuid from 'uuid';

export interface AccountType {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})
export class NewAccountComponent implements OnInit {

  accountFormGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient,
    public translate: TranslateService,
    private oauthService: OAuthService,
    private userService: UserService,
    private patientService: PatientService,
    private router: Router
  ) { }

  accountTypes: AccountType[] = [
    { value: 'Client Department', viewValue: 'Client Department' },
    { value: 'PSOHP', viewValue: 'PSOHP' }
  ];

  ngOnInit() {
    this.accountFormGroup = this.fb.group({
      userType: new FormControl('', [Validators.required]),
      givenName: new FormControl('', [Validators.required]),
      familyName: new FormControl('', [Validators.required]),
      pri: new FormControl('', [Validators.required]),
      userRole: new FormControl('', [Validators.required]),
      userDescription: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      regionalOffice: new FormControl('', [Validators.required]),
      districtOffice: new FormControl('', [Validators.required]),
      departmentName: new FormControl('', [Validators.required]),
      departmentBranch: new FormControl('', [Validators.required]),
      accessProfile: new FormControl('', [Validators.required]),
    });
  }

}
