import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

import { environment } from '../../environments/environment';

@Injectable()
export class UserService {

  constructor(private httpClient: HttpClient, private oauthService: OAuthService) { }


  // TODO Move all calls to FHIR resources into fhir.service.ts
  getPatientData(pid) {
    return this.httpClient.get<JSON>(environment.queryURI +
      '/Patient/' + pid, { headers: this.getHeaders() }).subscribe(data => console.log(data));

    // return this._http.get(environment.queryURI + '/Patient/' + pid, { headers: this.getHeaders() });
  }

  getAllPatientData() {
    return this.httpClient.get<JSON>(environment.queryURI +
      '/Patient/', { headers: this.getHeaders() }).subscribe(data => console.log(data));

  }

  postPatientData(patient) {
    this.httpClient.post(environment.queryURI + '/Patient/', patient, { headers: this.postFHIRHeaders() }).subscribe(
      data => {
        console.log('POST Request is successful ', data);
      },
      error => {
        console.log('Error', error);
      }
    );
  }

  createUserAccount(type: string) {
    
  }

  logout() {
    const header = this.getHeaders();

    this.httpClient.post(environment.logoutURI + '/logout?cb=none&revoke=token', {}, { headers: header, withCredentials: true })
      .subscribe(item => {
        console.log(item);
      }, err => {
        console.log(err);
      });
  }

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

  postFHIRHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken(),
      'Content-Type': 'application/json'
      // 'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      // 'Access-Control-Allow-Origin': '*'
    });
    return headers;
  }
}
