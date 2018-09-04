import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../service/user.service';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  // patientSubscription: subscription;


  constructor(
    private oauthService: OAuthService,
    private userService: UserService,
    private httpClient: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    const endpoint = 'https://try.smilecdr.com:8000/Patient'
  }

  ngOnDestroy() {
    // this.patientSubscription.unsubscribe();
  }

  newAccountButton() {
    this.router.navigate(['/newaccount']);
  }

}
