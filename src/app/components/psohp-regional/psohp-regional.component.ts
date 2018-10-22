import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { UserService } from '../../service/user.service';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { MatSort, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';


export interface AccountElement {
  type: string,
  id: string,
  name: string,
  number: string,
  dateCreated: string;
  dateModified: string

  // TODO change date variables to date type
}


const ACCOUNT_DATA: AccountElement[] = [
  { type: 'PSOHP Regional Office', id: 'Atlatntic', name: 'Name', number: '00333', dateCreated: 'Jan 13, 2009', dateModified: 'Jan 15, 2012' },
  { type: 'PSOHP District Office', id: 'Halifax', name: 'Name', number: '00343', dateCreated: 'Mar 12, 2010', dateModified: 'Jan 15, 2012' },
  { type: 'Client Department Account ', id: 'Agriculture and Agri-Foods', name: 'Name', number: '00393', dateCreated: 'Jan 13, 2009', dateModified: 'Jan 15, 2012' },
  { type: 'NOHIS User Account', id: 'Administrative Officer', name: 'Name', number: '00489', dateCreated: 'Jan 13, 2009', dateModified: 'Jan 15, 2012' }
]


// const EMPLOYEE_RECORD_DATA: 

@Component({
  selector: 'app-psohp-regional',
  templateUrl: './psohp-regional.component.html',
  styleUrls: ['./psohp-regional.component.css']
})
export class PsohpRegionalComponent implements OnInit, OnDestroy {

  @ViewChild(MatSort) sort: MatSort;

  // patientSubscription: subscription;
  displayedColumns: string[] = ['type', 'id', 'name', 'number'];
  dataSource = new MatTableDataSource(ACCOUNT_DATA);
  psohpFormGroup: FormGroup;
  offices: Object;


  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor(
    private fb: FormBuilder,
    private oauthService: OAuthService,
    private userService: UserService,
    private httpClient: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {

    this.offices = {
      'regional': [
        'Atlantic', 'Quebec', 'NCR', 'Ontario', 'Prairies', 'BC'
      ],
      'district': [
        'Halifax', 'Moncton', 'St-John',
        'Montreal', 'Quebec City',
        'NCR',
        'Toronto', 'Kingston',
        'Winnipeg', 'Regina', 'Calgary', 'Edmonton',
        'Vancouver', 'Victoria'
      ]
    };

    this.psohpFormGroup = this.fb.group({
      districtOffice: [''],
      regionalOffice: [''],
      email: [''],
      phone: [''],
      fax: [''],
      phoneNumber: [''],
      addressStreet: [''],
      addressCity: [''],
      addressProv: [''],
      addressPcode: [''],
      addressCountry: ['']
    });
    // const endpoint = 'https://try.smilecdr.com:8000/Patient'
    this.dataSource.sort = this.sort;

  }

  setOrganization() {
    //
  }

  ngOnDestroy() {
    // this.patientSubscription.unsubscribe();
  }

  newAccountButton() {
    this.router.navigate(['/newaccount']);
  }

  newEmployeeButton() {
    this.router.navigate(['/employeeform']);
  }


  get districtOffice() {
    return this.psohpFormGroup.get('districtOffice');
  }
  get regionalOffice(){
    return this.psohpFormGroup.get('regionalOffice');
  }
  get fax() {
    return this.psohpFormGroup.get('fax');
  }
  get email() {
    return this.psohpFormGroup.get('email');
  }
  get addressCity() {
    return this.psohpFormGroup.get('addressCity');
  }

  get addressStreet() {
    return this.psohpFormGroup.get('addressStreet');
  }
  get addressProv() {
    return this.psohpFormGroup.get('addressProv');
  }
  get addressPcode() {
    return this.psohpFormGroup.get('addressPcode');
  }
  get addressCountry() {
    return this.psohpFormGroup.get('addressCountry');
  }
}
