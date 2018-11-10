import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

@Injectable()
export class PatientService {

  constructor(private httpClient: HttpClient, private oauthService: OAuthService) { }

  getPatientData(pid) {
    return this.httpClient.get(environment.queryURI +
      '/Patient/' + pid, { headers: this.getHeaders() });
  }

  getPatientByQuery(query) {
    return this.httpClient.get(environment.queryURI +
      '/Patient/' + query, { headers: this.getHeaders() });
  }

  getPatientDataByName(name) {
    return this.httpClient.get(environment.queryURI +
      '/Patient?name=' + name, { headers: this.getHeaders() });
  }

  getPatientDataByDOB(dob) {
    return this.httpClient.get(environment.queryURI +
      '/Patient?birthdate=' + dob, { headers: this.getHeaders() });
  }

  getAllPatientData() {
    return this.httpClient.get<JSON>(environment.queryURI +
      '/Patient/', { headers: this.postFHIRHeaders() });
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

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

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
