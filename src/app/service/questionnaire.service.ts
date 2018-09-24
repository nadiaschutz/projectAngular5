import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

import { environment } from '../../environments/environment';

export class QuestionnaireService {

  constructor(private httpClient: HttpClient, private oauthService: OAuthService) { }
  getQuestionnaireData(pid) {
    return this.httpClient.get<JSON>(environment.queryURI +
      '/Quesntionnaire/' + pid, { headers: this.getHeaders() }).subscribe(data => console.log(data));

    // return this._http.get(environment.queryURI + '/Patient/' + pid, { headers: this.getHeaders() });
  }

  getAllPatientData() {
    return this.httpClient.get<JSON>(environment.queryURI +
      '/Questionnaire/', { headers: this.getHeaders() }).subscribe(data => console.log(data));

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
}

