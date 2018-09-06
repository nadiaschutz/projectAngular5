import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { UserService } from '../service/user.service';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { MatSort, MatTableDataSource } from '@angular/material';

import { environment } from '../../environments/environment';
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


const EMPLOYEE_RECORD_DATA: 

@Component({
  selector: 'app-employee-summary',
  templateUrl: './employee-summary.component.html',
  styleUrls: ['./employee-summary.component.css']
})
export class EmployeeSummaryComponent implements OnInit {

  // patientSubscription: subscription;
  displayedColumns: string[] = ['type', 'id', 'name', 'number', 'dateCreated', 'dateModified'];
  dataSource = new MatTableDataSource(ACCOUNT_DATA);

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private oauthService: OAuthService,
    private userService: UserService,
    private httpClient: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    // const endpoint = 'https://try.smilecdr.com:8000/Patient'
    this.dataSource.sort = this.sort;

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

}
