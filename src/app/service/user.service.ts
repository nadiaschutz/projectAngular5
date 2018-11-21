import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

import * as Rx from 'rxjs';

@Injectable()
export class UserService {

  public newPatientSubject = new Rx.BehaviorSubject<Object>(null);
  newPatientSubject$ = this.newPatientSubject.asObservable();

  sessionObject = {
    'resourceType': 'Bundle',
    'type': 'transaction',
    entry: [],
  };


  selectID = '';
  constructor(

    private httpClient: HttpClient,
    private oauthService: OAuthService,
    private router: Router

  ) { }

  setObjectBase(data) {
    this.sessionObject.entry.push({ 'resource': data });

    this.newPatientSubject.next(this.sessionObject);
  }

  getObjectBase() {

    return this.sessionObject;
  }
  // TODO Move all calls to FHIR resources into fhir.service.ts


  getSelectedID(data) {
    this.selectID = data;
  }

  returnSelectedID() {
    return this.selectID;
  }

  logout() {

    // Uses the OAuthService library to revoke token and log the user out
    // if (!this.oauthService.hasValidAccessToken()) {
    //     this.router.navigate(['/']);
    // }

    const header = this.getLoginHeaders();

    this.httpClient.post(environment.logoutURI + '/logout?cb=none&revoke=token', {}, { headers: header, withCredentials: true })
      .subscribe(item => {
        console.log(item);
      }, err => {
        console.log(err);
      });

      this.oauthService.logOut();
    this.router.navigate(['']);

  }

  login(user: string, pass: string) {

    // Get headers for the login portion of the site
    const header = this.getLoginHeaders();

    // Posts a body containing the call for The “Resource Owner Password Credentials” Flow
    // This takes three inputs, a username and password, and a header.
    // scopeURL is an environment variable that a user sets, containing scopes that are relevant
    // to the user & use case.
    this.httpClient.post(environment.loginLink,
      'grant_type=password&client_id=' + user
      + '&username=admin&password=' + pass
      + '&redirect_uri=' + environment.redirectUri + '/dashboard' + '&scope=' + environment.scopeUrl,
      { headers: header });
    this.oauthService.fetchTokenUsingPasswordFlow(user, pass, header);

    if (this.oauthService.hasValidAccessToken()) {
      this.router.navigate(['/dashboard']);
    }


  }

  getDepartmentList() {
    return this.httpClient.get<JSON>('../../assets/departments.json');
  }

  getBranchList() {
    return this.httpClient.get<JSON>('../../assets/branchlist.json');

  }
  // Initialize headers for the login section
  getLoginHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded ',
      'Accept': 'application/json'
    });
    return headers;
  }

  // TODO - check if function is in use, and delete if not being used
  postFHIRHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()

      // 'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      // 'Access-Control-Allow-Origin': '*'
    });
    return headers;
  }
}
