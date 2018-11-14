import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-employee-summary',
  templateUrl: './employee-summary.component.html',
  styleUrls: ['./employee-summary.component.css']
})
export class EmployeeSummaryComponent implements OnInit {

  constructor() { }

  ngOnInit() {

    const dependents = JSON.parse(localStorage.getItem('dependents'));
    const employeeSelected = JSON.parse(localStorage.getItem('employee'));

  }

}
