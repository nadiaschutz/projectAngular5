import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

import { environment } from '../../environments/environment';

@Injectable()
export class UserService {

  constructor(private _http: HttpClient, private oauthService: OAuthService) { }

  getPatientData(pid) {
    return this._http.get(environment.queryURI + '/Patient/' + pid, { headers: this.getHeaders() });
  }

  logout() {
    const header = this.getHeaders();

    this._http.post(environment.logoutURI + '/logout?cb=none&revoke=token', {}, { headers: header, withCredentials: true })
      .subscribe(item => {
        console.log(item);
      }, err => {
        console.log(err);
      });
  }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': this.oauthService.authorizationHeader()
    });
  }
}
