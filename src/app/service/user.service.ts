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

  selectedServiceRequestID;
  selectID = '';
  selectedIDForEmployeePostSummary = '';
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

  getEmployeeSummaryID(data) {
    this.selectedIDForEmployeePostSummary = data;
  }

  returnEmployeeSummaryID() {
    return this.selectedIDForEmployeePostSummary;
  }

  logout() {
    const header = this.getLogoutHeaders();

    this.httpClient.post(environment.logoutURI + '/session/token/revoke', 'token=' + this.oauthService.getAccessToken(), { headers: header})
      .subscribe(item => {
        console.log(item);
      }, err => {
        console.log(err);
      });

    this.oauthService.logOut();
    this.router.navigate(['']);

  }

  getLogoutHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return headers;
  }

  login(user: string, pass: string) {

    // Get headers for the login portion of the site
    const header = this.getLoginHeaders();

    // Posts a body containing the call for The “Resource Owner Password Credentials” Flow
    // This takes three inputs, a username and password, and a header.
    // scopeURL is an environment variable that a user sets, containing scopes that are relevant
    // to the user & use case.
    this.httpClient.post(environment.loginLink,
      'grant_type=password&client_id=NOHIS'
      + '&username=' + user + '&password=' + pass
      + '&redirect_uri=' + environment.redirectUri + '/dashboard' + '&scope=' + environment.scopeUrl,
      { headers: header });
    this.oauthService.fetchTokenUsingPasswordFlowAndLoadUserProfile(user, pass, header).then(() => {
      // console.log(this.oauthService.getIdentityClaims());
      this.router.navigate(['/dashboard']);
    }
    );
  }

  createAccount(data) {

    const header = this.getJsonAPIHeaders();

    return this.httpClient.post(
      environment.jsonAPI + '/user-management/Master/local_security' , data ,
      { headers: header }
    );
  }

  fetchCurrentUserData(sub) {

    const header = this.getJsonAPIHeaders();

    return this.httpClient.get( environment.jsonAPI + '/user-management/Master/local_security?searchTerm=' + sub  ,
    { headers: header });
  }

  getDepartmentList() {
    return this.httpClient.get<JSON>('../../assets/departments.json');
  }

  getBranchList() {
    return this.httpClient.get<JSON>('../../assets/branchlist.json');
  }

  fetchAllDistrictOffices() {
    return this.httpClient.get(environment.queryURI + '/Location', {headers: this.getHeaders()});
  }

  saveDistrictOffice(locationObj) {
    return this.httpClient.post(environment.queryURI + '/Location/', locationObj,
    {headers: this.postFHIRHeaders()});
  }

  saveClientDepartmentBranch(locationObj) {
    return this.httpClient.post(environment.queryURI + '/Location/', locationObj,
    {headers: this.postFHIRHeaders()});
  }

  fetchAllRegionalOffices() {
    return this.httpClient.get(environment.queryURI + '/Organization?type=team', {headers: this.getHeaders()});
  }

  fetchAllDepartmentNames() {
    return this.httpClient.get(environment.queryURI + '/Organization?type=CLIENTDEPT', {headers: this.getHeaders()});
  }

  fetchAllDepartmentBranches() {
    return this.httpClient.get(environment.queryURI + '/Location?type=DEPTBRANCH', {headers: this.getHeaders()});
  }

  savePractitioner(data) {
    return this.httpClient.post(environment.queryURI + '/Practitioner', data, { headers: this.postFHIRHeaders() });
  }

  savePractitionerRole(data) {
    return this.httpClient.post(environment.queryURI + '/PractitionerRole', data, { headers: this.postFHIRHeaders() });
  }

  getAllPatientsInSameDepartment(query: string) {
    return this.httpClient.get(environment.queryURI +
      '/Patient?workplace=' + query, { headers: this.getHeaders() });
  }

  getAllPractitioners() {
    return this.httpClient.get(environment.queryURI +
      '/Practitioner?_revinclude=PractitionerRole:code=admin', {
      headers: this.getHeaders()
    });
  }

  getPractitionerByID(query: string) {
    return this.httpClient.get(environment.queryURI + '/Practitioner/' + query, {
      headers: this.getHeaders()
    });
  }

  getAllPractitionerRoles() {
    return this.httpClient.get(environment.queryURI + '/PractitionerRole/', {
      headers: this.getHeaders()
    });
  }

  getPractitionerRoleByID(query: string) {
    return this.httpClient.get(environment.queryURI + '/PractitionerRole/' + query, {
      headers: this.getHeaders()
    });
  }

  getPractitionerRoleByPractitionerID(query: string) {
    return this.httpClient.get(environment.queryURI + '/PractitionerRole?practitioner=' + query, {
      headers: this.getHeaders()
    });
  }

  getAnyFHIRObjectByReference(query: string) {
    return this.httpClient.get(environment.queryURI + query, {
      headers: this.getHeaders()
    });
  }

  saveSelectedServiceRequestID(id) {
    this.selectedServiceRequestID = id;
  }
  getSelectedServiceRequestID(): string {
    return this.selectedServiceRequestID;
  }
  saveClientDepartment(data) {
    return this.httpClient.post(environment.queryURI + '/Organization/', data,
    {headers: this.postFHIRHeaders()});
  }
  fetchAllClientDepartments() {
    return this.httpClient.get(environment.queryURI + '/Organization?type=CLIENTDEPT', {headers: this.getHeaders()});
  }
  // TODO - check if function is in use, and delete if not being used
  postFHIRHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

 // Initialize headers for the login section
  getLoginHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    });
    return headers;
  }

  getJsonAPIHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

}
