import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { delay } from 'rxjs/operators';


import * as $ from 'jquery';

import { v4 } from 'uuid';


const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

// import * as FHIR from 'fhir';

// Maintains a reference
// Auth (headers should have auth conetext, established by oauth 2)

@Injectable()
export class QuestionnaireService {

  public newServRespSubject = new BehaviorSubject<Object>(null);
  newServRespSubject$ = this.newServRespSubject.asObservable();

  public newServFormIdSubject = new BehaviorSubject<Object>(null);
  newServFormIdSubject$ = this.newServFormIdSubject.asObservable();


  constructor(private http: HttpClient, private oauthService: OAuthService) {}

  getForm(query: string) {
    // tslint:disable-next-line:max-line-length
    return this.http.get(environment.queryURI + '/Questionnaire/' + query, { headers: this.getHeaders() } );
  }
  

  saveRequest(data: any) {
    return this.http.post(environment.queryURI + '/QuestionnaireResponse', data, { headers: this.getHeaders() });
  }
  changeRequest(data: any) {
    return this.http.put(environment.queryURI + '/QuestionnaireResponse', data, { headers: this.getHeaders() });
  }
  

  getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
    return headers;
  }

  shareServiceResponseData(data) {
    this.newServRespSubject.next(data);
    console.log('service response object from service');
    console.log(data);
  }

  shareServiceFormId(data) {
    this.newServFormIdSubject.next(data);
    console.log('service response object from service');
    console.log(data);
  }

}
