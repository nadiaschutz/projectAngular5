import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

import * as Rx from 'rxjs';

@Injectable()
export class UserService {

  selectedServiceRequestID;
  selectID = '';
  selectedIDForEmployeePostSummary = '';
  userRoleInSession = '';
  showSpinner;
  showErrorFlag;
  constructor(
    private httpClient: HttpClient,
    private oauthService: OAuthService,
    private router: Router
  ) { }

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

    this.httpClient
      .post(
        environment.logoutURI + '/session/token/revoke',
        'token=' + this.oauthService.getAccessToken(),
        { headers: header }
      )
      .subscribe(
        item => {
          console.log(item);
        },
        err => {
          console.log(err);
        }
      );
    // TODO - remove this after designing cleaner solution
    sessionStorage.clear();
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
    this.showSpinner = !this.showSpinner;
    this.showErrorFlag = false;
    this.oauthService
      .fetchTokenUsingPasswordFlow(user, pass, header)
      .then(() => {
        return this.oauthService.loadUserProfile();
      })
      .then(() => {
        Promise.all([
          this.fetchCurrentRole(),
          this.fetchUserFHIRID(),
          this.fetchCurrentUserDept(),
          this.fetchCurrentUserBranch()
        ]).then(() => {
          this.showSpinner = !this.showSpinner;
          sessionStorage.setItem(
            'userName',
            this.oauthService.getIdentityClaims()['name']
          );
          setTimeout(() => {
            if (sessionStorage.getItem('userRole') === 'admin' || sessionStorage.getItem('userRole') === 'clinician') {
              this.router.navigate(['/adminhome']);
            } else if (sessionStorage.getItem('userRole') === 'manager' || sessionStorage.getItem('userRole') === 'superuser') {
              this.router.navigate(['/staff/list-page']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }, 500);
        });
      }).catch((err) => {
        this.showSpinner = !this.showSpinner;
        this.showErrorFlag = true;
        console.log(err);
      });
  }



  createAccount(data) {
    const header = this.getJsonAPIHeaders();

    return this.httpClient.post(
      environment.jsonAPI + '/user-management/Master/local_security',
      data,
      { headers: header }
    );
  }

  returnSpinner() {
    return this.showSpinner;
  }

  returnErrorFlag() {
    return this.showErrorFlag;
  }

  /**
   *  Fetches a user in SmileCDR based on the parameter passed
   * @param sub
   */
  fetchCurrentUserData(sub) {
    const header = this.getJsonAPIHeaders();

    return this.httpClient.get(
      environment.jsonAPI +
      '/user-management/Master/local_security?searchTerm=' +
      sub,
      { headers: header }
    );
  }

  /**
   * Queries the server, and finds a Practitioner object
   * related to the Smile user, based on the default launch context associated
   * with the user. The default launch context contains their FHIR resource ID.
   */
  fetchCurrentRole() {
    return new Promise((res, rej) => {
      this.fetchCurrentUserData(
        this.oauthService.getIdentityClaims()['sub']
      ).subscribe(
        user => {
          user['users'].forEach(element => {
            if (
              element['familyName'] ===
              this.oauthService.getIdentityClaims()['family_name'] &&
              element['givenName'] ===
              this.oauthService.getIdentityClaims()['given_name'] &&
              element['username'] ===
              this.oauthService.getIdentityClaims()['sub']
            ) {
              let pracID: any;

              if (element['defaultLaunchContexts']) {
                pracID = element['defaultLaunchContexts'][0]['resourceId'];

                this.getPractitionerRoleByPractitionerID(pracID).subscribe(
                  roledata => {
                    if (roledata['total'] > 0) {
                      roledata['entry'].forEach(roleElement => {
                        const individualEntry = roleElement.resource;
                        individualEntry['code'].forEach(role => {
                          role['coding'].forEach(rolecode => {
                            if (rolecode['code']) {
                              // this.newRoleSubject.next(rolecode['code']);
                              // sessionStorage.setItem('userRole', rolecode['code']);
                              this.setCurrentUserRole(rolecode['code']);
                            }
                          });
                        });
                      });
                    }
                  }
                );
              }
            }
          });
        },
        error => {
          console.log(error);
          rej();
        },
        () => {
          res();
        }
      );
    });
    // this.getUserRoleInSession();
  }

  /**
   * Queries the server, and finds a Practitioner object
   * related to the Smile user, based on the default launch context associated
   * with the user. The default launch context contains their FHIR resource ID.
   * Used to get the specific FHIR ID that we can pass as a reference in different
   * FHIR objects.
   */
  fetchUserFHIRID() {
    return new Promise((res, rej) => {
      this.fetchCurrentUserData(
        this.oauthService.getIdentityClaims()['sub']
      ).subscribe(
        user => {
          user['users'].forEach(element => {
            if (
              element['familyName'] ===
              this.oauthService.getIdentityClaims()['family_name'] &&
              element['givenName'] ===
              this.oauthService.getIdentityClaims()['given_name'] &&
              element['username'] ===
              this.oauthService.getIdentityClaims()['sub']
            ) {
              let pracID: any;
              if (element['defaultLaunchContexts']) {
                pracID = element['defaultLaunchContexts'][0]['resourceId'];
                this.setCurrentUserFHIRID(pracID);
              }
            }
          });
        },
        error => {
          console.log(error);
          rej();
        },
        () => {
          res();
        }
      );
    });
  }

  /**
   * Queries the server, and finds a PractitionerRole object
   * related to the Smile user, based on the default launch context associated
   * with the user. The default launch context contains their FHIR resource ID.
   * The PractitionerRole objects define what branch & location the User works under.
   */
  fetchCurrentUserDept() {
    return new Promise((res, rej) => {
      this.fetchCurrentUserData(
        this.oauthService.getIdentityClaims()['sub']
      ).subscribe(
        user => {
          const tempUser = this.oauthService.getIdentityClaims();
          user['users'].forEach(element => {
            if (
              element['familyName'] === tempUser['family_name'] &&
              element['givenName'] === tempUser['given_name'] &&
              element['username'] === tempUser['sub']
            ) {
              let pracID: any;
              if (element['defaultLaunchContexts']) {
                pracID = element['defaultLaunchContexts'][0]['resourceId'];
                this.getPractitionerRoleByPractitionerID(pracID).subscribe(
                  deptData => {
                    if (deptData['total'] > 0) {
                      deptData['entry'].forEach(deptElement => {
                        const individualEntry = deptElement.resource;
                        this.getAnyFHIRObjectByReference(
                          '/' + individualEntry['organization']['reference']
                        ).subscribe(role => {
                          if (!role['id'].includes('PSOHP')) {
                            this.setCurrentUserDept(role['name']);
                          }
                        });
                      });
                    }
                  }
                );
              }
            }
          });
        },
        error => {
          console.log(error);
          rej();
        },
        () => {
          res();
        }
      );
    });
  }

  fetchCurrentUserBranch() {
    return new Promise((res, rej) => {
      this.fetchCurrentUserData(
        this.oauthService.getIdentityClaims()['sub']
      ).subscribe(
        user => {
          const tempUser = this.oauthService.getIdentityClaims();
          user['users'].forEach(element => {
            if (
              element['familyName'] === tempUser['family_name'] &&
              element['givenName'] === tempUser['given_name'] &&
              element['username'] === tempUser['sub']
            ) {
              let pracID: any;
              if (element['defaultLaunchContexts']) {
                pracID = element['defaultLaunchContexts'][0]['resourceId'];
                this.getPractitionerRoleByPractitionerID(pracID).subscribe(
                  deptData => {
                    if (deptData['total'] > 0) {
                      deptData['entry'].forEach(deptElement => {
                        const individualEntry = deptElement.resource;
                        this.getAnyFHIRObjectByReference(
                          '/' + individualEntry['location'][0]['reference']
                        ).subscribe(role => {
                          this.setCurrentUserBranch(role['name']);
                        });
                      });
                    }
                  }
                );
              }
            }
          });
        },
        error => {
          console.log(error);
          rej();
        },
        () => {
          res();
        }
      );
    });
  }

  setCurrentUserRole(data: string) {
    sessionStorage.setItem('userRole', data);
  }

  setCurrentUserFHIRID(data: string) {
    sessionStorage.setItem('userFHIRID', data);
  }

  setCurrentUserName(data: string) {
    sessionStorage.setItem('userName', data);
  }

  setCurrentUserDept(data: string) {
    sessionStorage.setItem('userDept', data);
  }

  setCurrentUserBranch(data: string) {
    sessionStorage.setItem('userBranch', data);
  }


  getDepartmentList() {
    return this.httpClient.get<JSON>('../../assets/departments.json');
  }

  getBranchList() {
    return this.httpClient.get<JSON>('../../assets/branchlist.json');
  }

  fetchAllDistrictOffices() {
    return this.httpClient.get(environment.queryURI + '/Location?identifier=psohp-location', {
      headers: this.getHeaders()
    });
  }

  saveDistrictOffice(locationObj) {
    return this.httpClient.post(
      environment.queryURI + '/Location/',
      locationObj,
      { headers: this.postFHIRHeaders() }
    );
  }

  saveClientDepartmentBranch(locationObj) {
    return this.httpClient.post(
      environment.queryURI + '/Location/',
      locationObj,
      { headers: this.postFHIRHeaders() }
    );
  }

  fetchAllRegionalOffices() {
    return this.httpClient.get(
      environment.queryURI + '/Organization?type=team',
      { headers: this.getHeaders() }
    );
  }

  fetchAllDepartmentNames() {
    return this.httpClient.get(
      environment.queryURI + '/Organization?type=CLIENTDEPT',
      { headers: this.getHeaders() }
    );
  }

  fetchAllDepartmentBranches() {
    return this.httpClient.get(
      environment.queryURI + '/Location?type=DEPTBRANCH',
      { headers: this.getHeaders() }
    );
  }

  savePractitioner(data) {
    return this.httpClient.post(environment.queryURI + '/Practitioner', data, {
      headers: this.postFHIRHeaders()
    });
  }

  savePractitionerRole(data) {
    return this.httpClient.post(
      environment.queryURI + '/PractitionerRole',
      data,
      { headers: this.postFHIRHeaders() }
    );
  }

  getAllPatientsInSameDepartment(query: string) {
    return this.httpClient.get(
      environment.queryURI + '/Patient?workplace=' + query,
      { headers: this.getHeaders() }
    );
  }

  getAllPractitioners() {
    return this.httpClient.get(
      environment.queryURI +
      '/Practitioner?_revinclude=PractitionerRole:code=admin',
      {
        headers: this.getHeaders()
      }
    );
  }

  getPractitionerByID(query: string) {
    return this.httpClient.get(
      environment.queryURI + '/Practitioner/' + query,
      {
        headers: this.getHeaders()
      }
    );
  }

  getAllPractitionerRoles() {
    return this.httpClient.get(environment.queryURI + '/PractitionerRole/', {
      headers: this.getHeaders()
    });
  }

  getPractitionerRoleByID(query: string) {
    return this.httpClient.get(
      environment.queryURI + '/PractitionerRole/' + query,
      {
        headers: this.getHeaders()
      }
    );
  }

  getPractitionerRoleByPractitionerID(query: string) {
    return this.httpClient.get(
      environment.queryURI + '/PractitionerRole?practitioner=' + query,
      {
        headers: this.getHeaders()
      }
    );
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
    return this.httpClient.post(environment.queryURI + '/Organization/', data, {
      headers: this.postFHIRHeaders()
    });
  }

  fetchAllClientDepartments() {
    return this.httpClient.get(
      environment.queryURI + '/Organization?type=CLIENTDEPT',
      { headers: this.getHeaders() }
    );
  }

  postFHIRHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

  getJsonAPIHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

  // Initialize headers for the login section
  getLoginHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    });
    return headers;
  }

  getLogoutHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return headers;
  }
}
