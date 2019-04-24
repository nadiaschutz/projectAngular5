import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QrequestService {

  // private API_URL = 'https://thx.smilecdr.com:8000/';
  private API_URL = 'https://bcip.smilecdr.com/fhir-request/QuestionnaireResponse';

  constructor(private http: HttpClient, private oauthService: OAuthService) { }

  getData(query: string) {
    const header = this.getHeaders();
    // return this.http.get(environment.queryURI + '/QuestionnaireResponse' + query, { headers: header });
    return this.http.get(environment.queryURI + '/QuestionnaireResponse?' + query + '&identifier=SERVREQ', { headers: header });
  }

  getServReqForClient(query: string) {
    const header = this.getNoCacheHeaders();
    return this.http.get(environment.queryURI + '/QuestionnaireResponse?subject=Patient/' + query, { headers: header });
    // tslint:disable-next-line:max-line-length
    // return this.http.get(environment.queryURI + '/QuestionnaireResponse?subject=Patient/' + query + '&identifier=SERVREQ', { headers: header });
  }

  getHeaders(): HttpHeaders {
    const header = new HttpHeaders().set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return header;
  }

  getNoCacheHeaders() {
    const headers = new HttpHeaders({
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken(),
      'Cache-Control': 'no-cache'
    });
    return headers;
  }

  getAllQuestionnaireResponseData(id: string) {
    const header = this.getHeaders();
    return this.http.get(environment.queryURI + '/QuestionnaireResponse?_id=' + id + '&_include=*', { headers: header });
  }

}
