import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

@Injectable()
export class PatientService {

  constructor(private httpClient: HttpClient, private oauthService: OAuthService) { }

  getAllPatientData() {
    return this.httpClient.get(environment.queryURI +
      '/Patient/', { headers: this.getHeaders() });
  }

  getPatientDataByID(pid) {
    return this.httpClient.get(environment.queryURI +
      '/Patient/' + pid, { headers: this.getHeaders() });
  }
  getPatientData(query: string) {
    return this.httpClient.get<JSON>(environment.queryURI +
      '/Patient' + query, { headers: this.getHeaders() });
  }

  getPatientByLinkID(query: string) {
    return this.httpClient.get<JSON>(environment.queryURI +
      '/Patient?dependentlink=' + query, { headers: this.getHeaders() });
  }

  postPatientData(patient) {
    return this.httpClient.post(environment.queryURI + '/Patient/', patient, { headers: this.postFHIRHeaders() });
  }

  sendObjecttoBundle(data) {
    return data;
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
