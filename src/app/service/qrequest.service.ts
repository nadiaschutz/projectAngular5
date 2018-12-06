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
    return this.http.get(environment.queryURI + '/QuestionnaireResponse' + query, { headers: header });
  }

  getServReqForClient(query: string) {
    const header = this.getHeaders();
    return this.http.get(environment.queryURI + '/QuestionnaireResponse?subject=Patient/' + query, { headers: header });
  }

  getHeaders(): HttpHeaders {
    const header = new HttpHeaders().set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return header;
  }

  getAllQuestionnaireResponseData(id: string) {
    const header = this.getHeaders();
    return this.http.get(environment.queryURI + '/QuestionnaireResponse?_id=' + id + '&_include=*', { headers: header });
  }

}
